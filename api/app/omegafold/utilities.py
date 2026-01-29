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
        return jsonify({"error": "Missing job name."}), 400
    if "proteinSequence" not in data:
        return jsonify({"error": "Missing protein sequence."}), 400
    if "numCycle" not in data:
        return jsonify({"error": "Missing number of cycles."}), 400
    if "pseudoMSAMask" not in data:
        return jsonify({"error": "Missing pseudo MSA mask rate."}), 400
    if "numPseudoMSAs" not in data:
        return jsonify({"error": "Missing number of pseudo MSAs."}), 400
    if "forceComputation" not in data:
        return jsonify({"error": "Missing force computation flag."}), 400
    if "makeResultsPublic" not in data:
        return jsonify({"error": "Missing make results public flag."}), 400
    if "email" not in data:
        return jsonify({"error": "Missing email address."}), 400

    if validate_job_name(data["jobName"]):
        return validate_job_name(data["jobName"])

    if validate_sequence(data["proteinSequence"]):
        return validate_sequence(data["proteinSequence"])

    if data["numCycle"] not in ["1", "2", "4", "8", "16", "32"]:
        return jsonify({"message": "Invalid number of cycles."}), 400

    if validate_numeric_input(data["numPseudoMSAs"]):
        return jsonify({"message": "Number of pseudo MSAs must be a number."}), 400

    if validate_numeric_input(data["pseudoMSAMask"]):
        return jsonify({"message": "Pseudo MSA mask rate must be a float number."}), 400

    if data["forceComputation"] not in [True, False]:
        return jsonify({"message": "Invalid force computation flag."}), 400

    if validate_email(data["email"]):
        return jsonify({"message": "Invalid email address."}), 400

    return None


def get_subbatch_size(L):
    """Get subbatch size based on the length of the protein sequence."""
    if L < 500: return 500
    if L < 1000: return 200
    return 150


def create_job_config(data, user):
    """Create job configuration dictionary."""
    simplename = create_simple_name(data["jobName"])
    uniquename = f"{simplename}-{generate_random_suffix()}"

    jobConfig = {
        "uniquename": uniquename,
        "simplename": data["jobName"],
        "outputDir": data["jobName"],
        "user": user,
        "input": f"/mnt/input/{user}/{data['jobName']}.fasta",
        "proteinSequence": data["proteinSequence"],
        "numCycle": data["numCycle"],
        "pseudoMsaMask": data["pseudoMSAMask"],
        "numPseudoMSAs": data["numPseudoMSAs"],
        "weights_file": "/data/omegafold/1.1.0/release1.pt",
        "forceComputation": data["forceComputation"],
        "makeResultsPublic": str(data["makeResultsPublic"]).lower(),
        "email": data["email"],
        "service": "OmegaFold",

        "container": Config.OMEGAFOLD_IMAGE,
        "nodeselector": "",
    }
    if data["proteinSequence"].find(":"):
        seqs = data["proteinSequence"].split(":")
        lengths = [len(s) for s in seqs]
        jobConfig["subbatchSize"] = get_subbatch_size(sum(lengths))
    else:
        jobConfig["subbatchSize"] = 150

    return jobConfig


def create_file_config(jobConfig):
    """Create file configuration dictionary."""
    fileConfig = {
        "user": jobConfig["user"],
        "name": jobConfig["simplename"],
        "subbatch_size": jobConfig["subbatchSize"],
        "num_cycle": jobConfig["numCycle"],
        "msa_mask_rate": jobConfig["pseudoMsaMask"],
        "num_msa": jobConfig["numPseudoMSAs"],
        "public": jobConfig["makeResultsPublic"],
        "service": jobConfig["service"]
    }

    return fileConfig


def create_job_object(jobConfig, user):
    """Create Kubernetes Job Object."""
    salt = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(64))
    ofArgs = f'mkdir -p /mnt/output/{user}/{jobConfig["outputDir"]} && /usr/local/bin/omegafold {jobConfig["input"]} /mnt/output/{user}/{jobConfig["outputDir"]} --num_cycle {jobConfig["numCycle"]} --subbatch_size {jobConfig["subbatchSize"]}  --weights_file {jobConfig["weights_file"]} --pseudo_msa_mask_rate {jobConfig["pseudoMsaMask"]} --num_pseudo_msa {jobConfig["numPseudoMSAs"]} 2>&1 | tee /mnt/output/{user}/{jobConfig["outputDir"]}/stdout && if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; then ln -sfr /mnt/output/{user}/{jobConfig["outputDir"]} /mnt/output/public/{jobConfig["outputDir"]} ; fi ; cd /mnt/output/{user} ; cp -r {jobConfig["outputDir"]} /storage ; zip -0 -r {jobConfig["outputDir"]}.zip {jobConfig["outputDir"]}; mv {jobConfig["outputDir"]}.zip {jobConfig["outputDir"]}/download-{salt}.zip ; if [ -s "/mnt/output/{user}/{jobConfig["outputDir"]}/"*.pdb ] ; then touch "/mnt/output/{user}/{jobConfig["outputDir"]}/omegafold.done"; fi; if [ ! -z "{jobConfig["email"]}" ]; then if [ -s "/mnt/output/{user}/{jobConfig["outputDir"]}/"*.pdb ] ; then echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:OmegaFold computation has finished\n\nYour OmegaFold computation "\"{jobConfig["simplename"]}\"" has finished, please visit {Config.BASE_URL}/result/{jobConfig["simplename"]} to view the result of your computation\n" | ssmtp -t; else echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:Omegafold computation has failed\n\nYour omegafold computation "\"{jobConfig["simplename"]}\"" has failed.\n" | cat - /mnt/output/{user}/{jobConfig["outputDir"]}/stdout | ssmtp -t;  fi; fi'

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
                    affinity=client.V1Affinity(
                        node_affinity=client.V1NodeAffinity(
                            required_during_scheduling_ignored_during_execution=client.V1NodeSelector(
                                node_selector_terms=[client.V1NodeSelectorTerm(
                                    match_expressions=[client.V1NodeSelectorRequirement(
                                        key="nvidia.com/gpu.product",
                                        operator="In",
                                        values=['NVIDIA-A100-80GB-PCIe', 'NVIDIA-H100-PCIe']
                                    )]
                                )]
                            )
                        )
                    ),
                    security_context=client.V1PodSecurityContext(
                        run_as_non_root=True,
                        seccomp_profile=client.V1SeccompProfile(type="RuntimeDefault"),
                        fs_group_change_policy="OnRootMismatch"
                    ),
                    containers=[
                        client.V1Container(
                            name=jobConfig["uniquename"],
                            image=jobConfig["container"],
                            image_pull_policy="IfNotPresent",
                            command=["bash"],
                            args=["-c",
                                  ofArgs],
                            env=[client.V1EnvVar(name="TF_FORCE_UNIFIED_MEMORY", value="1"),
                                 client.V1EnvVar(name="XLA_PYTHON_CLIENT_MEM_FRACTION", value="4.0")],
                            security_context=client.V1SecurityContext(
                                run_as_user=1000,
                                run_as_group=1000,
                                allow_privilege_escalation=False,
                                capabilities=client.V1Capabilities(drop=["ALL"]),
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
