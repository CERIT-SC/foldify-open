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

Push Docker images to hub.cerit.io

```bash
docker push <your-backend-image>
docker push <your-frontend-image>
```

K8s deployment

```bash
kubectl apply -f kubernetes -n <your-name-space>
```
