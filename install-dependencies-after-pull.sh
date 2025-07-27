#!/bin/bash

set -e

echo "install dependencies for backend..."
(cd backend && npm install)

echo "install dependencies for frontend..."
(cd frontend && npm install)

echo "All dependencies installed successfully."
