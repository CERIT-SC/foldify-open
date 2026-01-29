import os
from flask import jsonify, Blueprint

from app.shared.job_info import job_done, get_start, get_service, get_publicity, set_publicity
from app.shared.common import get_input_path, get_output_path, get_input_dir
from app.result.utilities import load_json_data, read_file_content, create_molstar_url, get_plddt_data, get_model_path, get_output_files, get_input_files, get_aligned_multifold_structures, parse_af3_json
from app.wrappers import token_required
from app.shared.kubernetes import get_running_jobs

result = Blueprint("result", __name__)

import logging

@result.route("/<string:job_name>")
@token_required
def get_result(job_name, current_user):
    """Get the basic result info of the job."""
    state = "Finished with Failure"
    if job_done(job_name, current_user):
        state = "Done"
    else:
        try:
            running_jobs = get_running_jobs(current_user)
            for job in running_jobs:
                if job[0] == job_name: # job[0] is the job name
                    state = job[2] # job[2] is the pod status
                    break
        except:
            logging.error("Error getting running jobs")
            state = "Unknown"
    start = get_start(job_name, current_user)
    service = get_service(job_name, current_user)
    publicity = get_publicity(job_name, current_user)

    return jsonify({"job_name": job_name, "state": state, "start": start, "service": service, "publicity": publicity})

@result.route("/<string:job_name>/stdout")
@token_required
def get_stdout(job_name, current_user):
    """Get the stdout of the job for the TECHNICAL OUTPUT tab."""
    try:
        stdout_path = os.path.join(get_output_path(job_name, current_user), "stdout")
        stdout = read_file_content(stdout_path)
    except FileNotFoundError:
        try:
            public_stdout_path = os.path.join(get_output_path(job_name, "public"), "stdout")
            stdout = read_file_content(public_stdout_path)
        except FileNotFoundError:
            return jsonify({"error": f"Error loading stdout file for job: {job_name}"}), 404
    
    return jsonify({"stdout": stdout})

@result.route("/<string:job_name>/molstar_url")
@token_required
def get_molstar_url(job_name, current_user):
    """Get data for 3D protein visualization and molstar URL."""
    
    model_file_path = get_model_path(job_name, current_user)
    if not model_file_path:
        logging.error(f"Error loading model file for job: {job_name}")
        return jsonify({"error": f"Error loading model file for job: {job_name}"}), 404

    # Load model file
    try:
        model = read_file_content(model_file_path)
        data_format = model_file_path.split(".")[-1]
        if data_format == "cif":
                data_format = "mmcif"
    except FileNotFoundError:
        logging.error(f"Error loading model file: {model_file_path}")
        return jsonify({"error": f"Error loading model file: {model_file_path}"}), 500

    molstar_url = create_molstar_url(job_name, model, data_format)
    if not molstar_url:
        logging.error(f"Error creating Molstar URL for job: {job_name}")
        return jsonify({"error": f"Error creating Molstar URL for job: {job_name}"}), 500

    return jsonify({"molstarURL": molstar_url})

@result.route("/<string:job_name>/model")
@token_required
def get_model(job_name, current_user):
    """Get the model data for the job."""

    model_path = get_model_path(job_name, current_user)
    if not model_path:
        logging.error(f"Error loading model file for job: {job_name}")
        return jsonify({"error": f"Error loading model file for job: {job_name}"}), 404
    
    try:
        with open(model_path, "r") as f:
            model_data = f.read()
            data_format = model_path.split(".")[-1]
            if data_format == "cif":
                data_format = "mmcif"
    except FileNotFoundError:
        logging.error(f"Error loading model file: {model_path}")
        return jsonify({"error": f"Error loading model file: {model_path}"}), 500
    
    return jsonify({"job_name": job_name, "model": model_data, "dataFormat": data_format})

@result.route("/<string:job_name>/plddt")
@token_required
def get_plddt(job_name, current_user):
    """Get pLDDT data for the job."""
    plddt = get_plddt_data(job_name, current_user)
    if not plddt:
        logging.error(f"Error loading pLDDT data for job: {job_name}")
        return jsonify({"error": f"Error loading pLDDT data for job: {job_name}"}), 404
    return jsonify({"job_name": job_name, "plddt": plddt})

@result.route("/switch_publicity/<string:job_name>")
@token_required
def switch_publicity(job_name, current_user):
    """
    Switch the publicity of the job between 'Public' and 'Private'.

    Returns a success message if the publicity is switched, or an error message with a 500 status code if the operation fails.
    If the current publicity is neither 'Public' nor 'Private', returns an error message with a 500 status code.
    """
    try:
        publicity = get_publicity(job_name, current_user)
        logging.info(f"Current publicity for job {job_name}: {publicity}")

        if publicity == "Public":
            publicity_result = set_publicity(job_name, current_user, "Private")
            if publicity_result == True:
                return jsonify({"message": f"Job {job_name} is now Private."})
            else:
                return publicity_result

        elif publicity == "Private":
            publicity_result = set_publicity(job_name, current_user, "Public")
            if publicity_result == True:
                return jsonify({"message": f"Job {job_name} is now Public."})
            else:
                return publicity_result

        elif publicity == "Unknown":
            return jsonify({"error": f"Cannot determine current publicity for job: {job_name}"}), 404
            
        else:
            return jsonify({"error": f"Invalid publicity state '{publicity}' for job: {job_name}"}), 500
            
    except Exception as e:
        logging.error(f"Error switching publicity for job {job_name}: {str(e)}")
        return jsonify({"error": f"Internal server error while switching publicity for job: {job_name}"}), 500

@result.route("/<string:job_name>/sequence")
@token_required
def get_sequence(job_name, current_user):
    """Get the input sequence for the job."""
    service = get_service(job_name, current_user)
    
    if service == "Alphafold3":
        # Try user's JSON file first
        parsed_sequences = None
        try:
            json_sequence_path = get_input_path(job_name, "json", current_user)
            config_data = load_json_data(json_sequence_path)
            parsed_sequences = parse_af3_json(config_data)
        except FileNotFoundError:
            pass  # Will try public directory
        
        # Fallback to public JSON file if needed
        if parsed_sequences is None:
            try:
                public_json_sequence_path = get_input_path(job_name, "json", "public")
                config_data = load_json_data(public_json_sequence_path)
                parsed_sequences = parse_af3_json(config_data)
            except FileNotFoundError:
                pass
        
        # Return error if no valid sequences found
        if parsed_sequences is None:
            logging.error(f"Error loading or parsing JSON config for job: {job_name}")
            return jsonify({"error": f"Error loading JSON config for job: {job_name}"}), 404
        
        return jsonify({"sequence": parsed_sequences, "type": "json"})
    
    else:
        # Try user's FASTA file first
        sequence_content = None
        try:
            fasta_sequence_path = get_input_path(job_name, "fasta", current_user)
            sequence_content = read_file_content(fasta_sequence_path)
        except FileNotFoundError:
            pass  # Will try public directory
        
        # Fallback to public FASTA file if needed
        if sequence_content is None:
            try:
                public_fasta_sequence_path = get_input_path(job_name, "fasta", "public")
                sequence_content = read_file_content(public_fasta_sequence_path)
            except FileNotFoundError:
                pass
        
        # Return error if no file found
        if sequence_content is None:
            logging.error(f"Error loading FASTA sequence for job: {job_name}")
            return jsonify({"error": f"Error loading FASTA sequence for job: {job_name}"}), 404
        
        return jsonify({"sequence": sequence_content, "type": "fasta"})

@result.route("/<string:job_name>/files")
@token_required
def get_files_list(job_name, current_user):
    """Get list of input and output files for the job."""
    service = get_service(job_name, current_user)
    try:
        input_files = []
        output_files = []
        
        # Get input files from user's directory
        input_dir = get_input_dir(current_user)
        inputs_list = os.listdir(input_dir) if os.path.exists(input_dir) else []
        input_files = get_input_files(inputs_list, input_dir, job_name)

        # Get output files from user's directory        
        output_dir = get_output_path(job_name, current_user)
        if service == "Alphafold3":
            output_dir = os.path.join(output_dir, job_name.lower())
        output_files_list = os.listdir(output_dir) if os.path.exists(output_dir) else []
        output_files = get_output_files(output_files_list, output_dir, job_name, service)
        
        # If no files found in user directory, try public directory as fallback
        if not input_files and not output_files:
            public_input_dir = get_input_dir("public")
            public_inputs_list = os.listdir(public_input_dir) if os.path.exists(public_input_dir) else []
            input_files = get_input_files(public_inputs_list, public_input_dir, job_name)
                
            public_output_dir = get_output_path(job_name, "public")
            if service == "Alphafold3":
                public_output_dir = os.path.join(public_output_dir, job_name.lower())
            public_output_files_list = os.listdir(public_output_dir) if os.path.exists(public_output_dir) else []
            output_files = get_output_files(public_output_files_list, public_output_dir, job_name, service)
        
        return jsonify({
            "inputFiles": input_files,
            "outputFiles": output_files
        })
        
    except Exception as e:
        logging.error(f"Error getting files list for job {job_name}: {str(e)}")
        return jsonify({"error": f"Error loading files for job: {job_name}"}), 404
    

@result.route("/multi/<string:job_names>/models")
@token_required
def get_multi_result(job_names, current_user):
    """Get the model data for multiple jobs."""
    job_list = job_names.split("_")

    aligned_models = get_aligned_multifold_structures(job_list, current_user)
    if not aligned_models:
        logging.error(f"Error aligning models for jobs: {job_names}")
        return jsonify({"error": f"Error aligning models for jobs: {job_names}"}), 404

    return jsonify({"models": aligned_models})
