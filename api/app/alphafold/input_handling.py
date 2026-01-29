from flask import jsonify

from app.shared.input_validation import validate_job_name, validate_sequence, validate_date, validate_numeric_input, \
    validate_email


def split_sequence_input(sequence_input):
    """Split the sequence input into individual sequences by '>' character."""
    try:
        sequences = sequence_input.split(">")
    except AttributeError:
        return None

    formatted_sequences = []
    for seq in sequences:
        if seq == "":
            continue
        else:
            seq = ">" + seq
            formatted_sequences.append(seq)

    return formatted_sequences


def validate_protein_input(sequence):
    """Validate the protein sequence input accroding to chosen model preset by the user."""

    sequences = split_sequence_input(sequence)
    if sequences is None:
        return jsonify({"error": "Invalid sequence input"}), 400
    for seq in sequences:
        validation_error = validate_sequence(seq)
        if validation_error:
            return validation_error

    return None


def validate_alphafold2_input(data):
    """Validate the input data."""
    if "jobName" not in data or "proteinSequence" not in data or "maxTemplateDate" not in data or "dbPreset" not in data or "modelPreset" not in data or "reuseMSAs" not in data or "predictionsPerModel" not in data or "runRelax" not in data or "makeResultsPublic" not in data or "email" not in data or "version" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    if validate_job_name(data["jobName"]):
        return validate_job_name(data["jobName"])

    if data["modelPreset"] not in ["monomer", "monomer_casp14", "monomer_ptm", "multimer"]:
        return jsonify({"error": "Invalid Model Preset value"}), 400

    validateProteinInputError = validate_protein_input(data["proteinSequence"])
    if validateProteinInputError:
        return validateProteinInputError

    if data["version"] not in ["Alphafold 2.2.0", "Alphafold 2.3.1"]:
        return jsonify({"error": "Invalid AlphaFold version"}), 400

    if validate_date(data["maxTemplateDate"]):
        return validate_date(data["maxTemplateDate"])

    if validate_numeric_input(data["predictionsPerModel"]):
        return jsonify({"error": "Predictions Per Model value must be a number."}), 400

    if data["dbPreset"] not in ["full_dbs", "reduced_dbs"]:
        return jsonify({"error": "Invalid DB Preset value"}), 400

    if validate_email(data["email"]):
        return validate_email(data["email"])

    if data["reuseMSAs"] not in [False, True]:
        return jsonify({"error": "Invalid Reuse MSAs value"}), 400

    if data["forceComputation"] not in [False, True]:
        return jsonify({"error": "Invalid Force Computation value"}), 400

    if data["runRelax"] not in [False, True]:
        return jsonify({"error": "Invalid Run Relax value"}), 400

    if data["makeResultsPublic"] not in [False, True]:
        return jsonify({"error": "Invalid Make Results Public value"}), 400

    return None
