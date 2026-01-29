import random
import string
from flask import jsonify
from kubernetes import client
import logging

from app.shared.input_validation import (
    validate_job_name,
    validate_sequence,
    validate_email)
from app.shared.job_submitting import create_simple_name, generate_random_suffix
from config import Config

def split_sequence_input(sequence_input):
    """Split the sequence input into individual sequences by '>' character."""
    try:
        sequences = sequence_input.split(">")
    except AttributeError:
        return None

    formatted_sequences = []
    for seq in sequences:
        if seq == "":
            continue
        else:
            seq = ">" + seq
            formatted_sequences.append(seq)
    
    return formatted_sequences

def validate_protein_input(sequence):
    """Validate the protein sequence input accroding to chosen model preset by the user."""
    
    sequences = split_sequence_input(sequence)
    if sequences is None:
        return jsonify({"error": "Invalid sequence input"}), 400
    for seq in sequences:
        if validate_sequence(seq):
            return validate_sequence(seq)
    
    return None

def validate_input(data):
    """Validate the input data."""
    if "jobName" not in data:
        return jsonify({"error": "Missing jobName parameter."}), 400
    if "proteinSequence" not in data:
        return jsonify({"error": "Missing proteinSequence parameter."}), 400
    if "numRelax" not in data:
        return jsonify({"error": "Missing numRelax parameter."}), 400
    if "msaMode" not in data:
        return jsonify({"error": "Missing msaMode parameter."}), 400
    if "pairMode" not in data:
        return jsonify({"error": "Missing pairMode parameter."}), 400
    if "modelPreset" not in data:
        return jsonify({"error": "Missing modelPreset parameter."}), 400
    if "numModels" not in data:
        return jsonify({"error": "Missing numModels parameter."}), 400
    if "numSeeds" not in data:
        return jsonify({"error": "Missing numSeeds parameter."}), 400
    if "email" not in data:
        return jsonify({"error": "Missing email parameter."}), 400
    if "version" not in data:
        return jsonify({"error": "Missing version parameter."}), 400
    if "forceComputation" not in data:
        return jsonify({"error": "Missing forceComputation parameter."}), 400
    if "makeResultsPublic" not in data:
        return jsonify({"error": "Missing makeResultsPublic parameter."}), 400

    if validate_job_name(data["jobName"]):
        return validate_job_name(data["jobName"])
    
    validateProteinInputError = validate_protein_input(data["proteinSequence"])
    if validateProteinInputError:
        return validateProteinInputError
    
    if int(data["numRelax"]) not in [0, 1, 5]:
        return jsonify({"error": "numRelax must be 0, 1, or 5."}), 400
    
    if data["templateMode"] not in ["none", "pdb70"]:
        return jsonify({"error": "Template mode must be 'none' or 'pdb70'."}), 400
    
    if data["msaMode"] not in ["mmseqs2_uniref_env", "mmseqs2_uniref", "single_sequence"]:
        return jsonify({"error": "MSA mode must be 'mmseqs2_uniref_env', 'mmseqs2_uniref', or 'single_sequence'."}), 400
    
    if data["pairMode"] not in ["unpaired", "unpaired_paired", "paired"]:
        return jsonify({"error": "Pair mode must be 'unpaired', 'unpaired_paired', or 'paired'."}), 400
    
    if data["modelPreset"] not in ["auto", "alphafold2", "alphafold2_ptm", "alphafold2_multimer_v1", "alphafold2_multimer_v2", "alphafold2_multimer_v3"]:
        return jsonify({"error": "Model preset must be 'auto', 'alphafold2', 'alphafold2_ptm', 'alphafold2_multimer_v1', 'alphafold2_multimer_v2', or 'alphafold2_multimer_v3'."}), 400
    
    if data["numModels"] not in ["5", "4", "3", "2", "1"]:
        return jsonify({"error": "Number of models must be 5, 4, 3, 2, or 1."}), 400
    
    if data["numRecycles"] not in ["auto", "0", "1", "3", "6", "12", "24", "48"]:
        return jsonify({"error": "Number of Recycles value must be a number."}), 400
    
    if data["recycleTolerance"] not in ["auto", "0.0", "0.5", "1.0"]:
        return jsonify({"error": "Recycle Tolerance value must be a number."}), 400
    
    if data["maxMSA"] not in ["auto", "512:1024", "256:512", "64:128", "32:64", "16:32"]:
        return jsonify({"error": "Max MSA must be '512:1024', '1024:2048', or 'auto'."}), 400
    
    if data["numSeeds"] not in ["1", "2", "4", "8", "16"]:
        return jsonify({"error": "Number of seeds must be 1, 2, 4, 8 or 16."}), 400

    if validate_email(data["email"]):
        return validate_email(data["email"])
    
    if data["version"] not in ["Colabfold 1.5.2"]:
        return jsonify({"error": "Version must be 'Colabfold 1.5.2'."}), 400
    
    if data["forceComputation"] not in [True, False]:
        return jsonify({"error": "Force computation must be True or False."}), 400
    
    if data["makeResultsPublic"] not in [True, False]:
        return jsonify({"error": "Make results public must be True or False."}), 400
    
    if data["useDropout"] not in [True, False]:
        return jsonify({"error": "Use dropout must be True or False."}), 400
    
    return None

def create_job_config(data, user):
    """Create job configuration from the request data."""
    simplename = create_simple_name(data["jobName"])
    uniquename = f"{simplename}-{generate_random_suffix()}"
    
    jobConfig = {
        "uniquename": uniquename,
        "simplename": data["jobName"],
        "user": user,
        "input": f"/mnt/input/{user}/{data['jobName']}.fasta",
        "proteinSequence": data["proteinSequence"],
        "numRelax": data["numRelax"],
        "msaMode": data["msaMode"],
        "pairMode": data["pairMode"],
        "modelPreset": data["modelPreset"],
        "numModels": data["numModels"],
        "numSeeds": data["numSeeds"],
        "email": data["email"],
        "version": data["version"],
        "forceComputation": data["forceComputation"],
        "makeResultsPublic": str(data["makeResultsPublic"]).lower(),
        "service": "ColabFold",

        "container": Config.COLABFOLD_IMAGE,
        "nodeselector": "",
    }

    if data["templateMode"] != 'none':
        jobConfig["templateMode"] = '--template'
    else:
        jobConfig["templateMode"] = ''

    if data["maxMSA"] == 'auto':
        jobConfig["maxMSA"] = ''
    else:
        jobConfig["maxMSA"] = f'--max_msa {data["maxMSA"]}'
    
    if data["useDropout"]:
        jobConfig["useDropout"] = '--use_dropout'
    else:
        jobConfig["useDropout"] = ''

    if data["numRecycles"] == 'auto':
        if data["modelPreset"] == 'alphafold2_multimer_v3':
            jobConfig["numRecycles"] = '20'
        else:
            jobConfig["numRecycles"] = '3'
    else:
        jobConfig["numRecycles"] = data["numRecycles"]
    
    if data["recycleTolerance"] == 'auto':
        if data["modelPreset"] == 'alphafold2_multimer_v3':
            jobConfig["recycleTolerance"] = '0.5'
        else:
            jobConfig["recycleTolerance"] = '0.0'
    else:
        jobConfig["recycleTolerance"] = data["recycleTolerance"]

    return jobConfig

def create_file_config(jobConfig):
    """Create file configuration from the job configuration."""
    fileConfig = {
        "user": jobConfig["user"],
        "name": jobConfig["simplename"],
        "modelpreset": jobConfig["modelPreset"],
        "num_relax": jobConfig["numRelax"],
        "template_mode": jobConfig["templateMode"],
        "msa_mode": jobConfig["msaMode"],
        "num_models": jobConfig["numModels"],
        "max_msa": jobConfig["maxMSA"],
        "pair_mode": jobConfig["pairMode"],
        "use_dropout": jobConfig["useDropout"],
        "num_recycles": jobConfig["numRecycles"],
        "num_seeds": jobConfig["numSeeds"],
        "recycle_early_stop_tolerance": jobConfig["recycleTolerance"],
        "public": jobConfig["makeResultsPublic"],
        "service": jobConfig["service"]
    }

    return fileConfig

def create_job_object(jobConfig, user):
    """Create a Kubernetes Job object."""
    salt=''.join(random.choice(string.ascii_letters + string.digits) for i in range(64))
    cfArgs = f'mkdir -p /mnt/output/{user}/{jobConfig["simplename"]} && /opt/conda/bin/colabfold_batch {jobConfig["input"]} /mnt/output/{user}/{jobConfig["simplename"]} --model-type {jobConfig["modelPreset"]} --use-gpu-relax --num-relax {jobConfig["numRelax"]} {jobConfig["templateMode"]} --msa-mode {jobConfig["msaMode"]} {jobConfig["maxMSA"]} --pair-mode {jobConfig["pairMode"]} {jobConfig["useDropout"]} --recycle-early-stop-tolerance {jobConfig["recycleTolerance"]} --num-recycle {jobConfig["numRecycles"]} --num-models {jobConfig["numModels"]} --num-seeds {jobConfig["numSeeds"]} --host-url http://colabsearch.colabsearch-ns.svc.cluster.local 2>&1 | tee /mnt/output/{user}/{jobConfig["simplename"]}/stdout && if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; then ln -sfr /mnt/output/{user}/{jobConfig["simplename"]} /mnt/output/public/{jobConfig["simplename"]} ; fi ; cd /mnt/output/{user} ; cp -r {jobConfig["simplename"]} /storage ; zip -0 -r {jobConfig["simplename"]}.zip {jobConfig["simplename"]}; mv {jobConfig["simplename"]}.zip {jobConfig["simplename"]}/download-{salt}.zip ; cd "/mnt/output/{user}/{jobConfig["simplename"]}"; if ls *.done.txt ; then touch "/mnt/output/{user}/{jobConfig["simplename"]}/colabfold.done"; fi; if [ ! -z "{jobConfig["email"]}" ]; then cd "/mnt/output/{user}/{jobConfig["simplename"]}"; if ls *.done.txt ; then echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:ColabFold computation has finished\n\nYour ColabFold computation \"{jobConfig["simplename"]}\" has finished, please visit {Config.BASE_URL}/result/{jobConfig["simplename"]} to view the result of your computation\n" | ssmtp -t; else echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\nSubject:Colabfold computation has failed\n\nYour ColabFold computation \"{jobConfig["simplename"]}\" has failed.\n" | cat - /mnt/output/{user}/{jobConfig["simplename"]}/stdout | ssmtp -t;  fi; fi'

    if len(jobConfig['proteinSequence']) > 5000:
        logging.info(f"Large sequence detected ({len(jobConfig['proteinSequence'])} residues), allocating more resources.")
        memory_limit = "256Gi"
        cpu_limit = "8"
    else:
        memory_limit = "128Gi"
        cpu_limit = "4"

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(
            name=jobConfig["uniquename"],
            annotations={"user": jobConfig["user"], "simplename": jobConfig["simplename"], "public": jobConfig["makeResultsPublic"]}),
        spec=client.V1JobSpec(
            ttl_seconds_after_finished=100,
            backoff_limit=0,
            template=client.V1PodTemplateSpec(
                spec=client.V1PodSpec(
                    restart_policy="Never",
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
                                  cfArgs],
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
                                limits={"cpu": cpu_limit, "memory": memory_limit, "nvidia.com/gpu": "1"}
                            ),
                            volume_mounts=[client.V1VolumeMount(name="vol-1", mount_path="/data"),
                                            client.V1VolumeMount(name="vol-2", mount_path="/mnt"),
                                            client.V1VolumeMount(name="dshm", mount_path="/dev/shm"),
                                            client.V1VolumeMount(name="storage", mount_path="/storage")
                                            ],
                        )
                    ],
                    volumes=[client.V1Volume(name="vol-1", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL1_ALPHAFOLD)),
                             client.V1Volume(name="vol-2", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL2)),
                             client.V1Volume(name="dshm", empty_dir=client.V1EmptyDirVolumeSource(medium="Memory", size_limit="120Gi")),
                             client.V1Volume(name="storage", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_STORAGE))
                             ],
                )
            )
        )
    )

    return job
