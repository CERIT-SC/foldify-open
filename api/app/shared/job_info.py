import os
import json
import datetime
import pytz
from app.shared.common import get_input_path, get_output_path
from flask import jsonify

import logging

def job_done(job, user):
    """Check if the job is done and return the service used, if any"""
    output_path  = get_output_path(job, user)
    public_output_path = get_output_path(job, "public")
   
    services = ["alphafold", "alphafold3", "colabfold", "omegafold", "esmfold"]

    # Check the user's output path
    for service in services:
        if os.path.exists(f"{output_path}/{service}.done"):
            return service.capitalize()  # Return the name of the service
    
    # Check the public output path
    for service in services:
        if os.path.exists(f"{public_output_path}/{service}.done"):
            return service.capitalize()  # Return the name of the service

    # Check if the job is done but the service is not known
    if os.path.exists(f"{output_path}/ranking_debug.json"):
        return "Alphafold"
    elif os.path.exists(f"{public_output_path}/ranking_debug.json"):
        return "Alphafold"
    
    return None

def get_service(job, user):
    """Get the service that was used for the job"""
    service = "-"
    json_file_path = get_input_path(job, "json", user)
    public_json_file_path = get_input_path(job, "json", "public")
    
    if not job_done(job, user):  # If job isn't done, check the input paths
        try:
            # First, try the user's input path
            with open(json_file_path) as f:
                data = json.load(f)

            if isinstance(data, list):
                service = "Alphafold3"
            else:
                service = data.get("service", data.get("dialect", "-"))
            
        except:
            # If not found in user's path, try the public input path
            try:
                with open(public_json_file_path) as f:
                    data = json.load(f)
                if isinstance(data, list):
                    service = "Alphafold3"
                else:
                    service = data.get("service", data.get("dialect", "-"))
            except:
                service = "-"
    else:
        service = job_done(job, user)  # If job is done, get the service name

    if service != "-":
        service = service.capitalize()
    
    return service

def convertToCEST(time):
    """Converts UTC time to CEST time"""
    # convert UTC time to a datetime object
    utc_time = datetime.datetime.fromtimestamp(time)
    # define CEST timezone
    cest_timezone = pytz.timezone('Europe/Prague')
    # convert UTC time to CEST time
    cest_time = cest_timezone.localize(utc_time)

    return cest_time

def get_start(job, user):
    """Get the start time of the job"""
    fasta_file_path = get_input_path(job, "json", user)
    public_fasta_file_path = get_input_path(job, "json", "public")

    # First check the user's directory
    if os.path.exists(fasta_file_path):
        try:
            created = os.path.getmtime(fasta_file_path)
            return convertToCEST(created)
        except:
            return None
    
    # If not found in user's directory, check the public directory
    if os.path.exists(public_fasta_file_path):
        try:
            created = os.path.getmtime(public_fasta_file_path)
            return convertToCEST(created)
        except:
            return None

    return None

def get_result(job, user):
    """Get the end time of the job"""
    done_files = ["alphafold.done", "alphafold3.done", "colabfold.done", "omegafold.done", "esmfold.done"]
    output_path = get_output_path(job, user)
    public_output_path = get_output_path(job, "public")

    for done_file in done_files:
        # First check in the user's directory
        done_path = os.path.join(output_path, done_file)
        if os.path.exists(done_path):
            try:
                created = os.path.getmtime(done_path)
                return convertToCEST(created)
            except:
                return None
        
        # If not found in user's directory, check the public directory
        done_path = os.path.join(public_output_path, done_file)
        if os.path.exists(done_path):
            try:
                created = os.path.getmtime(done_path)
                return convertToCEST(created)
            except:
                return None
    
    return None

def get_publicity(job, user):
    """Get the publicity of the job"""
    input_path = get_input_path(job, "json", user)
    public_input_path = get_input_path(job, "json", "public")

    # Check the user's output path
    if os.path.exists(public_input_path):
        return "Public"
    elif os.path.exists(input_path):
        return "Private"

    return "Unknown"

def check_job_ownership(job, user):
    """Check if the user owns the job by verifying files exist in their directory"""
    input_json_path = get_input_path(job, "json", user)
    input_fasta_path = get_input_path(job, "fasta", user)
    output_path = get_output_path(job, user)
    
    # Check if at least one of the user's files exists (indicating ownership)
    user_files_exist = (
        os.path.exists(input_json_path) or 
        os.path.exists(input_fasta_path) or 
        os.path.exists(output_path)
    )
    
    return user_files_exist

def set_publicity(job, user, publicity):
    """Set the publicity of the job"""

    if not check_job_ownership(job, user):
        logging.warning(f"User {user} does not own job {job}")
        return jsonify({"error": f"Permission denied. Cannot change publicity of job {job}. User is not the owner of the resource."}), 403

    try:
        input_json_path = get_input_path(job, "json", user)
        public_json_path = get_input_path(job, "json", "public")
        input_fasta_path = get_input_path(job, "fasta", user)
        public_fasta_path = get_input_path(job, "fasta", "public")
        output_path = get_output_path(job, user)
        public_output_path = get_output_path(job, "public")

        if publicity == "Public":
            # Ensure public directory exists
            os.makedirs(os.path.dirname(public_json_path), exist_ok=True)
            os.makedirs(os.path.dirname(public_fasta_path), exist_ok=True)
            os.makedirs(os.path.dirname(public_output_path), exist_ok=True)
            
            # Remove existing symlinks if they exist (to prevent errors)
            for path in [public_json_path, public_fasta_path, public_output_path]:
                if os.path.islink(path):
                    os.unlink(path)
                    logging.info(f"Removed existing symlink at: {path}")
                elif os.path.exists(path):
                    logging.warning(f"Non-symlink file exists at public path: {path}")
                    return jsonify({"error": f"Cannot set to Public, non-symlink file exists at: {path}"}), 500
            
            # Create symlinks only if source files exist
            if os.path.exists(input_json_path):
                os.symlink(input_json_path, public_json_path)
                logging.info(f"Created symlink from {input_json_path} to {public_json_path}")
            else:
                logging.warning(f"Source file does not exist: {input_json_path}")
                
            if os.path.exists(input_fasta_path):
                os.symlink(input_fasta_path, public_fasta_path)
                logging.info(f"Created symlink from {input_fasta_path} to {public_fasta_path}")
            else:
                logging.warning(f"Source file does not exist: {input_fasta_path}")
                
            if os.path.exists(output_path):
                os.symlink(output_path, public_output_path)
                logging.info(f"Created symlink from {output_path} to {public_output_path}")
            else:
                logging.warning(f"Source directory does not exist: {output_path}")
            
            return True
            
        elif publicity == "Private":
            # Remove symlinks from public directory (check if they are actually symlinks)
            for path in [public_json_path, public_fasta_path, public_output_path]:
                if os.path.islink(path):
                    os.unlink(path)
                elif os.path.exists(path):
                    logging.warning(f"Non-symlink file exists at public path, not removing: {path}")
            
            return True
            
        else:
            logging.error(f"Invalid publicity value: {publicity}")
            return jsonify({"error": f"Invalid publicity value: {publicity}"}), 400

    except OSError as e:
        logging.error(f"OS error in set_publicity: {e}")
        return jsonify({"error": f"OS error in set_publicity: {e}"}), 500
    except Exception as e:
        logging.error(f"Unexpected error in set_publicity: {e}")
        return jsonify({"error": f"Unexpected error in set_publicity: {e}"}), 500