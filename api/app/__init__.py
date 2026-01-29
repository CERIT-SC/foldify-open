from flask import Flask
from flask_cors import CORS

# blueprints
from app.alphafold.routes import alphafold
from app.alphafold3.routes import alphafold3
from app.colabfold.routes import colabfold
from app.esmfold.routes import esmfold
from app.omegafold.routes import omegafold
from app.dashboard.routes import dashboard
from app.result.routes import result
from app.download.routes import download

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object("config.Config")

    # CORS(app)
    CORS(app, resources={r"/api/*": {"origins": ["https://localhost:3000", "https://localhost:5000"] }})

    # Register blueprints
    app.register_blueprint(alphafold, url_prefix="/api/flask/alphafold")
    app.register_blueprint(alphafold3, url_prefix="/api/flask/alphafold3")
    app.register_blueprint(colabfold, url_prefix="/api/flask/colabfold")
    app.register_blueprint(esmfold, url_prefix="/api/flask/esmfold")
    app.register_blueprint(omegafold, url_prefix="/api/flask/omegafold")
    app.register_blueprint(dashboard, url_prefix="/api/flask/dashboard")
    app.register_blueprint(result, url_prefix="/api/flask/result")
    app.register_blueprint(download, url_prefix="/api/flask/download")

    return app