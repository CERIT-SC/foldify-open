from functools import wraps
from flask import current_app as app, jsonify, request
import logging
import jwt
from datetime import datetime, timezone
import os
from config import Config


SUBMISSION_DISABLED_MESSAGE = (
    "**Job submission is disabled on this instance** due to high demand on computational resources. "
    "You can still browse the example predictions and your existing results.  \n"
    "To run predictions, deploy Foldify on your own hardware from "
    "[GitHub](https://github.com/CERIT-SC/foldify-open), or use the full version at "
    "[foldify.cloud.e-infra.cz](https://foldify.cloud.e-infra.cz) after "
    "[creating a MetaCentrum account](https://metavo.metacentrum.cz/cs/application/index.html)."
)


def submission_disabled(f):
    """Decorator to reject every job submission request."""

    @wraps(f)
    def decorated(*args, **kwargs):
        logging.info(f'Rejected job submission request to {request.path}: submission is disabled.')
        return jsonify({'error': SUBMISSION_DISABLED_MESSAGE}), 503

    return decorated


def validate_session_token(token):
    """Validate the session JWT token and extract session ID."""
    
    session_secret = os.getenv('SESSION_SECRET', Config.SESSION_SECRET)
    try:
        payload = jwt.decode(token, session_secret, algorithms=['HS256'])
        expiration = payload.get('exp')
        if expiration and datetime.now(timezone.utc).timestamp() > expiration:
            logging.warning('Session token has expired.')
            return None

        session_id = payload.get('sessionId')
        if not session_id:
            logging.warning('Session ID not found in token payload.')
            return None

        logging.info(f'Session validated: {session_id}')
        return session_id
    except jwt.ExpiredSignatureError:
        logging.warning('Session token has expired.')
        return None
    except jwt.InvalidTokenError:
        logging.warning('Invalid session token.')
        return None


def token_required(f):
    """Decorator to ensure the request has a valid session token."""

    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from cookies
        token = request.cookies.get('session')

        if not token:
            logging.warning('Session token is missing.')
            return jsonify({'error': 'Session token is missing.'}), 401

        # Validate the session token
        session_id = validate_session_token(token)

        if session_id is None:
            logging.warning('Failed to validate session token.')
            return jsonify({'error': 'Invalid or expired session.'}), 401

        # Extract username from the userinfo (assuming 'username' is a field in the response)
        username = f"guest_{session_id}"
        logging.info(f'Session ID username: {username}')

        return f(current_user=username, *args, **kwargs)

    return decorated
