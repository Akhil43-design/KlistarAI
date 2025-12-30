# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for Audio and OpenCV
# portaudio19-dev: for PyAudio
# libgl1-mesa-glx & libglib2.0-0: for OpenCV
# x11-utils: for PyAutoGUI (even if unused, imports might check)
RUN apt-get update && apt-get install -y \
    gcc \
    portaudio19-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to cache installation
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Render sets PORT env var, but we default to 8000)
ENV PORT=8000
EXPOSE 8000

# Run the server
# Use 0.0.0.0 to bind to all interfaces (Required for Docker/Cloud)
CMD ["sh", "-c", "uvicorn backend.server:app --host 0.0.0.0 --port $PORT"]
