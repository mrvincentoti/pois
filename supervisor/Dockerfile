FROM python:3.9

RUN apt-get update && \
    apt-get install -y supervisor && \
    rm -rf /var/lib/apt/lists/*

# Copy everything into the /app/ directory
COPY . /app/

# Set working directory
WORKDIR /app/

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Supervisor configuration file into the container
COPY supervisor.conf /etc/supervisor/conf.d/

# Copy specific scripts into the /app/ directory
COPY redisscript.py worker.py create_employee_worker.py /app/


# Start Supervisor when the container starts
CMD ["supervisord", "-n"]