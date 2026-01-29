import logging
import os
from config import Config

DEVELOPMENT_DIRECTORY = os.path.join(os.path.dirname(os.getcwd()), "seeds")
PRODUCTION_DIRECTORY = Config.PROD_RESULTS_DIRECTORY
NAMESPACE = Config.NAMESPACE


def get_working_directory():
    """Return the working directory based on the FLASK_ENV environment variable."""
    env = os.getenv('FLASK_ENV', 'development')

    if env == "development":
        work_dir = DEVELOPMENT_DIRECTORY
    elif env == "production":
        work_dir = PRODUCTION_DIRECTORY

    return work_dir


def get_input_dir(user="public"):
    """Return the path to the input directory. Based on the given user parameter, it returns the path to the public or user's directory."""
    base_dir = get_working_directory()

    return os.path.join(base_dir, "input", user)


def get_input_path(job, file_type, user="public"):
    """
    Return the path to the input directory. Based on the given user parameter, 
    it returns the path to the public or user's directory and the appropriate .fasta or .json file.
    
    Parameters:
    - user: The username (defaults to "public" if not provided).
    - job: The name of the job.
    - file_type: The type of file ("fasta" or "json").
    
    Returns:
    - str: The complete file path.
    """
    base_dir = get_working_directory()

    # Validate file_type
    if file_type not in ["fasta", "json", "cif"]:
        raise ValueError(f"Invalid file_type: {file_type}. Must be 'fasta' or 'json' or 'cif'.")

    # Construct the full path
    file_path = os.path.join(base_dir, "input", user, f"{job}.{file_type}")

    return file_path


def get_output_path(job_name, user="public"):
    """Return the path to the output directory. Based on the given user parameter, it returns the path to the public or user's directory."""
    base_dir = get_working_directory()

    """
    Return the path to the output directory. Based on the given user parameter, 
    it returns the path to the public or user's directory, optionally including the job name.
    
    Parameters:
    - user: The username (defaults to "public" if not provided).
    - job_name: The name of the job (if empty, returns the path to the user's base output directory).
    
    Returns:
    - str: The complete path to the output directory or job directory.
    """
    base_dir = get_working_directory()

    # Return the path to the specific job's output directory
    return os.path.join(base_dir, "output", user, job_name)


def get_user_jobs(user):
    """Return the list of jobs based on the .fasta files in the user's input directory."""
    user_jobs = []
    base_dir = get_working_directory()

    # Browse user's directory
    user_directory = os.path.join(base_dir, "input", user)
    if os.path.exists(user_directory):
        for file in os.listdir(user_directory):
            if file.endswith(".json"):
                user_jobs.append(file[:-5])

    return user_jobs


def get_public_jobs():
    """Return the list of jobs based on the .fasta files in the public input directory."""
    public_jobs = []
    base_dir = get_working_directory()

    # Browse public directory
    public_directory = os.path.join(base_dir, "input", "public")
    if os.path.exists(public_directory):
        for file in os.listdir(public_directory):
            if file.endswith(".json"):
                public_jobs.append(file[:-5])

    return public_jobs


def get_jobs_list(user):
    """Return the list of jobs based on the .json files in the input directory."""

    # Get user jobs
    user_jobs = get_user_jobs(user)

    # Get public jobs
    public_jobs = get_public_jobs()

    # Combine user and public jobs without duplicates
    list_of_jobs = user_jobs + [job for job in public_jobs if job not in user_jobs]

    logging.info(f"Jobs list for user {user}: {list_of_jobs}")

    return list_of_jobs
