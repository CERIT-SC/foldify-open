import os
import sys
import pytest

# Add the parent directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))
from app import create_app

# From: https://gitlab.com/patkennedy79/flask_user_management_example/-/blob/main/tests/conftest.py
@pytest.fixture(scope='module')
def test_client():
    # Set the testing configuration prior to creating a new Flask application
    os.environ['CONFIG_TYPE'] = 'config.TestingConfig'
    flask_app = create_app()

    # Create a test client using the Flask application configured for testing
    with flask_app.test_client() as testing_client:
        # Establish an application context
        with flask_app.app_context():
            yield testing_client 

@pytest.fixture
def app():
    app = create_app()  # Ensure your app creation logic is correct
    with app.app_context():
        yield app