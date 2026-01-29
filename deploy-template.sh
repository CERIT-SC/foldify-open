set -euo pipefail

NS=""
BACKEND_IMAGE=""
FRONTEND_IMAGE=""

echo ">>>>>> Building Docker images"
docker build -t "$BACKEND_IMAGE" -f api/Dockerfile api
docker build -t "$FRONTEND_IMAGE" -f web/Dockerfile web

echo ">>>>>> Pushing images"
docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

# Check for existing Deployments
if kubectl get deployment -n "$NS" >/dev/null 2>&1; then
  echo ">>>>>> Found existing deployments in ${NS}. Applying manifests…"
  kubectl apply -f kubernetes -n "$NS"

  echo ">>>>>> Rolling restart of all deployments:"
  kubectl rollout restart deployment.apps/flask-deployment -n "$NS"
  kubectl rollout restart deployment.apps/nextjs-deployment -n "$NS"

  echo ">>>>>> Waiting for rollouts to finish…"
  for deploy in $(kubectl get deployment -n "$NS" -o name); do
    kubectl rollout status "$deploy" -n "$NS"
  done
else
  echo ">>>>>> Applying manifests…"
  kubectl apply -f kubernetes -n "$NS"
fi

echo "✅ Deployment complete in namespace ${NS}."
