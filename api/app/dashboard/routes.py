from flask import Blueprint, jsonify
from app.shared.common import get_user_jobs, get_public_jobs
from app.shared.job_info import get_start, get_result, get_service, get_publicity
from app.result.utilities import get_model_path

from app.wrappers import token_required
from app.shared.kubernetes import get_running_jobs
from app.shared.delete import delete_job_files
import logging

dashboard = Blueprint("dashboard", __name__)

@dashboard.route("/user_jobs", methods=["GET"])
@token_required
def get_jobs_of_user(current_user):
    """Get the list of jobs for the user."""
    user_jobs_array = []
    running_jobs_array = []
    
    # Get running jobs once and create lookup dictionary
    running_jobs_dict = {job[0]: job[2] for job in get_running_jobs(current_user)}  # job_name: status
    
    # Get the status of each job
    for job in get_user_jobs(current_user):
        shared = get_publicity(job, current_user)
        name = job
        service = get_service(job, current_user)
        start = get_start(job, current_user)
        result = get_result(job, current_user)
        
        # Determine status: use running status if available, otherwise determine from result
        if job in running_jobs_dict:
            status = running_jobs_dict[job]
            logging.info(f"Job {job} is currently running with status {status}.")
            # Add running jobs to separate array
            if start != None:
                running_jobs_array.append([shared, name, service, start, result, status])
        else:
            status = "Success" if result else "Failed"
            # Add completed jobs to main array
            if start != None:
                user_jobs_array.append([shared, name, service, start, result, status])

    # Sort the completed jobs by start date (newest first)
    sorted_completed_jobs = sorted(user_jobs_array, key=lambda x: (x[3] is None, x[3]), reverse=True)
    
    # Sort the running jobs by start date (newest first)
    sorted_running_jobs = sorted(running_jobs_array, key=lambda x: (x[3] is None, x[3]), reverse=True)
    
    # Append running jobs at the top
    final_jobs_array = sorted_running_jobs + sorted_completed_jobs

    # Format the dates as string because jsonify converts datetime to GMT only
    for job in final_jobs_array:
        if job[3] != None:
            job[3] = job[3].strftime('%d %B %Y %H:%M:%S')
        else:
            job[3] = "Failed"

        if job[4] != None:
            job[4] = "Success"
        else:
            job[4] = "Failed"
    
    return jsonify({"jobs": final_jobs_array})

@dashboard.route("/public_jobs", methods=["GET"])
@token_required
def get_jobs_of_public(current_user):
    """Get the list of jobs for the user."""
    user_jobs_array = []

    # Get running jobs once and create lookup dictionary
    running_jobs_dict = {job[0]: job[1] for job in get_running_jobs(current_user)}  # job_name: status

    # Get the status of each job
    for job in get_public_jobs():
        shared = get_publicity(job, current_user)
        name = job
        service = get_service(job, current_user)
        start = get_start(job, current_user)
        result = get_result(job, current_user)
        
        # Determine status: use running status if available, otherwise determine from result
        if job in running_jobs_dict:
            status = running_jobs_dict[job]
        else:
            status = "Success" if result else "Failed"

        if start != None:
            user_jobs_array.append([shared, name, service, start, result, status])

    # Sort the jobsArray by the start date
    sorted_jobs_array = sorted(user_jobs_array, key=lambda x: (x[3] is None, x[3]), reverse=True)

    # Format the dates as string because jsonify converts datetime to GMT only
    for job in sorted_jobs_array:
        if job[3] != None:
            job[3] = job[3].strftime('%d %B %Y %H:%M:%S')
        else:
            job[3] = "Failed"

        if job[4] != None:
            job[4] = "Success"
        else:
            job[4] = "Failed"
    
    return jsonify({"jobs": sorted_jobs_array})


@dashboard.route("delete/<string:job_name>", methods=["DELETE"])
@token_required
def delete_job(current_user, job_name):
    """Delete the job from files from system."""

    delete_fail = delete_job_files(job_name, current_user)
    if delete_fail:
        logging.error(delete_fail)
        return delete_fail

    return jsonify({"message": "Job has been deleted successfully."})

@dashboard.route("delete_multiple/<string:job_names>", methods=["DELETE"])
@token_required
def delete_multiple_jobs(current_user, job_names):
    """Delete multiple jobs and their files from the system."""
    job_names_list = job_names.split(",")
    delete_errors = []

    for job_name in job_names_list:
        delete_fail = delete_job_files(job_name, current_user)
        if delete_fail:
            logging.error(delete_fail)
            delete_errors.append(delete_fail)

    if delete_errors:
        return jsonify({"error": delete_errors}), 500

    return jsonify({"message": "Jobs have been deleted successfully."})
