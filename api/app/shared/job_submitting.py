import json
import re
import os
import random
import string
from flask import jsonify
from kubernetes import client
import logging
import shutil

from app.shared.common import get_input_path, get_jobs_list, get_working_directory, get_output_path, get_input_dir
from app.shared.kubernetes import get_running_jobs


def generate_salt(length=64):
    """Generate a random salt for the job."""
    return ''.join(random.choice(string.ascii_letters + string.digits) for i in range(length))


def create_simple_name(name):
    """Create a simple name from the job name."""
    return name.lower()


def generate_random_suffix(length=5):
    """Generate a random suffix for the job name."""
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))


def check_same_job_name(name, user):
    """Check if the job name already exists."""
    for job in get_jobs_list(user):
        if job == name:
            return True

    return False


def check_same_job_sequence(sequence, user):
    """Check if another job with the same protein sequence exists in the input files."""

    original_sequence = sequence.split("\n")

    input_dir_path = get_input_dir(user)
    if not os.path.exists(input_dir_path):
        return None

    matching_sequence_jobs = []

    for file in os.listdir(input_dir_path):
        if file.endswith(".fasta"):
            fasta_file_path = os.path.join(input_dir_path, file)
            try:
                with open(fasta_file_path, "r") as f:
                    file_sequence = f.read()
                    file_sequence = file_sequence.split("\n")

                    if len(original_sequence) != len(file_sequence):
                        continue

                    if len(original_sequence) > 1 and len(original_sequence) % 2 == 0:
                        for i in range(1, len(original_sequence), 2):
                            if original_sequence[i].strip() != file_sequence[i].strip():
                                break
                        else:
                            matching_sequence_jobs.append(file[:-6])
                    else:
                        if original_sequence[1].strip() == file_sequence[1].strip():
                            matching_sequence_jobs.append(file[:-6])

            except Exception as e:
                logging.error(f"Error reading fasta file {fasta_file_path}: {e}")

    if matching_sequence_jobs:
        return matching_sequence_jobs

    return None


def check_same_job_settings(input_config, matching_sequence_jobs, user):
    """Check if another job with the same settings exists in the input files."""

    input_config_copy = input_config.copy()
    input_config_copy.pop("name")

    matching_settings_jobs = []

    for job in matching_sequence_jobs:
        job_config_path = get_input_path(job, "json", user)

        try:
            with open(job_config_path) as f:
                job_config = json.load(f)
                job_config.pop("name")

            if job_config == input_config_copy:
                matching_settings_jobs.append(job)

        except FileNotFoundError:
            logging.error(f"Job config file not found for job {job} at path {job_config_path}.")
            continue

    if matching_settings_jobs:
        return matching_settings_jobs

    return None


def check_if_job_running(name, user):
    """Check if a job with the given name is currently running for the user."""
    running_jobs = get_running_jobs(user)

    for job in running_jobs:
        if job[0] == name:
            return True
    return False


def check_job_uniqueness(jobConfig, fileConfig, user):
    """Check if the job name or protein sequence already exists."""

    job_name = jobConfig["simplename"]
    force_computation = jobConfig["forceComputation"]
    sequence = jobConfig["proteinSequence"]
    same_name = check_same_job_name(job_name, user)

    if same_name and not force_computation:
        logging.info(f'Job name {job_name} already exists for user {user}. User did not request force computation.')
        return jsonify({
            "error": f'Job with name **{job_name}** already exists.  \nChange the name of the job or check the **Force Computation** box in the form - *Force Computation will delete existing output files of the original job*.'}), 400

    if same_name and force_computation:
        logging.info(f'Job name {job_name} already exists for user {user}. User requested force computation.')

        is_running = check_if_job_running(job_name, user)
        if is_running:
            logging.info(f'Job name {job_name} is currently running for user {user}. Cannot force compute.')
            return jsonify({
                "error": f"Cannot force compute this job. A job with the name **{job_name}** is currently running. Please wait for it to finish or contact us at k8s@ics.muni.cz if you'd like to terminate it."}), 400

        # Delete output files
        try:
            shutil.rmtree(get_output_path(job_name, user))
            logging.info(f'Successfully deleted output files for {job_name}')
            return None
        except FileNotFoundError:
            logging.error(f'Could not find output files to delete in case of force computation for {job_name}.')
            return None
        except OSError as e:
            logging.error(f'Error deleting output files for {job_name}: {e}')
            return jsonify({
                "error": f"Error deleting output files for {job_name}. Please contact us at k8s@ics.muni.cz. Error: {str(e)}"}), 500

    if job_name.startswith("MULTIFOLD"):
        logging.info(f'Job {job_name} is a MULTIFOLD job. Skipping sequence and settings uniqueness checks.')
        return None

    matching_sequence_jobs = check_same_job_sequence(sequence, user)
    if not matching_sequence_jobs:
        return None

    matching_settings_jobs = check_same_job_settings(fileConfig, matching_sequence_jobs, user)
    if not matching_settings_jobs:
        return None

    if matching_settings_jobs and not force_computation:
        logging.info(
            f'Job with the same protein sequence and settings already exists under: {matching_settings_jobs}. User did not request force computation.')
        return jsonify({
            "error": f"Job(s) with the same protein **sequence** and **settings** already exist under:  \n*{', '.join(matching_settings_jobs)}*.  \n \nIf you still want to run the computation, please check the **Force Computation** box in the form."}), 400

    if matching_settings_jobs and force_computation:
        logging.info(
            f'Job with the same protein sequence and settings already exists under: {matching_settings_jobs}. User requested force computation.')
        return None

    return None


def create_k8s_job(batchApi, namespace, job):
    """Submit the job to the Kubernetes cluster."""
    try:
        batchApi.create_namespaced_job(namespace, job)
        logging.info(f"Job {job.metadata.name} successfully deployed.")
    except client.exceptions.ApiException as e:
        raise e
    except Exception as e:
        raise Exception(f"Kubernetes job deployment failure: {str(e)}")


def create_input_files(jobConfig, fileConfig, user):
    fasta_path = get_input_path(jobConfig["simplename"], "fasta", user)
    json_path = get_input_path(jobConfig["simplename"], "json", user)
    base_dir = get_working_directory()
    path = os.path.join(base_dir, "input", user)

    if not os.path.exists(path):
        logging.info(f"Creating directory for new user: {path}")
        try:
            os.makedirs(path)
        except Exception as e:
            logging.error(f"Failed to create directory {path}: {e}")
            return jsonify({"error": f"Failed to create directory {path}: {str(e)}"}), 500
    logging.info(f"Input directory exists: {path}")

    if os.path.exists(json_path):
        if jobConfig["forceComputation"] is False:
            return jsonify({"error": "Job with this name already exists. Please choose a different name."}), 400
        else:
            try:
                shutil.rmtree(get_output_path(jobConfig["simplename"], user))
                logging.info(f'Deleted output files for {jobConfig["simplename"]}')
                return None
            except FileNotFoundError:
                logging.error(f'Output files for {jobConfig["simplename"]} do not exist.')
            except OSError as e:
                logging.error(f'Error deleting output files for {jobConfig["simplename"]}: {e}')

    try:
        with open(fasta_path, "w") as f:
            f.write(f"{jobConfig['proteinSequence']}")

        with open(json_path, "w") as f:
            f.write(json.dumps(fileConfig, indent=4))

    except Exception as e:
        return jsonify({"error": f"Failed to create input files: {str(e)}"}), 500

    # Create symlink to the public directory for the public files
    if jobConfig["makeResultsPublic"] == "true":
        public_fasta_path = get_input_path(jobConfig["simplename"], "fasta", "public")
        public_json_path = get_input_path(jobConfig["simplename"], "json", "public")

        try:
            os.symlink(fasta_path, public_fasta_path)
            os.symlink(json_path, public_json_path)
        except FileExistsError:
            pass
        except Exception as e:
            return jsonify({"error": f"Failed to create public input files: {str(e)}"}), 500

    return None
