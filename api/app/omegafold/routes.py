from flask import jsonify, request, Blueprint
from app.wrappers import token_required
from kubernetes import client

from app.shared.common import NAMESPACE
from app.shared.kubernetes import connect_to_k8s
from app.omegafold.utilities import (
    validate_input,
    create_job_config, 
    create_file_config, 
    create_job_object)
from app.shared.job_submitting import (
    check_job_uniqueness, 
    create_k8s_job, create_input_files)

import logging

# Define the Flask Blueprint
omegafold = Blueprint('omegafold', __name__)

# Connect to kubernetes cluster
batchApi = connect_to_k8s()

@omegafold.route('/submit', methods=['POST'])
@token_required
def submit_job(current_user):
    """Submit a new OmegaFold job to the Kubernetes cluster."""

    try:
        data = request.json
        # Validate the request data
        validation_error = validate_input(data)
        if validation_error:
            return validation_error
                
        # Create job configuration from the request data
        jobConfig = create_job_config(data, current_user)

        # Create file configuration
        fileConfig = create_file_config(jobConfig)

        # Check the job uniqueness
        job_uniqueness_error = check_job_uniqueness(jobConfig, fileConfig, current_user)
        if job_uniqueness_error:
            return job_uniqueness_error
                
        # Create Kubernetes Job Object
        job = create_job_object(jobConfig, current_user)

        # Submit Job to Kubernetes Cluster
        create_k8s_job(batchApi, NAMESPACE, job)

        # Create Input Files
        input_files_error = create_input_files(jobConfig, fileConfig, current_user)
        if input_files_error:
            return input_files_error
        
        return jsonify({"message": f'Job "{jobConfig["simplename"]}" created successfully.'}), 200
      
    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400
    except client.exceptions.ApiException as e:
        return jsonify({"error": f"Kubernetes API error: {e.reason}"}), e.status
    except IOError as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

