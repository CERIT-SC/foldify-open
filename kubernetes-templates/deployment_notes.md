Build Docker images

!!!!
Dont forget to set your namespace in the api/shared/common.py file.
!!!!

```bash
cd api
docker build -t <your-backend-image> -f Dockerfile .
cd ..
cd web
docker build -t <your-frontend-image> -f Dockerfile .
cd ..
```

README files for output archives

Place tool-specific README Markdown files on the shared volume mounted at `/mnt` (PVC_VOL2) under the `readmes/` directory.
The path is configurable via the `README_BASE_PATH` environment variable (default: `/mnt/readmes`).

Expected files:

```
/mnt/readmes/
├── alphafold2.md   → included in AlphaFold 2 output zips as README.md
├── alphafold3.md   → included in AlphaFold 3 output zips as README.md
├── colabfold.md    → included in ColabFold output zips as README.md
├── esmfold.md      → included in ESMFold output zips as README.md
└── omegafold.md    → included in OmegaFold output zips as README.md
```

Jobs check for the existence of these files before copying, so missing files will not cause failures.

Push Docker images to hub.cerit.io

```bash
docker push <your-backend-image>
docker push <your-frontend-image>
```

K8s deployment

```bash
kubectl apply -f kubernetes -n <your-name-space>
```
