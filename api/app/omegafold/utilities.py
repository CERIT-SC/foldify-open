import logging
import random
import shlex
import string
from flask import jsonify
from kubernetes import client

from app.shared.input_validation import (
    validate_job_name,
    validate_sequence,
    validate_numeric_input,
    validate_email)
from app.shared.job_submitting import generate_random_suffix, create_simple_name
from app.shared.email_notifications import success_email_cmd, failure_email_cmd
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
    if ":" in data["proteinSequence"]:
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
    try:
        def shell_quote(value):
            return shlex.quote("" if value is None else str(value))

        salt = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(64))
        email_quoted = shell_quote(jobConfig.get("email", ""))
        output_dir_quoted = shell_quote(jobConfig["outputDir"])
        user_quoted = shell_quote(user)
        success_email = success_email_cmd(
            email_quoted,
            "OmegaFold computation has finished",
            f'Your OmegaFold computation {shell_quote(jobConfig["simplename"])} has finished, please visit '
            f'{shell_quote(Config.BASE_URL)}/result/{shell_quote(jobConfig["simplename"])} to view the result of your computation'
        )
        failure_email = failure_email_cmd(
            email_quoted,
            "Omegafold computation has failed",
            f'Your omegafold computation {shell_quote(jobConfig["simplename"])} has failed.',
            f'/mnt/output/{user_quoted}/{output_dir_quoted}/stdout'
        )
        ofArgs = f'mkdir -p /mnt/output/{user_quoted}/{output_dir_quoted} && /usr/local/bin/omegafold {shell_quote(jobConfig["input"])} /mnt/output/{user_quoted}/{output_dir_quoted} --num_cycle {shell_quote(jobConfig["numCycle"])} --subbatch_size {shell_quote(jobConfig["subbatchSize"])}  --weights_file {shell_quote(jobConfig["weights_file"])} --pseudo_msa_mask_rate {shell_quote(jobConfig["pseudoMsaMask"])} --num_pseudo_msa {shell_quote(jobConfig["numPseudoMSAs"])} 2>&1 | tee /mnt/output/{user_quoted}/{output_dir_quoted}/stdout && if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; then ln -sfr /mnt/output/{user_quoted}/{output_dir_quoted} /mnt/output/public/{output_dir_quoted} ; fi ; if [ -f "{Config.README_OMEGAFOLD}" ]; then cp "{Config.README_OMEGAFOLD}" /mnt/output/{user_quoted}/{output_dir_quoted}/README.md; fi ; cd /mnt/output/{user_quoted} ; cp -r {output_dir_quoted} /storage ; zip -0 -r {output_dir_quoted}.zip {output_dir_quoted}; mv {output_dir_quoted}.zip {output_dir_quoted}/download-{salt}.zip ; if [ -s "/mnt/output/{user_quoted}/{output_dir_quoted}/"*.pdb ] ; then touch "/mnt/output/{user_quoted}/{output_dir_quoted}/omegafold.done"; fi; if [ ! -z {email_quoted} ]; then if [ -s "/mnt/output/{user_quoted}/{output_dir_quoted}/"*.pdb ] ; then {success_email}; else {failure_email}; fi; fi'

        logging.info(f"OmegaFold: qouted args: {ofArgs}")

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
                                           client.V1VolumeMount(name="storage", mount_path="/storage"),
                                           client.V1VolumeMount(name="ssmtp-config", mount_path="/etc/ssmtp", read_only=True)
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
                                                 claim_name=Config.PVC_STORAGE)),
                             client.V1Volume(name="ssmtp-config", secret=client.V1SecretVolumeSource(secret_name=Config.SSMTP_SECRET, items=[client.V1KeyToPath(key="ssmtp.conf", path="ssmtp.conf")]))
                             ],
                )
            )
        )
    )
    except KeyError:
        logging.exception(
            f"OmegaFold: Missing job configuration key while creating job object for user={user} job={jobConfig.get('simplename')} unique={jobConfig.get('uniquename')}")
        raise
    except Exception:
        logging.exception(
            f"OmegaFold: Unexpected failure while creating job object for user {user} job={jobConfig.get('simplename')} unique={jobConfig.get('uniquename')}")
        raise

    return job
