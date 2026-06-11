import pytest
from unittest.mock import patch
import re
from flask import Flask, jsonify
from tests.conftest import app
from app.shared.input_validation import validate_job_name, validate_sequence, validate_date, validate_numeric_input, validate_email

def test_validate_job_name(app):
    """Test the validate_job_name function."""
    # Valid cases
    assert validate_job_name("valid-job-name") is None
    assert validate_job_name("validname123") is None
    assert validate_job_name("a") is None  # Minimum valid length

    # Invalid cases
    response, status_code = validate_job_name(123) # Not a string
    assert status_code == 400
    assert "Job name must be a string" in response.json["error"]

def test_validate_sequence(app):
    """Test the validate_sequence function."""
    # Valid cases
    assert validate_sequence(">Header\nSEQUENCE") is None
    assert validate_sequence(">Header\nSEQUENCE\n") is None
    assert validate_sequence(">Header\nSEQUENCE\n\n") is None

    # Invalid cases
    response, status_code = validate_sequence("SEQUENCE")  # Missing header
    assert status_code == 400
    assert "FASTA format error: Missing header" in response.json["error"]

    response, status_code = validate_sequence(">Header")  # Missing sequence
    assert status_code == 400
    assert "FASTA format error: Missing sequence" in response.json["error"]

    response, status_code = validate_sequence(">\nSEQUENCE")  # Missing name of sequence
    assert status_code == 400
    assert "FASTA format error: Name of the sequence cannot be empty." in response.json["error"]

def test_validate_date(app):
    """Test the validate_date function."""
    # Valid cases
    assert validate_date("2022-01-01") is None
    assert validate_date(None) is None

    # # Invalid cases
    response, status_code = validate_date("")  # Empty string
    assert status_code == 400
    assert "Date cannot be empty" in response.json["error"]

    response, status_code = validate_date(123)  # Not a string
    assert status_code == 400
    assert "Date must be a string" in response.json["error"]

    response, status_code = validate_date("2022-01")  # Invalid format
    assert status_code == 400
    assert "Invalid date format. Expected format: YYYY-MM-DD" in response.json["error"]

    response, status_code = validate_date("2022-01-01T00:00:00")  # Invalid format
    assert status_code == 400
    assert "Invalid date format. Expected format: YYYY-MM-DD" in response.json["error"]

    response, status_code = validate_date("2022-31-12")  # Invalid format
    assert status_code == 400
    assert "Invalid date format. Expected format: YYYY-MM-DD" in response.json["error"]

def test_validate_numeric_input(app):
    """Test the validate_numeric_input function."""
    # Valid cases
    assert validate_numeric_input("1") is None
    assert validate_numeric_input("1.0") is None
    assert validate_numeric_input("1.0e-5") is None

    # Invalid cases
    response, status_code = validate_numeric_input("one")  # Not a number
    assert status_code == 400
    assert "Value must be a number" in response.json["error"]

def test_validate_email(app):
    """Test the validate_email function."""
    # Valid cases
    assert validate_email("example@e-infra.com") is None
    assert validate_email("user2654@mail.muni.cz") is None
    assert validate_email("first.last@sub.domain.org") is None
    assert validate_email("user_name@domain.co.uk") is None

    # Invalid cases
    response, status_code = validate_email("example.com")  # Missing '@'
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email("rm -rf") # Command line argument
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email("example@muni")  # Missing domain
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    # Command injection payloads must be rejected
    response, status_code = validate_email('email@example.com$(echo ahoj > /storage/hehe.txt)')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com`whoami`')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com; rm -rf /')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com|cat /etc/passwd')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com && ls')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com < /etc/passwd')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email('email@example.com > /tmp/out')
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email(123)  # Non-string
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]

    response, status_code = validate_email("a" * 250 + "@test.com")  # Too long (>254)
    assert status_code == 400
    assert "Invalid email address" in response.json["error"]


def test_validate_job_name_path_traversal(app):
    """Test that path traversal payloads are rejected by validate_job_name."""
    traversal_names = [
        "../etc/passwd",
        "..",
        "foo/../bar",
        "foo/bar",
        "foo\\bar",
        "foo; rm -rf /",
        "foo|cat /etc/passwd",
        "foo$(whoami)",
        "foo`whoami`",
    ]
    for name in traversal_names:
        result = validate_job_name(name)
        assert result is not None, f"Expected rejection for job name: {name!r}"
        response, status_code = result
        assert status_code == 400
        assert "Job name must consist" in response.json["error"]


def test_get_input_path_rejects_traversal(app, tmp_path):
    """Test that get_input_path raises ValueError when path traversal is attempted."""
    from app.shared.common import get_input_path
    with patch("app.shared.common.get_working_directory", return_value=str(tmp_path)):
        with pytest.raises(ValueError, match="path traversal detected"):
            get_input_path("../../../etc/passwd", "json", "user1")


def test_get_output_path_rejects_traversal(app, tmp_path):
    """Test that get_output_path raises ValueError when path traversal is attempted."""
    from app.shared.common import get_output_path
    with patch("app.shared.common.get_working_directory", return_value=str(tmp_path)):
        with pytest.raises(ValueError, match="path traversal detected"):
            get_output_path("../../../etc/passwd", "user1")

