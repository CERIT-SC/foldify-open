from flask import Blueprint, jsonify, send_file
from app.download.utilities import find_download_file
from app.wrappers import token_required
from app.shared.common import get_output_path, get_input_path
import logging
import os
from werkzeug.utils import secure_filename

download = Blueprint("download", __name__)


@download.route("/zip_available/<string:job_name>", methods=["GET"])
@token_required
def zip_available(current_user, job_name):
    """Check if the output files are available for download."""

    # Get the download file path
    download_file_path = find_download_file(job_name, current_user)
    if not download_file_path:
        logging.error(f"Could not find the file to download for job {job_name}.")
        return jsonify({"error": f"Could not find the file to download for job {job_name}."}), 400

    return jsonify({"download": True, "username": current_user}), 200


@download.route("/download_zip/<string:job_name>", methods=["POST"])
@token_required
def download_zip(job_name, current_user):
    """Download the output files for the job."""

    # Get the download file path
    download_file_path = find_download_file(job_name, current_user)
    if not download_file_path:
        return jsonify({"error": f"Could not find the file to download for job {job_name}."}), 400

    try:
        return send_file(download_file_path, as_attachment=True, etag=False, download_name=f'{job_name}.zip',
                         conditional=True)
    except Exception as e:
        logging.error(f"Exception occured. Error downloading file: {e}")
        return jsonify({"error": f"Could not find the file to download for job {e}."}), 500


@download.route("/<string:job_name>/output/<string:file_name>/<string:service>", methods=["GET"])
@token_required
def download_output_file(job_name, file_name, service, current_user):
    """Download a specific output file for the job."""

    output_dir_path = get_output_path(job_name, current_user)
    if service == "Alphafold3":
        output_dir_path = os.path.join(output_dir_path, job_name.lower())
    download_file_path = os.path.join(output_dir_path, file_name)

    if not os.path.exists(download_file_path):
        output_dir_path = get_output_path(job_name, "public")
        if service == "Alphafold3":
            output_dir_path = os.path.join(output_dir_path, job_name.lower())
        download_file_path = os.path.join(output_dir_path, file_name)

        if not os.path.exists(download_file_path):
            logging.error(f"Could not find the file to download for job {job_name}.")
            return jsonify({"error": f"Could not find the file to download for job {job_name}."}), 404

    try:
        return send_file(download_file_path, as_attachment=True, etag=False, download_name=secure_filename(file_name),
                         conditional=True)
    except Exception as e:
        logging.error(f"Exception occurred. Error downloading file: {e}")
        return jsonify({"error": f"Could not find the file to download for job {e}."}), 500


@download.route("/<string:job_name>/input/<string:file_type>", methods=["GET"])
@token_required
def download_input_file(job_name, file_type, current_user):
    """Download a specific input file for the job."""

    download_file_path = get_input_path(job_name, file_type, current_user)

    if not os.path.exists(download_file_path):
        # Try to find the file in the public directory as a fallback
        download_file_path = get_input_path(job_name, file_type, "public")

        if not os.path.exists(download_file_path):
            logging.error(f"Could not find the file to download for job {job_name}.")
            return jsonify({"error": f"Could not find the file to download for job {job_name}."}), 400

    try:
        return send_file(download_file_path, as_attachment=True, etag=False, download_name=f"{job_name}.{file_type}",
                         conditional=True)
    except Exception as e:
        logging.error(f"Exception occured. Error downloading file: {e}")
        return jsonify({"error": f"Could not find the file to download for job {job_name}."}), 500
