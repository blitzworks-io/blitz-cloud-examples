# Build stage: install packages into a virtualenv we can copy as one folder.
FROM python:3.13.15-slim-trixie AS build
RUN python -m venv /venv
COPY requirements.txt .
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.13.15-slim-trixie
ENV PATH="/venv/bin:$PATH" PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
# A regular user with uid 1000, matching the uid blitz.cloud runs apps as.
RUN useradd --uid 1000 --create-home app
COPY --from=build /venv /venv
WORKDIR /home/app
COPY app ./app
USER 1000
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers", "--forwarded-allow-ips", "*"]
