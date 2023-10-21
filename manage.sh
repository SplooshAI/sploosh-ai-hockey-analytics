#!/bin/bash

# Ensure the script exits if any command fails
set -e

# Define the directory for the virtual environment
VENV_DIR=".venv"

# Change to the specified directory
cd apps/nhl-shot-chart-fastapi

# Function to set up the virtual environment
setup_venv() {
    # Check if the virtual environment already exists
    if [[ ! -d "$VENV_DIR" ]]; then
        python3 -m venv "$VENV_DIR"
        # Activate the virtual environment
        source "$VENV_DIR/bin/activate"

        # Upgrade pip
        pip install --upgrade pip

        # Install dependencies
        pip install -r requirements.txt

        # Deactivate the virtual environment
        deactivate
    fi
}

# Function to start the FastAPI server
start_server() {
    # Ensure the virtual environment is set up
    setup_venv

    # Activate the virtual environment
    source "$VENV_DIR/bin/activate"

    # Start the FastAPI server
    uvicorn main:app --reload

    # Deactivate the virtual environment
    deactivate
}

# Function to run pytest tests
run_tests() {
    # Ensure the virtual environment is set up
    setup_venv

    # Activate the virtual environment
    source "$VENV_DIR/bin/activate"

    # Check for coverage flag
    if [[ "$1" == "--coverage" ]]; then
        pytest --cov=. --cov-report=html && open htmlcov/index.html
    else
        pytest
    fi

    # Deactivate the virtual environment
    deactivate
}

# Function to destroy the virtual environment
destroy_venv() {
    if [[ -d "$VENV_DIR" ]]; then
        rm -rf "$VENV_DIR"
        echo "Virtual environment '$VENV_DIR' has been removed."
    else
        echo "Virtual environment '$VENV_DIR' does not exist."
    fi
}

# Main execution
case $1 in
    "setup")
        setup_venv
        start_server
        ;;
    "start")
        start_server
        ;;
    "test")
        run_tests $2
        ;;
    "destroy")
        destroy_venv
        ;;
    *)
        echo "Usage: $0 {setup|start|test [--coverage]}"
        exit 1
esac
