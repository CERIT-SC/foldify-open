from flask import jsonify, Blueprint, request
from app.wrappers import token_required
import json

from pydantic import ValidationError

from app.alphafold3.validation import Job
from app.alphafold3.v1_submission import save_input_config, run_alphafold3_prediction, save_json_input, save_ccd_file
import logging


# Define the Flask Blueprint
alphafold3 = Blueprint('alphafold3', __name__)
    
@alphafold3.route('/v1/submit', methods=["POST"])
@token_required
def submit_af3_job(current_user):
    """ Submit an AlphaFold3 job using advanced configuration."""
    try:
        data = json.loads(request.form["data"])
        validated_data = Job(**data)
        ## Turn the validated data into a json
        validated_data = validated_data.model_dump(exclude_none=True)
        
        # Save the CCD file if provided
        if "userCCDPath" in validated_data and validated_data["userCCDPath"]:

            userCCDFile = request.files.get("userCCDFile")
   
            save_ccd = save_ccd_file(userCCDFile, data['name'], current_user)
            if save_ccd:
                logging.error(f"Error saving CCD file: {save_ccd}")
                return save_ccd
            
            # Update the userCCDPathx
            validated_data["userCCDPath"] = f"{data['name']}-ccd.cif"

        # Save the JSON configuration
        save_input = save_input_config(validated_data, current_user)
        if save_input:
            return save_input
      
        # Run the AlphaFold3 prediction
        prediction_message = run_alphafold3_prediction(data, current_user)
        return prediction_message
    
    except ValidationError as e:
        logging.error(f"Validation error occurred: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logging.error(f"Error occurred while submitting AlphaFold3 job: {e}")
        return jsonify({"error": str(e)}), 400 

@alphafold3.route('/v1/submit/json', methods=["POST"])
@token_required
def submit_af3_job_json(current_user):
    """Submit an AlphaFold3 job using a JSON configuration from client."""
    try:
        computation_config = json.loads(request.form["data"])
        json_file = request.files.get("jsonFile")

        save_json = save_json_input(json_file, computation_config, current_user)
        if save_json:
            return save_json
        
        # Run the AlphaFold3 prediction
        prediction_message = run_alphafold3_prediction(computation_config, current_user)
        return prediction_message
            
    except Exception as e:
        logging.error(f"Error occurred while submitting AlphaFold3 job with JSON: {e}")
        return jsonify({"error": f"JSON file error occurred: {str(e)}"}), 400