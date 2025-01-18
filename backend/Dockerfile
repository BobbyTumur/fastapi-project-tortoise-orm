FROM python:3.11-slim

# Set environment variables to prevent Python from writing .pyc files to disc
# and to ensure the output is sent to the terminal in a non-buffered manner
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Set PYTHONPATH to include the app directory
ENV PYTHONPATH=/app

# Install dependencies from requirements.txt and copy necessary files
COPY pyproject.toml requirements.txt scripts/migrate.sh ./

RUN apt-get update && apt-get install -y curl
RUN pip install --no-cache-dir -r requirements.txt
RUN chmod +x migrate.sh

# Copy the rest of the application code
COPY ./app /app/app

# ENTRYPOINT to run migrations first, then start the FastAPI server
ENTRYPOINT ["sh", "-c", "./migrate.sh && fastapi run --workers 4 app/main.py"]
