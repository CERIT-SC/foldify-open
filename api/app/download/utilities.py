import os
from flask import jsonify
from app.shared.common import get_output_path
import logging

logger = logging.getLogger(__name__)


def find_zip_in_directory(user_directory, public_directory):
    """Helper function to find a zip file in a directory."""
    try:
        with os.scandir(user_directory) as files:
            for file in files:
                if file.name.endswith(".zip"):
                    return file.path
    except FileNotFoundError:
        try:
            with os.scandir(public_directory) as files:
                for file in files:
                    if file.name.endswith(".zip"):
                        return file.path
        except FileNotFoundError:
            logging.error(f"Could not find the zip file in either the user or public directory.")
            return None


def find_download_file(job_name, username):
    """Find the download file for the job in the user's or public directory."""

    user_directory = get_output_path(job_name, username)
    public_directory = get_output_path(job_name, "public")

    # Check user's directory first
    download_file = find_zip_in_directory(user_directory, public_directory)

    # If no file found at all, return an error message
    if not download_file:
        logging.error(f"Could not find the file to download for job {job_name}.")
        return None

    return download_file
