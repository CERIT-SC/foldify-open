from flask import jsonify, request, Blueprint
from app.wrappers import token_required
from kubernetes import client

from app.alphafold.utilities import deploy_alphafold2_job
from app.alphafold.input_handling import validate_alphafold2_input, split_sequence_input

import logging

# Define the Flask Blueprint
alphafold = Blueprint('alphafold', __name__)


@alphafold.route("/submit", methods=["POST"])
@token_required
def submit_job(current_user):
    """Submit a new AlphaFold job to the Kubernetes cluster."""
    try:
        data = request.json
        jobName = data["jobName"]

        # Validate the request data, excluding protein sequence input
        validation_error = validate_alphafold2_input(data)
        if validation_error:
            return validation_error

        # Deploy Job to Kubernetes Cluster
        if data["modelPreset"] == "multimer":
            """ Enter single mode for multimer sequence """
            submitted_jobs = 1
            jobDeploymentError = deploy_alphafold2_job(data, current_user)
            if jobDeploymentError:
                return jobDeploymentError
        else:
            """ Enter batch monomer mode or single monomer mode according to the sequence count """
            sequences = split_sequence_input(data["proteinSequence"])
            submitted_jobs = 0
            for seq in sequences:
                submitted_jobs += 1
                data["proteinSequence"] = seq
                if len(sequences) > 1:
                    data["jobName"] = f"{jobName}-batch-{submitted_jobs}"

                jobDeploymentError = deploy_alphafold2_job(data, current_user)
                if jobDeploymentError:
                    return jobDeploymentError

        return jsonify({"message": f'Submission of {jobName} successful. Total jobs submitted: {submitted_jobs}.'}), 200

    except KeyError as e:
        return jsonify({"error": f"Missing key: {str(e)}"}), 400
    except client.exceptions.ApiException as e:
        return jsonify({"error": f"Kubernetes API error: {e.reason}"}), e.status
    except IOError as e:
        return jsonify({"error": f"File operation failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
