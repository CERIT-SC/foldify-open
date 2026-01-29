import shutil
from flask import jsonify
import json
import os
import random
import string
from app.shared.common import get_input_path, get_working_directory, get_output_path
from app.shared.common import NAMESPACE
from kubernetes import client
from app.shared.kubernetes import connect_to_k8s
from app.shared.job_submitting import create_k8s_job
from config import Config
from app.shared.job_submitting import check_same_job_name
import shutil
from config import Config

import logging

batchApi = connect_to_k8s()

def clean_input_data(data):
    """Remove unnecessary data from the input JSON."""
    prediction_data = data.copy()
    try:

        # Remove the forceComputation key
        prediction_data.pop("forceComputation", None)

        # Remove the email
        prediction_data.pop("email", None)

        # Remove the public
        prediction_data.pop("public", None)

        # Remove the large input flag
        prediction_data.pop("largeInput", None)

        # Remove the precomputedMSA
        prediction_data.pop("precomputedMSA", None)

        # Remove the precomputedTemplates
        if "precomputedTemplates" in prediction_data:
            prediction_data.pop("precomputedTemplates", None)

        # Remove the numberOfTemplates
        if "numberOfTemplates" in prediction_data:
            prediction_data.pop("numberOfTemplates", None)
    except KeyError as e:
        logging.error(f"Error cleaning input data: {e}")
        return jsonify({"error": f"Error cleaning input data: {e}"}), 400

    return prediction_data

def save_input_config(data, user):
    json_path = get_input_path(data["name"], "json", user)
    public_json_path = get_input_path(data["name"], "json", "public")
    output_path = get_output_path(data["name"], user)
    public_output_path = get_output_path(data["name"], "public")
    base_dir = get_working_directory()
    path = os.path.join(base_dir, "input", user)

    if not os.path.exists(path):
        logging.info(f"Creating directory for new user: {path}")
        os.makedirs(path)
    
    if os.path.exists(json_path):
        if data["forceComputation"] is False:
            return jsonify({"error": "Job with this name already exists. Please choose a different name."}), 400
        
        try:
            # Remove the public symlink if it exists
            for path in (public_json_path, public_output_path):
                if os.path.exists(path):
                    os.unlink(path)
                    logging.info(f"Deleted public symlink for {data['name']}")
            # Delete output files, input files will be rewritten
            shutil.rmtree(output_path)
            logging.info(f"Deleted output files for {data['name']}")
        except FileNotFoundError:
            logging.error(f"Output files for {data['name']} do not exist.")
        except OSError as e:
            logging.error(f"Error deleting output files: {e}")

    # clean up the input data
    prediction_input = clean_input_data(data)
    try:
        with open(json_path, "w") as json_file:
            json_file.write(json.dumps(prediction_input, indent=4))
    except Exception as e:
        return jsonify({"error": f"Error saving input file: {e}"}), 400
    
    if data["public"]:
        public_json_path = get_input_path(data["name"], "json", "public")
        try:
            os.symlink(json_path, public_json_path)
        except FileExistsError:
            logging.info(f"Public symlink already exists: {public_json_path}")
            pass
        except Exception as e:
            return jsonify({"error": f"Error creating public symlink: {e}"}), 400
    
    return None
            
def create_job_object(data, user):
    """Create a Kubernetes job object from the input data."""

    salt=''.join(random.choice(string.ascii_letters + string.digits) for i in range(64))
    output_dir = f"/mnt/output/{user}/{data['name']}"
    input_json = f"/mnt/input/{user}/{data['name']}.json"
    stdout_log = f"{output_dir}/stdout"
    use_precomputed = data.get("precomputedMSA") or "precomputedTemplates" in data
    sanitised_name = data["name"].lower()

    mkdir_cmd = f"mkdir -p {output_dir}"
    if use_precomputed:
        mmseqs2_cmd = (
            f"python af3_mmseqs_scripts/add_mmseqs_msa.py "
            f"--input_json {input_json} --output_json {input_json}"
        )
        if "precomputedTemplates" in data:
            mmseqs2_cmd += f" --templates --num_templates {data['numberOfTemplates']}"
        mmseqs2_cmd += f" 2>&1 | tee {stdout_log}"
    else:
        mmseqs2_cmd = ""

    run_cmd = (
        f'python run_alphafold_k8s.py --json_path={input_json} --model_dir=/data/model --db_dir=/data/db --force_output_dir=True --metrics_output={output_dir}/metrics --output_dir={output_dir} 2>&1 | tee {stdout_log}'
    )
    public_symlink_cmd = (
        f'if [ "{data["public"]}" == "True" ] ; '
        f'then ln -sfr {output_dir} /mnt/output/public/{data["name"]} ; fi'
    )
    compression_cmd = (
        f'cd /mnt/output/{user} ; '
        f'cp -r {data["name"]} /storage; '
        f'zip -0 -r {data["name"]}.zip {data["name"]}; '
        f'mv {data["name"]}.zip {data["name"]}/download-{salt}.zip'
    )
    create_done_file_cmd = (
        f'if [ -s "{output_dir}/{sanitised_name}/{sanitised_name}_ranking_scores.csv" ] ; '
        f'then touch "{output_dir}/alphafold3.done"; fi'
    )
    email_notification_cmd = (
        f'if [ ! -z "{data["email"]}" ]; '
        f'echo "Sending email notification to {data["email"]}"; '
        f'then if [ -s "{output_dir}/{sanitised_name}/{sanitised_name}_ranking_scores.csv" ] ; '
        f'then echo -e "To:{data["email"]}\nFrom:{Config.EMAIL_FROM}\n'
        f'Subject:AlphaFold 3 computation has finished successfully\n\n'
        f'Your AlphaFold 3 computation \"{data["name"]}\" has finished, please visit {Config.BASE_URL}/result/{data["name"]} to view or download the result of your computation.\n" | ssmtp -t; '
        f'else echo -e '
        f'"To:{data["email"]}\nFrom:{Config.EMAIL_FROM}\n'
        f'Subject:AlphaFold 3 computation has failed\n\n'
        f'Your AlphaFold 3 computation \"{data["name"]}\" has failed.\n" '
        f'| cat - /mnt/output/{user}/{data["name"]}/stdout | ssmtp -t; exit 1; '
        f' fi; fi'
    )
    
    if mmseqs2_cmd != "":
        af3Args = " && ".join([mkdir_cmd, mmseqs2_cmd, run_cmd, public_symlink_cmd, compression_cmd, create_done_file_cmd, email_notification_cmd])
    else:
        af3Args = " && ".join([mkdir_cmd, run_cmd, public_symlink_cmd, compression_cmd, create_done_file_cmd, email_notification_cmd])

    # Unique job name with random lowercase letters
    unique_job_name = data["name"] + "-" + ''.join(random.choice(string.ascii_lowercase) for _ in range(5))
    unique_job_name = unique_job_name.lower()

        # Environment variables for separate cpu and gpu computation
    env_vars = [
        client.V1EnvVar(name="RUN_K8S_JOBS", value="1"),
        client.V1EnvVar(name="K8S_NAMESPACE", value=NAMESPACE),
        client.V1EnvVar(name="K8S_SERVICE_ACCOUNT", value="alphafold-jobs"),
        client.V1EnvVar(name="K8S_IMAGE", value=Config.ALPHAFOLD3_IMAGE),
        client.V1EnvVar(name="K8S_PVC_MOUNTS", value=f"{Config.PVC_VOL1_ALPHAFOLD3}:/data,{Config.PVC_VOL2}:/mnt,{Config.PVC_TMP}:/tmp"),
        client.V1EnvVar(name="K8S_JOB_NAME", value=unique_job_name),
    ]

        # Environment variables for unified memory computation
    if data["largeInput"]:
        logging.info("Large input selected. Using Unified Memory for computation.")
        env_vars.append(client.V1EnvVar(name="XLA_PYTHON_CLIENT_PREALLOCATE", value="false"))
        env_vars.append(client.V1EnvVar(name="TF_FORCE_UNIFIED_MEMORY", value="true"))
        env_vars.append(client.V1EnvVar(name="XLA_CLIENT_MEM_FRACTION", value="3.2"))

    # Define the job object
    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(
            annotations={"user": user, "simplename": data["name"], "public": str(data["public"])},
            name=unique_job_name,
            labels={"job-name": unique_job_name}),
        spec=client.V1JobSpec(
            ttl_seconds_after_finished=100,
            backoff_limit=0,
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(
                    labels={"job-name": unique_job_name}),
                spec=client.V1PodSpec(
                    service_account_name="alphafold-jobs",
                    restart_policy="Never",
                    security_context=client.V1PodSecurityContext(
                        run_as_non_root=True,
                        seccomp_profile=client.V1SeccompProfile(type="RuntimeDefault"),
                        fs_group_change_policy="OnRootMismatch"
                    ),
                    containers=[
                        client.V1Container(
                            image=Config.ALPHAFOLD3_IMAGE,
                            image_pull_policy="Always",
                            name="alphafold3",
                            command=["bash"],
                            args=["-c",
                                  af3Args],
                            resources=client.V1ResourceRequirements(
                                limits={"cpu": "1", "memory": "4Gi"},
                                requests={"cpu": "10m", "memory": "250Mi"}),
                            security_context=client.V1SecurityContext(
                                allow_privilege_escalation=False,
                                run_as_user=1000,
                                run_as_group=1000,
                                capabilities=client.V1Capabilities(drop=["ALL"]),
                            ),
                            volume_mounts=[client.V1VolumeMount(name="vol-1", mount_path="/data"),
                                            client.V1VolumeMount(name="vol-2", mount_path="/mnt"),
                                            client.V1VolumeMount(name="dshm", mount_path="/dev/shm"),
                                            client.V1VolumeMount(name="storage", mount_path="/storage"),
                                            client.V1VolumeMount(name="tmp", mount_path="/tmp") # Volume mount for separated CPU and GPU computation
                                            ],
                            env=env_vars,
                        )
                    ],
                    volumes=[client.V1Volume(name="vol-1", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL1_ALPHAFOLD3)),
                             client.V1Volume(name="vol-2", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL2)),
                             client.V1Volume(name="dshm", empty_dir=client.V1EmptyDirVolumeSource(medium="Memory", size_limit="120Gi")),
                             client.V1Volume(name="storage", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_STORAGE)),
                             client.V1Volume(name="tmp", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_TMP))
                             ],
                ),
                
            )

        ),
    )
    return job

def run_alphafold3_prediction(data, user):
    """Run the prediction job on the Kubernetes cluster."""

    try:
        job = create_job_object(data, user)
        create_k8s_job(batchApi, NAMESPACE, job)
        return jsonify({"message": f"Job {data['name']} created successfully."}), 200
    except Exception as e:
        logging.error(f"Error creating job: {e}")
        return jsonify({"error": f"Kubernetes job deployment failure: {e}"}), 400

def validate_json_name(json_object):
    """Validate the JSON object name."""
    if not json_object.get("name"):
        return None

    return json_object

def save_json_input(json_file, computation_config, user):
    """Save the JSON file to the server."""
    if json_file:
        json_object = json.load(json_file)
    else:
        return jsonify({"error": "No JSON file provided."}), 400

    logging.info(f"Computation config: {computation_config}")
    job_name = computation_config["name"]

    # Check if the alphafoldserver format contains only one job
    if isinstance(json_object, list):
        if len(json_object) > 1:
            return jsonify({"error": "The uploaded JSON file contains multiple jobs. Please submit each job separately."}), 400
        if len(json_object) == 0:
            return jsonify({"error": "The uploaded JSON file does not contain any job."}), 400

        # Change the name in the JSON to match the job name
        json_object[0]["name"] = job_name
        logging.info(f"Updated job name in JSON to: {json_object[0]['name']}")
    elif isinstance(json_object, dict):
        # Change the name in the JSON to match the job name
        json_object["name"] = job_name
        logging.info(f"Updated job name in JSON to: {json_object['name']}")
    else:
        return jsonify({"error": "The uploaded JSON file is not in a supported format. Please upload a JSON object or a list containing a single job."}), 400

    # Check if user has input directory
    base_dir = get_working_directory()
    path = os.path.join(base_dir, "input", user)
    
    if not os.path.exists(path):
        logging.info(f"Creating directory for new user: {path}")
        os.makedirs(path)

    # Check job name uniqueness
    if check_same_job_name(job_name, user):
        if computation_config["forceComputation"] is False:
            return jsonify({"error": f'Job with name "{job_name}" already exists. If you still want to run the computation, please check the Force Computation box in the form. This will delete all the previously computed data.'}), 400
        else:
            # Force computation: delete previous output files
            try:
                shutil.rmtree(get_output_path(job_name, user))
                logging.info(f"Deleted output files for {job_name}")
            except FileNotFoundError:
                logging.error(f"Output files for {job_name} do not exist.")
            except OSError as e:
                logging.error(f"Error deleting output files for {job_name}: {e}")


    # Define the input and output paths
    json_path = get_input_path(job_name, "json", user)
    public_json_path = os.path.join(job_name, "json", "public")
    # Save the JSON file    
    try:
        with open(json_path, "w") as file:
            file.write(json.dumps(json_object, indent=4))
    except Exception as e:
        if os.path.exists(json_path):
            os.remove(json_path)
        return jsonify({"error": f"Failed to save JSON file: {str(e)}"}), 500
    
    # Create symlink to the public directory for the public files
    if computation_config["public"] is True:
        # Create symlink to the public directory for the public files
        try:
            os.symlink(json_path, public_json_path)
        except FileExistsError:
            pass
        except Exception as e:
            return jsonify({"error": f"Failed to create public input files: {str(e)}"}), 500

    return None

def save_ccd_file(file, job_name, user):
    """Save the CCD file to the server."""
    if file:
        ccd_path = get_input_path(job_name+"-ccd", "cif", user)
        logging.info(f"Saving CCD file to {ccd_path}")
        try:
            with open(ccd_path, "wb") as f:
                f.write(file.read())
        except Exception as e:
            return jsonify({"error": f"Failed to save CCD file: {str(e)}"}), 500
    else:
        return jsonify({"error": "No CCD file provided."}), 400