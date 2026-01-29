import os
from kubernetes import client, config

from app.shared.common import NAMESPACE
import logging

def connect_to_k8s():
    """Connect to kubernetes cluster"""
    try:
        if os.getenv('KUBERNETES_SERVICE_HOST') and os.getenv('KUBERNETES_SERVICE_PORT'):
            # Running inside a Kubernetes cluster
            config.load_incluster_config()
        else:
            # Running outside a Kubernetes cluster, load local kube config
            config.load_kube_config()
    except Exception as e:
        logging.error(f"Failed to load Kubernetes configuration: {e}")
        return None

    batchApi = client.BatchV1Api()
    return batchApi

def get_job_status(job):
    """Determine the status of the job."""
    if job.status.active is not None and job.status.active > 0:
        return "Running"
    elif job.status.succeeded is not None and job.status.succeeded > 0:
        return "Success"
    elif job.status.failed is not None and job.status.failed > 0:
        return "Failed"
    return "Waiting..."

def get_pod_status(pods, job_name):
    """Find the pod status for the job."""
    for pod in pods:
        if pod.metadata.labels.get("job-name") == job_name:
            return pod.status.phase
    return "Waiting..."

def get_running_jobs(current_user):
    """Get the list of running jobs for the user."""

    # Initialize the Kubernetes API
    batchApi = connect_to_k8s()
    podApi = client.CoreV1Api()
    
    running_jobs_array = []

    try:
        # Get all jobs and pods in the namespace
        jobs = batchApi.list_namespaced_job(NAMESPACE).items
        pods = podApi.list_namespaced_pod(NAMESPACE).items

        # Filter the jobs for the current user
        for job in jobs:
            if job.metadata.annotations and job.metadata.annotations.get("user") == current_user:
                job_name = job.metadata.annotations.get("simplename")
                job_status = get_job_status(job)
                pod_status = get_pod_status(pods, job.metadata.name)
                if pod_status == "Pending":
                    pod_status = "Queued"
            
                if job_status == "Failed":
                    pod_status = "Failed"
            
                running_jobs_array.append([job_name, job_status, pod_status])
    except Exception as e:
        logging.error(f"Failed to list jobs: {e}")
        return []

    return running_jobs_array