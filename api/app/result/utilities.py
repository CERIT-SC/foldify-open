import math
import os
import json
import re
import random
import string
import glob
import pickle
import numpy as np
from flask import jsonify

from app.shared.common import get_output_path, get_working_directory
from app.shared.job_info import job_done
from app.result.protein_alignment import align_multiple_structures

import logging


def read_file_content(filepath):
    """Read content from a file and return it."""
    with open(filepath, "r") as f:
        return f.read()
    

def load_json_data(filepath):
    """Load and return JSON data from a file."""
    with open(filepath, "r") as f:
        return json.load(f)
    
    
def save_file_content(filepath, content):
    """Save content to a file."""
    with open(filepath, "w") as f:
        f.write(content)


def check_file_size(filepath, max_size=2147483648):
    """Check if the file size exceeds the specified max size."""
    return os.stat(filepath).st_size > max_size


def find_model_file(job, pattern, user):
    """Find the model file matching a pattern in the job directory."""
    output_path = get_output_path(job, user)
    public_output_path = get_output_path(job, "public")

    try:
        with os.scandir(output_path) as files:
            for file in files:
                if re.search(pattern, file.name):
                    model_file = file.path
                    return model_file
    except FileNotFoundError:
        try:
            with os.scandir(public_output_path) as files:
                for file in files:
                    if re.search(pattern, file.name):
                        model_file = file.path
                        return model_file
        except FileNotFoundError:
            return None
        
def find_cif_file(job, user):
    """Find the .cif file in the job directory."""
    output_path = get_output_path(job, user)
    output_path = os.path.join(output_path, job.lower())
 
    public_output_path = get_output_path(job, "public")
    public_output_path = os.path.join(public_output_path, job.lower())

    try:
        with os.scandir(output_path) as files:
            for file in files:
                if file.name.endswith(".cif"):
                    model_file = file.path
                    return model_file
    except FileNotFoundError:
        try:
            with os.scandir(public_output_path) as files:
                for file in files:
                    if file.name.endswith(".cif"):
                        model_file = file.path
                        return model_file
        except FileNotFoundError:
            return None
        
def find_pdb_for_alphafold3(job, user):
    """Find the .pdb file in the job directory."""
    output_path = get_output_path(job, user)
    output_path = os.path.join(output_path, job)
 
    public_output_path = get_output_path(job, "public")
    public_output_path = os.path.join(public_output_path, job)

    try:
        with os.scandir(output_path) as files:
            for file in files:
                if file.name.endswith(".pdb"):
                    model_file = file.path
                    return model_file
    except FileNotFoundError:
        try:
            with os.scandir(public_output_path) as files:
                for file in files:
                    if file.name.endswith(".pdb"):
                        model_file = file.path
                        return model_file
        except FileNotFoundError:
            return None


def handle_large_file(file_path):
    """Handle a case where the file size exceeds the limit."""
    file_size = os.stat(file_path).st_size
    return jsonify({"error": f"Model file ({file_size} bytes) is larger than 2 GB. Your Alphafold instance doesn't have the necessary memory to display your results. If you wish, your data can be downloaded."}), 500

def get_alphafold_pdb(job, user):
    """Get the best model file for Alphafold."""

    output_path = get_output_path(job, user)
    public_output_path = get_output_path(job, "public")

    # Load ranking file
    try:
        ranking = load_json_data(f"{output_path}/ranking_debug.json")
    except FileNotFoundError:
        try:
            ranking = load_json_data(f"{public_output_path}/ranking_debug.json")
        except FileNotFoundError:
            logging.error("Error loading ranking_debug.json")
            return jsonify({"error": "Error loading ranking_debug.json"}), 404        
    
    best = ranking["order"][0]

    # Determine the best model file path (relaxed or unrelaxed)
    relaxed_model_path = os.path.join(output_path, f"relaxed_{best}.pdb")
    public_relaxed_model_path = os.path.join(public_output_path, f"relaxed_{best}.pdb")
    unrelaxed_model_path = os.path.join(output_path, f"unrelaxed_{best}.pdb")
    public_unrelaxed_model_path = os.path.join(public_output_path, f"unrelaxed_{best}.pdb")

    if os.path.exists(relaxed_model_path):
        model_file_path = relaxed_model_path
    elif os.path.exists(public_relaxed_model_path):
        model_file_path = public_relaxed_model_path
    elif os.path.exists(unrelaxed_model_path):
        model_file_path = unrelaxed_model_path
    elif os.path.exists(public_unrelaxed_model_path):
        model_file_path = public_unrelaxed_model_path
    else:
        logging.error("Couldn't find .pdb file with protein information.")
        return jsonify({"error": "Couldn't find .pdb file with protein information."}), 404

    # Check file size and handle large files
    if check_file_size(model_file_path):
        return handle_large_file(model_file_path)
    
    return model_file_path
    
def get_colabfold_pdb(job, user):
    """Get the best model file for ColabFold."""
    model_file_path = find_model_file(job, r".*unrelaxed.*pdb$", user)

    if not model_file_path:
        logging.error("Couldn't find .pdb file with protein information.")
        return jsonify({"error": "Couldn't find .pdb file with protein information."}), 404

    if check_file_size(model_file_path):
        return handle_large_file(model_file_path)
    
    return model_file_path
    
def get_omega_esmfold_pdb(job, user):
    """Get the model file for OmegaFold or ESMFold."""
    model_file_path = find_model_file(job, r".*\.pdb$", user)

    if not model_file_path:
        logging.error("Couldn't find .pdb file with protein information.")
        return jsonify({"error": "Couldn't find .pdb file with protein information."}), 404

    if check_file_size(model_file_path):
        return handle_large_file(model_file_path)
    
    return model_file_path


def get_alphafold3_mmcif(job, user):
    """Get the .cif file for Alphafold3."""
    cif_file = find_cif_file(job, user)
    if cif_file is None:
        logging.error("Couldn't find .cif file with protein information.")
        return None
    
    return cif_file

def get_model_path(job, user):
    """Load the model file according to the prediction service."""
    job_service = job_done(job, user)

    if job_service == "Alphafold":
        return get_alphafold_pdb(job, user)
    elif job_service == "Colabfold":
        return get_colabfold_pdb(job, user)
    elif job_service == "Omegafold" or job_service == "Esmfold":
        return get_omega_esmfold_pdb(job, user)
    elif job_service == "Alphafold3":
        return get_alphafold3_mmcif(job, user)
    else:
        try: 
            if os.path.exists(get_alphafold_pdb(job, user)):
                # If the Alphafold job is not done but some model file exists
                return get_alphafold_pdb(job, user)
        except:
            try:
                if os.path.exists(get_colabfold_pdb(job, user)):
                    # If the ColabFold job is not done but some model file exists
                    return get_colabfold_pdb(job, user)
            except:
                return None
    return None

def create_molstar_url(job_name, model, data_format):
    """Create a Mol* viewer URL with PDB data."""

    if data_format not in ["pdb", "cif", "mmcif"]:
        logging.error("Invalid data format. Only 'pdb' and 'mmcif' are supported.")
        return None
    
    parent_dir = os.path.join(get_working_directory(), "molstar")
    existing_dir = None

    # Look for existing directory that matches the job name
    for dirname in os.listdir(parent_dir):
        if dirname.endswith(job_name):
            existing_dir = os.path.join(parent_dir, dirname)
            break

    # If no existing directory is found, create a new one
    if existing_dir is None:
        random_prefix = ''.join(random.choice(string.ascii_lowercase) for _ in range(8))
        new_dirname = f"{random_prefix}-{job_name}"
        existing_dir = os.path.join(parent_dir, new_dirname)
        try:
            os.mkdir(existing_dir)
        except Exception as e:
            logging.error(f"create_molstar_url(): Error creating directory: {e}")
            return None
        
    # Remove any existing files in the directory
    try:
        for filename in os.listdir(existing_dir):
            file_path = os.path.join(existing_dir, filename)
            os.remove(file_path)
    except Exception as e:
        logging.error(f"create_molstar_url(): Error removing files: {e}")
        return None
    
    # Create new file with a random prefix
    random_file_prefix = ''.join(random.choice(string.ascii_lowercase) for _ in range(8))
    file_name = f"{random_file_prefix}-{job_name}.{data_format}"
    file_path = os.path.join(existing_dir, file_name)
    try:
        with open(file_path, "w") as model_file:
            model_file.write(model)
    except Exception as e:
        logging.error(f"create_molstar_url(): Error writing file: {e}")
        return None
    
    # Create the Mol* viewer URL
    base_url = "https://molstar-viewer-ng.dyn.cloud.e-infra.cz/viewer/index.html"
    molstar_url = (
        f"{base_url}?structure-url=https%3A%2F%2Fmolstar-viewer-ng.dyn.cloud.e-infra.cz%2Falphafold%2F"
        f"{os.path.basename(existing_dir)}/{file_name}&structure-url-format={data_format}"
    )

    return molstar_url

# https://raw.githubusercontent.com/jasperzuallaert/VIBFold/main/visualize_alphafold_results.py
def get_alphafold_plddt(model_names):
    """Get pLDDT data from Alphafold result model files."""
    out = []
    for name in model_names:
        with open(name, 'rb') as f:
            d = pickle.load(f)

        # Check if 'plddt' key exists
        if 'plddt' not in d:
            logging.error(f"The key 'plddt' was not found in the file {name}")
            return jsonify({"error": f"The key 'plddt' was not found in the file {name}"}), 404

        # Convert numpy arrays to lists
        plddt = d['plddt']
        if isinstance(plddt, np.ndarray):
            plddt = plddt.tolist()

        out.append(plddt)

    # Ensure all pLDDT arrays have the same length
    num_plddt = len(out[0])
    for plddt_list in out:
        if len(plddt_list) != num_plddt:
            logging.error("All pLDDT arrays must have the same length.")
            return jsonify({"error": "All pLDDT arrays must have the same length"}), 404

    data = [{} for _ in range(num_plddt)]
    num_models = len(out)
    for i in range(num_models):
        for j in range(num_plddt):
            data[j][f"model_{i}"] = out[i][j]

    return data

def get_plddt_colabfold(model_names):
    """Get pLDDT data from ColabFold result model files."""
    out = []
    for name in model_names:
        with open(name, 'r') as f:
            d = json.load(f)

        # Check if 'plddt' key exists
        if 'plddt' not in d:
            return jsonify({"error": f"The key 'plddt' was not found in the file {name}"}), 404

        # Convert numpy arrays to lists
        plddt = d['plddt']
        if isinstance(plddt, np.ndarray):
            plddt = plddt.tolist()
        
        out.append(plddt)

    # Assuming all pLDDT arrays are the same length
    num_plddt = len(out[0])
    num_models = len(out)
    
    data = [{} for _ in range(num_plddt)]
    for i in range(num_models):
        for j in range(num_plddt):
            data[j][f"model_{i}"] = out[i][j] 
    
    return data


def get_plddt_data(job, user):
    """Get pLDDT data for plotting based on job type."""

    public_output_path = get_output_path(job, "public")
    if os.path.exists(public_output_path):
        output_path = public_output_path
    else:
        output_path = get_output_path(job, user)

    # Alphafold
    # https://github.com/google-deepmind/alphafold?tab=readme-ov-file#alphafold-output
    # According to Alphafold API, the pLDDT data is stored in the result_model_*.pkl file
    # that contains a dictionary with the following keys:
        # - 'plddt': pLDDT values for each residue
        # - 'pae': predicted alignment error
        # - 'structure_module': structure module
        # - 'predicted_aligned_error': predicted aligned error
        # - 'predicted_lddt': predicted lddt
    if len(glob.glob(f"{output_path}/result_model_*.pkl")) > 0:
        model_names = sorted(glob.glob(f"{output_path}/result_*.pkl"))
        result_model = get_alphafold_plddt(model_names)

        return result_model
    
    # ColabFold
    # according to ColabFold output directory structure
    # the pLDDT data is stored in the *_scores_rank_*.json file
    elif len(glob.glob(f"{output_path}/*_scores_rank_*.json")) > 0:
        model_names = sorted(glob.glob(f'{output_path}/*_scores_rank_*.json'))
        result_model = get_plddt_colabfold(model_names)
        
        return result_model
    
    return None

def get_output_files(output_files_list, output_dir, job_name, service):
    """Get the list of output files excluding certain types."""
    output_files = []
    if os.path.exists(output_dir):
        for file in output_files_list:
            if file.startswith("download"):
                continue
            if file.endswith("done"):
                continue
            if file.endswith("pkl"):
                continue
            if "." not in file:
                continue
            output_files.append({
                "name": file,
                "size": format_file_size(os.path.getsize(os.path.join(output_dir, file))),
                "type": file.split(".")[-1] if "." in file else "unknown",
                "downloadUrl": f"/api/flask/download/{job_name}/output/{file}/{service}"
            })

    # Sort files by name, but numbers in the name should be sorted numerically
    def sort_key(file):
        parts = re.split(r'(\d+)', file['name'])
        return [int(part) if part.isdigit() else part.lower() for part in parts]
    output_files.sort(key=sort_key)

    return output_files

def get_input_files(input_files_list, input_dir, job_name):
    """Get the list of input files excluding certain types."""
    input_files = []
    if os.path.exists(input_dir):
        if f"{job_name}.json" in input_files_list:
            input_files.append({
                "name": f"{job_name}.json",
                "size": format_file_size(os.path.getsize(os.path.join(input_dir, f"{job_name}.json"))),
                "type": "json",
                "downloadUrl": f"/api/flask/download/{job_name}/input/json"
            })
        if f"{job_name}.fasta" in input_files_list:
            input_files.append({
                "name": f"{job_name}.fasta",
                "size": format_file_size(os.path.getsize(os.path.join(input_dir, f"{job_name}.fasta"))),
                "type": "fasta",
                "downloadUrl": f"/api/flask/download/{job_name}/input/fasta"
            })
        
    return input_files

def format_file_size(size_bytes):
    """Convert bytes to human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    try:
        size_names = ["B", "KB", "MB", "GB"]
        i = int(math.floor(math.log(size_bytes, 1024)))
        p = math.pow(1024, i)
        s = round(size_bytes / p, 1)
        
        return f"{s} {size_names[i]}"
    except (ValueError, OverflowError):
        return f"{size_bytes} B"
    
def get_aligned_multifold_structures(job_list, user):
    models_data = {}
    for job_name in job_list:
        model_path = get_model_path(job_name, user)
        if not model_path:
            logging.error(f"Error loading model file for job: {job_name}")
            return jsonify({"error": f"Error loading model file for job: {job_name}"}), 404
        
        try:
            with open(model_path, "r") as f:
                model_data = f.read()
                data_format = model_path.split(".")[-1]
                if data_format == "cif":
                    data_format = "mmcif"
                models_data[job_name] = {
                    "model": model_data,
                    "dataFormat": data_format
                }
        except FileNotFoundError:
            logging.error(f"Error loading model file: {model_path}")
            return None
        
    if len(models_data) == 0:
        logging.warning(f"Not enough structures found for alignment: {len(models_data)}")
        return None
    
    try:
        aligned_data = align_multiple_structures(models_data)
        logging.info("Successfully aligned multiple structures.")
        return aligned_data
    except Exception as e:
        logging.error(f"Error aligning multiple structures: {e}")
        return None

def parse_af3_json(config_data):
    """ Parse Alphafold3 JSON config to extract sequences."""
    
    # Validate basic structure
    if 'sequences' not in config_data or not isinstance(config_data['sequences'], list):
        return None
    
    result = {}
    
    # Process each sequence entry
    for entry in config_data['sequences']:
        if 'protein' in entry:
            protein_data = entry['protein']
            chain_id = '-'.join(protein_data.get('id', []))
            result[f"protein-{chain_id}"] = protein_data.get('sequence', '')
            
        elif 'rna' in entry:
            rna_data = entry['rna']
            chain_id = '-'.join(rna_data.get('id', []))
            result[f"rna-{chain_id}"] = rna_data.get('sequence', '')
            
        elif 'dna' in entry:
            dna_data = entry['dna']
            chain_id = '-'.join(dna_data.get('id', []))
            result[f"dna-{chain_id}"] = dna_data.get('sequence', '')
            
        elif 'ligand' in entry:
            ligand_data = entry['ligand']
            chain_id = '-'.join(ligand_data.get('id', []))
            # Prefer SMILES over CCD codes, or use CCD codes joined
            if 'smiles' in ligand_data:
                result[f"ligand-{chain_id}"] = ligand_data['smiles']
            elif 'ccdCodes' in ligand_data:
                result[f"ligand-{chain_id}"] = ', '.join(ligand_data['ccdCodes'])
    
    return result
    