# Foldify Open - Web Application for Protein Structure Prediction

![image](/web/public/foldify-logo.png)

This web application is designed to provide a user-friendly interface for protein structure prediction using AI tools. It allows users to upload protein sequences, run predictions, visualize the results in web and download the results locally. The application is built using Next.js for the frontend and Flask for the backend, with Docker for containerization and deployment.

For development purposes (the submission of jobs will not work), the application can be run via [Docker Compose](#running-the-application-via-docker-compose) or manually on a [local machine](#running-the-application-locally). For production use (with working prediction submission), the application can be [deployed in a Kubernetes](#running-the-application-in-kubernetes) cluster with prepared Docker images for every prediction tool. In all three cases, the application needs to be [configured with an authentication service](#authentication-credentials-setup) for user authentication.

## Prerequisites

- **Linux** - the application is designed to run on Linux systems
- Docker (version 28.0.1 or higher) - for running the application in containers
- Node.js (version 20.19.1)
- npm (version 10.8.2)
- Python (version **3.10.17**) - required for the AlphaFold 2
- Pip (version 25.1)

**Anonymous Session:** This version of application is designed to work publicly, but for preserving the computed data, an anonymous authentication via JWT tokens is used. All you need is to establish an authentication secret that will be provided both for backend and frontend.

### Configuration Steps

#### Backend configuration

1. Copy the template `config-template.py` file to `config.py` in the `api` directory:
    ```bash
    cd api
    cp config-template.py config.py
    ```
2. All the variables listed in the config must be set as ENV variables in your deployment environment. In particular, set the `SESSION_SECRET` variable to a strong random secret generated with `openssl rand -base64 32`. The rest of the variables shall be set with needed values for your environment.

#### Front-end session configuration

1. Copy the template `.env-template.local` file to `.env.local` in the `web` directory:
    ```bash
    cd web
    cp .env-template.local .env.local
    ```
2. Edit `.env.local` and set the `SESSION_SECRET` variable to the same value as in the backend configuration.

#### Kubernetes configuration

1. Copy the template kubernetes manifests from `kubernetes-templates` directory to the new `kubernetes` directory (including all the files inside):
    ```bash
    cp -r kubernetes-manifests kubernetes
    ```
2. Edit `secrets.yaml` and set the `SESSION_SECRET` variable to a strong random secret generated with `openssl rand -base64 32`. All the other manifests update with your namespace, image names, and other necessary configurations as described in the comments within each file. The `configmap.yaml` needs to be updated with the same ENV variables as in the backend configuration.

Note: The `kubernetes` files should not be committed to version control. Directory is included in the `.gitignore` file to prevent accidental exposure of sensitive information.

## Running the Application via Docker Compose

The application can be run using Docker Compose, which simplifies the process of managing multiple containers. The `compose.yml` file in root directory defines the services required for the application to run.

Run the following command to start the application:

```bash
docker compose up
```

This command will build the necessary Docker images and start the containers for the frontend, backend, and any other required services. The application will be accessible at `http://localhost:3000`.

## Running the Application Locally

The application can also be run locally without Docker. This is useful for development and testing purposes.

### Frontend (Next.js)

The frontend is located in the `web` directory. To run the frontend locally, follow these steps:

1. Navigate to the `web` directory:
    ```bash
    cd web
    ```
2. Install the required dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
4. Open your web browser and navigate to `http://localhost:5000` or `http://localhost:3000` to access the application.

### Backend (Flask)

The backend is located in the `api` directory. To run the backend locally, follow these steps:

1. Navigate to the `api` directory:
    ```bash
    cd api
    ```
2. Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3. Activate the virtual environment:
    - On macOS and Linux:
        ```bash
        source venv/bin/activate
        ```
4. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5. Install `jax` and `jaxlib` in version 0.3.5 (required for AlphaFold 2):
    ```bash
    pip install jax==0.3.25 -f https://storage.googleapis.com/jax-releases/jax_releases.html
    pip install jaxlib==0.3.25 -f https://storage.googleapis.com/jax-releases/jax_releases.html
    ```
6. Set the environment variable for Flask:
    ```bash
    export FLASK_ENV=development
    ```
7. Start the Flask server:
    ```bash
    python3 server.py
    ```
8. The backend will be accessible at `http://localhost:8080`.
9. To deactivate the virtual environment, run:
    ```bash
    deactivate
    ```

## Running the Application in Kubernetes

The application can be deployed in a Kubernetes cluster for production use.

The instructions are described in kubernetes/deployment_notes.md. Or you can use **prepared script**. But do not forget to update the data in the script !!

### Build & Deploy with Predefined Script

Script template is located in the root directory of the project. It automates the process of building Docker images and deploying the application to a Kubernetes cluster. Note that the scripts need to be modified for your environment, the namespace is set in the scripts via `NS` variable.

1. Copy the template `deploy-template.sh` file to `deploy.sh` in the `root` directory:
    ```bash
    cp deploy-template.sh deploy.sh
    ```
2. Edit `deploy.sh` and set the `NS` variable to your namespace and the `BACKEND_IMAGE` and `FRONTEND_IMAGE` variables to your image names in the registry, e.g. `registy.io/<your-username>/<image>`.
3. Make the script executable:
    ```bash
    chmod +x deploy.sh
    ```
4. Run the script:
    ```bash
    ./deploy.sh
    ```

## Folding Tools Configuration

The application supports multiple protein structure prediction tools. Each tool requires specific manifests and Docker images for deployment in Kubernetes. The currently supported tools include:

- AlphaFold 3
- AlphaFold 2
- ColabFold
- OmegaFold
- ESMFold

The configuration for these tools is contained within the `configmap.yaml` file in the `kubernetes` directory. Ensure that the Docker images for each tool are built and pushed to your container registry before deploying the application.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact the author at [duraciova@mail.muni.cz](mailto:duraciova@mail.muni.cz).
