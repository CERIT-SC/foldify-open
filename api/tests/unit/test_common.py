from unittest.mock import patch
from app.shared.common import ( get_working_directory, get_input_path, get_output_path, get_user_jobs, get_public_jobs, get_jobs_list)


def test_get_input_path():
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"):
        assert get_input_path("alphajob", "json", "mock_user") == "/fake/path/input/mock_user/alphajob.json"
        assert get_input_path("alphajob", "json", "public") == "/fake/path/input/public/alphajob.json"
        assert get_input_path("alphajob", "fasta", "mock_user") == "/fake/path/input/mock_user/alphajob.fasta"
        assert get_input_path("alphajob", "fasta", "public") == "/fake/path/input/public/alphajob.fasta"

def test_get_output_path():
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"):
        assert get_output_path("alphajob", "mock_user") == "/fake/path/output/mock_user/alphajob"
        assert get_output_path("alphajob", "public") == "/fake/path/output/public/alphajob"

def test_get_user_jobs():
    # Test when the user directory exists
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"), \
         patch("os.path.exists", return_value=True), \
         patch("os.listdir", return_value=["job1.json", "job1.fasta", "job2.json", "job2.fasta", "af3job.json"]):
        assert get_user_jobs("mock_user") == ["job1", "job2", "af3job"]

    # Test when the user directory is empty
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"), \
         patch("os.path.exists", return_value=True), \
         patch("os.listdir", return_value=[]):
        assert get_user_jobs("mock_user") == []
    
    # Test when the user directory does not exist
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"), \
         patch("os.path.exists", return_value=False):
        assert get_user_jobs("mock_user") == []
        assert get_user_jobs("public") == []


def test_get_public_jobs():
    with patch("app.shared.common.get_working_directory", return_value="/fake/path"), \
         patch("os.path.exists", return_value=True), \
         patch("os.listdir", return_value=["job1.json", "job1.fasta", "job2.json", "job2.fasta", "af3job.json"]):
        assert get_public_jobs() == ["job1", "job2", "af3job"]

    with patch("app.shared.common.get_working_directory", return_value="/fake/path"), \
         patch("os.path.exists", return_value=False):
        assert get_public_jobs() == []

def test_get_jobs_list():
    with patch("app.shared.common.get_user_jobs", return_value=["job1", "job2", "af3job"]), \
         patch("app.shared.common.get_public_jobs", return_value=["job1", "job2", "af3job"]):
        assert get_jobs_list("mock_user") == ["job1", "job2", "af3job"]

    with patch("app.shared.common.get_user_jobs", return_value=["job1", "job2", "af3job"]), \
         patch("app.shared.common.get_public_jobs", return_value=["public_job1", "public_job2", "public_af3job", "job1", "job2", "af3job"]):
        assert get_jobs_list("mock_user") == ["job1", "job2", "af3job", "public_job1", "public_job2", "public_af3job"]

    with patch("app.shared.common.get_user_jobs", return_value=["job1", "job2", "af3job"]), \
         patch("app.shared.common.get_public_jobs", return_value=[]):
        assert get_jobs_list("mock_user") == ["job1", "job2", "af3job"]

    with patch("app.shared.common.get_user_jobs", return_value=[]), \
         patch("app.shared.common.get_public_jobs", return_value=["job1", "job2", "af3job"]):
        assert get_jobs_list("mock_user") == ["job1", "job2", "af3job"]

    with patch("app.shared.common.get_user_jobs", return_value=[]), \
            patch("app.shared.common.get_public_jobs", return_value=[]):
        assert get_jobs_list("mock_user") == []