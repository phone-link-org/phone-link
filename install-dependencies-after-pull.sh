#!/bin/bash

set -e

# root 경로에서도 backend, frontend 한 번에 실행시켜주는 concurrently이 있어서 npm install 필요
echo "install dependencies for root..."
(npm install)

echo "install dependencies for backend..."
(cd backend && npm install)

echo "install dependencies for frontend..."
(cd frontend && npm install)

echo "All dependencies installed successfully."

# 나중에 backend, frontend에서 공용으로 사용되는 패키지는 phonelink(root)/package.json에 세팅해놓고 
# phonelink(root)/package.json 파일에서 workspaces 세팅해서 root 경로에서 npm install하면 모두 설치되도록 개선하면 좋을 듯
# 'npm workspaces, 모노레포' 검색