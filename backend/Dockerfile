# Cuándo Florece API + scheduled worker (same image, different command)
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app

# Dependencies first (cached between code changes). rasterio wheels bundle GDAL: no system packages needed.
COPY pyproject.toml ./
RUN mkdir florece && touch florece/__init__.py && pip install . && pip uninstall -y florece && rm -rf florece

COPY florece ./florece
RUN pip install --no-deps . \
 && useradd --system --uid 1000 --home /app florece \
 && mkdir -p /data && chown florece /data
USER florece
ENV FLORECE_DATA_DIR=/data
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/salud')" || exit 1
# Apply migrations, then serve. --proxy-headers: trust X-Forwarded-* from Caddy (client IP for rate limits).
CMD ["sh", "-c", "florece migrar && exec uvicorn florece.main:app --host 0.0.0.0 --port 8000 --workers 2 --proxy-headers --forwarded-allow-ips='*'"]
