import random
import string
from flask import jsonify
from kubernetes import client

from app.shared.input_validation import (
    validate_job_name,
    validate_sequence,
    validate_numeric_input,
    validate_email)
from app.shared.job_submitting import generate_random_suffix, create_simple_name
from config import Config


def validate_input(data):
    """Validate the input data."""
    if "jobName" not in data:
        return jsonify({"error": "Job name is missing."}), 400
    if "proteinSequence" not in data:
        return jsonify({"error": "Protein sequence is missing."}), 400
    if "numCopies" not in data:
        return jsonify({"error": "Number of copies is missing."}), 400
    if "numRecycles" not in data:
        return jsonify({"error": "Number of recycles is missing."}), 400
    if "forceComputation" not in data:
        return jsonify({"error": "Force computation flag is missing."}), 400
    if "makeResultsPublic" not in data:
        return jsonify({"error": "Make results public flag is missing."}), 400
    if "email" not in data:
        return jsonify({"error": "Email is missing."}), 400

    if validate_job_name(data["jobName"]):
        return validate_job_name(data["jobName"])

    if validate_sequence(data["proteinSequence"]):
        return validate_sequence(data["proteinSequence"])

    if validate_numeric_input(data["numCopies"]):
        return validate_numeric_input(data["numCopies"])

    if data["numRecycles"] not in ["0", "1", "3", "6", "12", "24"]:
        return jsonify({"error": "Number of recycles must be one of 0, 1, 3, 6, 12, or 24."}), 400

    if validate_email(data["email"]):
        return validate_email(data["email"])

    if data["forceComputation"] not in [True, False]:
        return jsonify({"error": "Force computation flag must be a boolean."}), 400

    if data["makeResultsPublic"] not in [True, False]:
        return jsonify({"error": "Make results public flag must be a boolean."}), 400

    return None


def create_job_config(data, user):
    """Create job configuration from the request data."""
    simplename = create_simple_name(data["jobName"])
    uniquename = f"{simplename}-{generate_random_suffix()}"

    jobConfig = {
        "uniquename": uniquename,
        "simplename": data["jobName"],
        "outputDir": data["jobName"],
        "user": user,
        "input": f"/mnt/input/{user}/{data['jobName']}.fasta",
        "proteinSequence": data["proteinSequence"],
        "numCopies": data["numCopies"],
        "numRecycles": data["numRecycles"],
        "makeResultsPublic": str(data["makeResultsPublic"]).lower(),
        "email": data["email"],
        "service": "ESMFold",
        "forceComputation": data["forceComputation"],

        "container": Config.ESMFOLD_IMAGE,
    }

    try:
        numCopies = int(data["numCopies"])
        if numCopies == 1:
            jobConfig["proteinSequence"] = data["proteinSequence"]
        else:
            jobConfig["proteinSequence"] = ":".join([data["proteinSequence"]] * numCopies)
    except:
        jobConfig["proteinSequence"] = data["proteinSequence"]

    return jobConfig


def create_file_config(jobConfig):
    """Create file configuration from the job configuration."""
    fileConfig = {
        "user": jobConfig["user"],
        "name": jobConfig["simplename"],
        "num_recycles": jobConfig["numRecycles"],
        "public": jobConfig["makeResultsPublic"],
        "copies": jobConfig["numCopies"],
        "service": jobConfig["service"]
    }

    return fileConfig


def create_job_object(jobConfig, user):
    """Create Kubernetes Job Object."""
    salt = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(64))
    esmfArgs = f'mkdir -p /mnt/output/{user}/{jobConfig["outputDir"]} && /usr/bin/esm-fold -i {jobConfig["input"]} -o /mnt/output/{user}/{jobConfig["outputDir"]} --num-recycles {jobConfig["numRecycles"]} -m /data/esmfold 2>&1 | tee /mnt/output/{user}/{jobConfig["outputDir"]}/stdout && if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; then ln -sfr /mnt/output/{user}/{jobConfig["outputDir"]} /mnt/output/public/{jobConfig["outputDir"]} ; fi ; cd /mnt/output/{user} ; cp -r {jobConfig["outputDir"]} /storage ; zip -0 -r {jobConfig["outputDir"]}.zip {jobConfig["outputDir"]}; mv {jobConfig["outputDir"]}.zip {jobConfig["outputDir"]}/download-{salt}.zip ; if [ -s "/mnt/output/{user}/{jobConfig["outputDir"]}/"*.pdb ] ; then touch "/mnt/output/{user}/{jobConfig["outputDir"]}/esmfold.done"; fi; if [ ! -z "{jobConfig["email"]}" ]; then if [ -s "/mnt/output/{user}/{jobConfig["outputDir"]}/"*.pdb ] ; then echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:ESMFold computation has finished\n\nYour ESMFold computation \"{jobConfig["simplename"]}\" has finished, please visit {Config.BASE_URL}/result/{jobConfig["simplename"]} to view the result of your computation\n" | ssmtp -t; else echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:ESMFold computation has failed\n\nYour ESMFold computation \"{jobConfig["simplename"]}\" has failed.\n" | cat - /mnt/output/{user}/{jobConfig["outputDir"]}/stdout | ssmtp -t;  fi; fi'

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(
            name=jobConfig["uniquename"],
            annotations={"user": jobConfig["user"], "simplename": jobConfig["simplename"],
                         "public": jobConfig["makeResultsPublic"]}),
        spec=client.V1JobSpec(
            ttl_seconds_after_finished=100,
            backoff_limit=0,
            template=client.V1PodTemplateSpec(
                spec=client.V1PodSpec(
                    restart_policy="Never",
                    security_context=client.V1PodSecurityContext(
                        run_as_non_root=True,
                        seccomp_profile=client.V1SeccompProfile(
                            type="RuntimeDefault"
                        ),
                        fs_group_change_policy="OnRootMismatch"
                    ),
                    containers=[
                        client.V1Container(
                            name=jobConfig["uniquename"],
                            image=jobConfig["container"],
                            image_pull_policy="IfNotPresent",
                            command=["bash"],
                            args=["-c",
                                  esmfArgs],
                            env=[
                                client.V1EnvVar(name="TF_FORCE_UNIFIED_MEMORY", value="1"),
                                client.V1EnvVar(name="XLA_PYTHON_CLIENT_MEM_FRACTION", value="4.0"),
                            ],
                            security_context=client.V1SecurityContext(
                                run_as_user=1000,
                                run_as_group=1000,
                                allow_privilege_escalation=False,
                                capabilities=client.V1Capabilities(
                                    drop=["ALL"]
                                ),
                            ),
                            resources=client.V1ResourceRequirements(
                                requests={"cpu": "4", "memory": "64Gi", "nvidia.com/gpu": "1"},
                                limits={"cpu": "4", "memory": "128Gi", "nvidia.com/gpu": "1"}
                            ),
                            volume_mounts=[client.V1VolumeMount(name="vol-1", mount_path="/data"),
                                           client.V1VolumeMount(name="vol-2", mount_path="/mnt"),
                                           client.V1VolumeMount(name="dshm", mount_path="/dev/shm"),
                                           client.V1VolumeMount(name="storage", mount_path="/storage")
                                           ],
                        )
                    ],
                    volumes=[client.V1Volume(name="vol-1",
                                             persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                                                 claim_name=Config.PVC_VOL1_ALPHAFOLD)),
                             client.V1Volume(name="vol-2",
                                             persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                                                 claim_name=Config.PVC_VOL2)),
                             client.V1Volume(name="dshm", empty_dir=client.V1EmptyDirVolumeSource(medium="Memory",
                                                                                                  size_limit="120Gi")),
                             client.V1Volume(name="storage",
                                             persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
                                                 claim_name=Config.PVC_STORAGE))
                             ],
                )
            )
        )
    )

    return job
