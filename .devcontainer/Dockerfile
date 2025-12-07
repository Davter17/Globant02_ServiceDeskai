FROM node:20-bullseye

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    zsh \
    curl \
    wget \
    vim \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install oh-my-zsh for better terminal experience
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.5/zsh-in-docker.sh)" -- \
    -t robbyrussell

# Set the default shell to zsh
ENV SHELL /bin/zsh

# Create workspace directory
RUN mkdir -p /workspace && chown -R node:node /workspace

# Set working directory
WORKDIR /workspace

# Switch to node user
USER node

# Keep container running
CMD ["sleep", "infinity"]
