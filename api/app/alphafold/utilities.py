import logging

from app.shared.common import NAMESPACE
from app.shared.kubernetes import connect_to_k8s

from app.shared.job_submitting import check_job_uniqueness, create_k8s_job, create_input_files
from app.alphafold.job_config import create_alphafold2_job_config, create_alphafold2_file_config
from app.alphafold.k8s_job import create_alphafold2_k8s_config

# Connect to kubernetes cluster
batchApi = connect_to_k8s()


def deploy_alphafold2_job(data, user):
    """Deploy the computation to the Kubernetes cluster."""

    # Create job configuration from the request data
    jobConfig = create_alphafold2_job_config(data, user)

    # Create file configuration
    fileConfig = create_alphafold2_file_config(jobConfig)

    # Check the job uniqueness
    job_uniqueness_error = check_job_uniqueness(jobConfig, fileConfig, user)
    if job_uniqueness_error:
        return job_uniqueness_error
    logging.info("Job uniqueness checked")

    # Create Kubernetes Job Object
    job = create_alphafold2_k8s_config(jobConfig, user)

    # Submit Job to Kubernetes Cluster
    create_k8s_job(batchApi, NAMESPACE, job)

    # Create Input Files
    input_files_error = create_input_files(jobConfig, fileConfig, user)
    if input_files_error:
        return input_files_error

    return None
