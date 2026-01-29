from flask import jsonify
import re
from datetime import datetime
import logging

def validate_job_name(job_name):
    """Validate the job name."""
    if not isinstance(job_name, str):
        return jsonify({"error": "Job name must be a string."}), 400
    if len(job_name) > 36:
        return jsonify({"error": "Job name must be less than 36 characters."}), 400
    if not re.match(r"^[a-zA-Z0-9]([-a-zA-Z0-9]*[a-zA-Z0-9])?$", job_name):
        return jsonify({"error": "Job name must consist of alphanumeric characters or '-'."}), 400
    return None

def validate_sequence(input_sequence):
    """Validate the sequence."""
    if not input_sequence.startswith(">"):
        return jsonify({"error": "FASTA format error: Missing header line starting with '>'."}), 400

    lines = input_sequence.strip().split("\n")

    if lines[0] == ">":
        return jsonify({"error": "FASTA format error: Name of the sequence cannot be empty. Correct format is: >NAME."}), 400

    if len(lines) < 2:
        return jsonify({"error": "FASTA format error: Missing sequence."}), 400
    
    return None

def validate_date(date):
    """Validate the date."""
    if date is None:
        return None
    
    if date == "":
        return jsonify({"error": "Date cannot be empty."}), 400
    
    if not isinstance(date, str):
        return jsonify({"error": "Date must be a string."}), 400
    
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Expected format: YYYY-MM-DD"}), 400
    
    return None

def validate_numeric_input(value):
    """Validate the numeric input."""
    try:
        value = float(value)
    except ValueError:
        return jsonify({"error": "Value must be a number."}), 400
    return None

def validate_email(email):
    """Validate the email address."""
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email address."}), 400
    return None