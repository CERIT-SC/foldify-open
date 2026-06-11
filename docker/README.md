# Docker Images for Folding Tools

This directory contains Dockerfiles for the protein folding tools used by the Foldify API.

## Available Images

| Tool | Dockerfile | Notes | Version |
|------|------------|-------|------|
| AlphaFold 2 | `Dockerfile.alphafold2` | Based on CUDA 12.2.2, includes AlphaFold 2 and ColabFold | 2.3.2 |
| ColabFold | `Dockerfile.alphafold2` | **The same image as AlphaFold 2** | 1.6.1 |
| AlphaFold 3 | `Dockerfile.alphafold3` | Based on CUDA 12.6.0 | 3.0.1 |
| ESMFold | `Dockerfile.esmfold` | Based on NVIDIA PyTorch 22.03 | latest |
| OmegaFold | `Dockerfile.omegafold` | Based on NVIDIA PyTorch 24.10 | 1.1.0 |

## Building the Images

Run the following commands from the repository root to build and push each image:

```bash
# AlphaFold 2 and ColabFold
docker build -f docker/Dockerfile.alphafold2 -t your-registry/alphafold2:latest .
docker push your-registry/alphafold2:latest

# AlphaFold 3
docker build -f docker/Dockerfile.alphafold3 -t your-registry/alphafold3:latest .
docker push your-registry/alphafold3:latest

# ESMFold
docker build -f docker/Dockerfile.esmfold -t your-registry/esmfold:latest .
docker push your-registry/esmfold:latest

# OmegaFold
docker build -f docker/Dockerfile.omegafold -t your-registry/omegafold:latest .
docker push your-registry/omegafold:latest
```

Replace `your-registry` with your Docker registry path (e.g., `ghcr.io/username`, `docker.io/username`, etc.).

## Configuration

After building and pushing the images, set the corresponding environment variables in your deployment environment (or in [`api/config_template.py`](../api/config_template.py)) so the API knows which images to use when submitting Kubernetes jobs:

```bash
export ALPHAFOLD_IMAGE_V2="your-registry/alphafold2:latest"
export COLABFOLD_IMAGE="your-registry/alphafold2:latest"
export ALPHAFOLD3_IMAGE="your-registry/alphafold3:latest"
export ESMFOLD_IMAGE="your-registry/esmfold:latest"
export OMEGAFOLD_IMAGE="your-registry/omegafold:latest"
```
