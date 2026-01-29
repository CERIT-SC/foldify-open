import os
import pytest
import logging

from unittest.mock import patch, MagicMock

from app.shared.kubernetes import connect_to_k8s, get_job_status, get_pod_status, get_running_jobs
from app.shared.common import NAMESPACE

@pytest.fixture
def mock_k8s_client():
    """Mock the Kubernetes client."""
    with patch("app.shared.kubernetes.client.BatchV1Api") as mock_batch_api, \
         patch("app.shared.kubernetes.client.CoreV1Api") as mock_core_api, \
         patch("app.shared.kubernetes.config.load_kube_config"), \
         patch("app.shared.kubernetes.config.load_incluster_config"):
        
        mock_batch = MagicMock()
        mock_core = MagicMock()
        mock_batch_api.return_value = mock_batch
        mock_core_api.return_value = mock_core
        yield mock_batch, mock_core

def test_connect_to_k8s_outside_cluster():
    """Test connecting to Kubernetes outside the cluster."""
    with patch.dict(os.environ, {}, clear=True), \
         patch("app.shared.kubernetes.config.load_kube_config") as mock_kube_config, \
         patch("app.shared.kubernetes.client.BatchV1Api") as mock_batch_api:
        
        batch_api = MagicMock()
        mock_batch_api.return_value = batch_api

        result = connect_to_k8s()
        mock_kube_config.assert_called_once()
        assert result == batch_api

def test_connect_to_k8s_config_exception():
    """Test failure case for Kubernetes config loading."""
    with patch("app.shared.kubernetes.config.load_kube_config", side_effect=Exception("Config error")), \
         patch("app.shared.kubernetes.logging.error") as mock_log:

        result = connect_to_k8s()
        assert result is None
        mock_log.assert_called_with("Failed to load Kubernetes configuration: Config error")

def test_get_job_status():
    """Test job status determination."""
    job = MagicMock()
    
    job.status.active = 1
    job.status.succeeded = None
    job.status.failed = None
    assert get_job_status(job) == "Running"

    job.status.active = None
    job.status.succeeded = 1
    assert get_job_status(job) == "Success"

    job.status.succeeded = None
    job.status.failed = 1
    assert get_job_status(job) == "Failed"

    job.status.active = None
    job.status.succeeded = None
    job.status.failed = None
    assert get_job_status(job) == "Waiting..."

def test_get_pod_status():
    """Test pod status retrieval."""
    pod1 = MagicMock()
    pod1.metadata.labels = {"job-name": "job-1"}
    pod1.status.phase = "Running"

    pod2 = MagicMock()
    pod2.metadata.labels = {"job-name": "job-2"}
    pod2.status.phase = "Pending"

    assert get_pod_status([pod1, pod2], "job-1") == "Running"
    assert get_pod_status([pod1, pod2], "job-2") == "Pending"
    assert get_pod_status([pod1, pod2], "job-3") == "Waiting..."

def test_get_running_jobs(mock_k8s_client):
    """Test retrieving running jobs for a user."""
    mock_batch, mock_core = mock_k8s_client

    job1 = MagicMock()
    job1.metadata.annotations = {"user": "test_user", "simplename": "job-1"}
    job1.metadata.name = "job-1"
    job1.status.active = 1
    job1.status.succeeded = None
    job1.status.failed = None

    pod1 = MagicMock()
    pod1.metadata.labels = {"job-name": "job-1"}
    pod1.status.phase = "Running"

    mock_batch.list_namespaced_job.return_value.items = [job1]
    mock_core.list_namespaced_pod.return_value.items = [pod1]

    jobs = get_running_jobs("test_user")
    
    assert len(jobs) == 1
    assert jobs[0] == ["job-1", "Running", "Running"]

def test_get_running_jobs_no_jobs(mock_k8s_client):
    """Test when no jobs are running for the user."""
    mock_batch, mock_core = mock_k8s_client

    mock_batch.list_namespaced_job.return_value.items = []
    mock_core.list_namespaced_pod.return_value.items = []

    jobs = get_running_jobs("test_user")
    assert jobs == []

def test_get_running_jobs_exception(mock_k8s_client):
    """Test exception handling in get_running_jobs."""
    mock_batch, mock_core = mock_k8s_client
    mock_batch.list_namespaced_job.side_effect = Exception("API failure")

    with patch("app.shared.kubernetes.logging.error") as mock_log:
        jobs = get_running_jobs("test_user")
        assert jobs == []
        mock_log.assert_called_with("Failed to list jobs: API failure")
