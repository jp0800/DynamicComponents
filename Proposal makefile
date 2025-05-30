Great! You want to:

Declare a project name as a Makefile variable (e.g., PROJECT_NAME = asan)

Name the virtual environment folder as venv_<project_name> (e.g., venv_asan)

Update all commands and script paths to reflect that custom venv name



---

✅ Updated Makefile with Custom Named Venv

# === Configuration ===
PROJECT_NAME := asan
VENV_DIR := dev-env/venv_$(PROJECT_NAME)

.PHONY: all setup_folders setup_frontend setup_backend setup_venv activate_venv

all: setup_folders setup_frontend setup_backend setup_venv
	@echo "✅ Project structure created successfully."

setup_folders:
	@echo "📁 Creating dev-env folders and placeholder files..."
	mkdir -p dev-env/local dev-env/deploy frontend/src backend/src
	touch dev-env/local/Dockerfile dev-env/local/docker-compose.yml
	touch dev-env/deploy/Dockerfile dev-env/deploy/docker-compose.yml dev-env/deploy/dockerfile_nginx

setup_frontend:
	@echo "🌐 Setting up Vue3 + Vuetify frontend..."
	cd frontend && \
		npm create vite@latest . -- --template vue && \
		npm install && \
		npm install vuetify@next sass sass-loader -D && \
		mkdir -p src && \
		echo "// Entry point placeholder" > src/main.js
	@echo "✅ Frontend setup done."

setup_backend:
	@echo "🐍 Setting up Python backend with pipenv..."
	cd backend && \
		pipenv --python 3 && \
		pipenv install flask && \
		mkdir -p src && \
		echo "# Sample Flask app" > src/app.py
	@echo "✅ Backend setup done."

setup_venv:
	@echo "🐍 Creating Python venv: $(VENV_DIR)"
	python3 -m venv $(VENV_DIR)
	@echo "⚙️  Creating activate-backend.sh script..."
	echo '#!/bin/bash' > dev-env/activate-backend.sh
	echo 'source "$(dirname "$$0")/venv_$(PROJECT_NAME)/bin/activate"' >> dev-env/activate-backend.sh
	echo 'cd "$(dirname "$$0")/../backend"' >> dev-env/activate-backend.sh
	echo 'exec "$$SHELL"' >> dev-env/activate-backend.sh
	chmod +x dev-env/activate-backend.sh
	@echo "✅ Python venv and helper script created."

activate_venv:
	@echo "👉 To activate the venv and cd into backend, run:"
	@echo "source $(VENV_DIR)/bin/activate && cd backend"
	@echo "Or simply execute: ./dev-env/activate-backend.sh"


---

✅ Example Output

If PROJECT_NAME := asan, then:

Virtualenv will be in: dev-env/venv_asan/

The activate script will reference: source dev-env/venv_asan/bin/activate



---

Would you like to also store the PROJECT_NAME in a .env file and have Makefile read from it?
