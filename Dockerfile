# Use an official Python runtime as a parent image
FROM python:3.11

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libyaml-dev

# Upgrade pip and setuptools
RUN pip install --upgrade pip setuptools wheel

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]