# ==========================================
# RAG Service Dockerfile - Python + FastAPI
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Cài system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Cài Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Tạo thư mục data
RUN mkdir -p /app/data/vector_store /app/data/raw_documents

# Non-root user
RUN adduser --disabled-password --gecos '' raguser
RUN chown -R raguser:raguser /app
USER raguser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "src/main.py"]
