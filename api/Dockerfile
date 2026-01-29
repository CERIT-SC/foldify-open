# Use the official Python image from the Docker Hub
FROM python:3.10

# Set the environment variable
ENV FLASK_ENV=production

# Set the working directory
WORKDIR /app

COPY requirements.txt .

# Install dependencies directly into the Docker image
RUN pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install jax==0.3.25 -f https://storage.googleapis.com/jax-releases/jax_releases.html && \
    pip install jaxlib==0.3.25 -f https://storage.googleapis.com/jax-releases/jax_releases.html

# Copy the contents of the local api directory to the working directory in the container
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set the default command to run the Flask server
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "--timeout","6000", "server:app"]