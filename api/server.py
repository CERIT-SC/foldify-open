from app import create_app
import os

import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
app = create_app()

if __name__ == "__main__":

    env = os.getenv('FLASK_ENV', 'development')

    if env == 'development':
        app.run(debug=True, port=8080)  # Development
    else:
        app.run(host="0.0.0.0", port=8080)  # Production
