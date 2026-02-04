FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Install GitHub CLI with retry logic and better error handling
RUN apt-get update \
    && apt-get install -y curl gnupg \
    && mkdir -p /usr/share/keyrings \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh

# Install Google Cloud CLI with proper keyring setup
RUN mkdir -p /usr/share/keyrings \
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get update \
    && apt-get install -y google-cloud-cli

# Install Cloud SQL Auth Proxy v2 (use GCS to avoid GitHub asset 404s)
ARG CLOUD_SQL_PROXY_VERSION=2.12.0
RUN ARCH="$(dpkg --print-architecture)" \
    && case "$ARCH" in \
        amd64) PROXY_ARCH="amd64" ;; \
        arm64) PROXY_ARCH="arm64" ;; \
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;; \
    esac \
    && curl -fsSL "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v${CLOUD_SQL_PROXY_VERSION}/cloud-sql-proxy.linux.${PROXY_ARCH}" -o /usr/local/bin/cloud-sql-proxy \
    && chmod +x /usr/local/bin/cloud-sql-proxy

# Install Terraform
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list \
    && apt-get update \
    && apt-get install -y terraform

# Install Docker CLI (for building images - Docker daemon is accessed from host)
RUN apt-get update \
    && apt-get install -y ca-certificates curl \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc \
    && chmod a+r /etc/apt/keyrings/docker.asc \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli docker-buildx-plugin docker-compose-plugin

# Create docker group (or reuse existing GID 999 group) and add node user for Docker socket access
# The GID 999 matches the typical host docker group - reuse if already taken in base image
RUN if getent group docker > /dev/null; then \
        usermod -aG docker node; \
    elif getent group 999 > /dev/null; then \
        EXISTING_GROUP="$(getent group 999 | cut -d: -f1)"; \
        usermod -aG "$EXISTING_GROUP" node; \
    else \
        groupadd -g 999 docker; \
        usermod -aG docker node; \
    fi

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
