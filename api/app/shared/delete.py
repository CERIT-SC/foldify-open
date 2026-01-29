import logging
import os
import shutil
from flask import jsonify
from app.shared.common import get_output_path, get_input_path

def delete_path(path, is_dir=False):
    """Delete a path."""
    try:
        if is_dir:
            shutil.rmtree(path)
        else:
            os.remove(path)
    except FileNotFoundError:
        logging.info(f"Path {path} not found, skipping deletion.")
        pass
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    return None

def delete_symlink(path):
    """Delete a symlink."""
    try:
        if os.path.islink(path):
            os.unlink(path)
    except FileNotFoundError:
        logging.info(f"Symlink {path} not found, skipping deletion.")
        pass
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    return None


def delete_job_files(job_name, user):
    """Delete the job files."""
    paths_to_delete = [
        {"path": get_output_path(job_name, user), "is_dir": True},
        {"path": get_input_path(job_name, "fasta", user), "is_dir": False},
        {"path": get_input_path(job_name, "json", user), "is_dir": False},
        {"path": get_input_path(job_name, "fasta", "public"), "is_dir": False},
        {"path": get_input_path(job_name, "json", "public"), "is_dir": False}
    ]
    symlinks_to_delete = [
        {"path": get_output_path(job_name, "public")},
        {"path": get_input_path(job_name, "fasta", "public")},
        {"path": get_input_path(job_name, "json", "public")}
    ]

    for item in paths_to_delete:
        result = delete_path(item["path"], item["is_dir"])
        if result:
            return jsonify({"message": f"Error deleting job files for {job_name}."}), 500

    for symlink in symlinks_to_delete:
        result = delete_symlink(symlink["path"])
        if result:
            return jsonify({"message": f"Error deleting symlinks for {job_name}."}), 500

    return None
