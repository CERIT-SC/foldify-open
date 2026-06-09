# Add this to config.py and fill in the values

# Session management secret key
# IMPORTANT: Generate a strong random secret (min 32 characters) with ```openssl rand -base64 32```
# This MUST match the SESSION_SECRET in your frontend .env.local config

import os

class Config:
    SESSION_SECRET = os.getenv("SESSION_SECRET", "")

    # Email Configuration
    EMAIL_FROM = os.getenv("EMAIL_FROM", "")

    # Namespace
    NAMESPACE = os.getenv("NAMESPACE", "")

    # Results directory
    PROD_RESULTS_DIRECTORY = os.getenv("PROD_RESULTS_DIRECTORY", "")

    # BASE URL (for e-mails)
    BASE_URL = os.getenv("BASE_URL", "")

    # FOLDING TOOLS IMAGES
    ESMFOLD_IMAGE = os.getenv("ESMFOLD_IMAGE", "")
    ALPHAFOLD_IMAGE_V2 = os.getenv("ALPHAFOLD_IMAGE_V2", "")
    ALPHAFOLD3_IMAGE = os.getenv("ALPHAFOLD3_IMAGE", "")
    OMEGAFOLD_IMAGE = os.getenv("OMEGAFOLD_IMAGE", "")
    COLABFOLD_IMAGE = os.getenv("COLABFOLD_IMAGE", "")

    # PVCs
    PVC_VOL1_ALPHAFOLD = os.getenv("PVC_VOL1_ALPHAFOLD")
    PVC_VOL1_ALPHAFOLD3 = os.getenv("PVC_VOL1_ALPHAFOLD3")
    PVC_VOL2 = os.getenv("PVC_VOL2")
    PVC_STORAGE = os.getenv("PVC_STORAGE")
    PVC_TMP = os.getenv("PVC_TMP")

    # README files for output archives
    README_BASE_PATH = os.getenv("README_BASE_PATH", "/mnt/readmes")
    README_ALPHAFOLD2 = os.path.join(README_BASE_PATH, "alphafold2.md")
    README_ALPHAFOLD3 = os.path.join(README_BASE_PATH, "alphafold3.md")
    README_COLABFOLD = os.path.join(README_BASE_PATH, "colabfold.md")
    README_ESMFOLD = os.path.join(README_BASE_PATH, "esmfold.md")
    README_OMEGAFOLD = os.path.join(README_BASE_PATH, "omegafold.md")

