#!/bin/bash

set -eu
#
# root 경로에서도 backend, frontend 한 번에 실행시켜주는 concurrently이 있어서 npm install 필요
install_deps() {
  echo "install dependencies for root..."
  (npm install)

  echo "install dependencies for backend..."
  (cd backend && npm install)

  echo "install dependencies for frontend..."
  (cd frontend && npm install)

  echo "All dependencies installed successfully."
}

# 나중에 backend, frontend에서 공용으로 사용되는 패키지는 phonelink(root)/package.json에 세팅해놓고 
# phonelink(root)/package.json 파일에서 workspaces 세팅해서 root 경로에서 npm install하면 모두 설치되도록 개선하면 좋을 듯
# 'npm workspaces, 모노레포' 검색

current=$(git branch --show-current)

if [ $current != "main" ]; then
  echo "$current branch에서 main으로 체크아웃 합니다."
  if ! git switch main; then
    echo "main으로 체크아웃하는데 실패했습니다. 종료합니다." >&2
    exit 1
  fi

  if ! git pull origin main; then
    echo "git pull origin main 명령이 실패했습니다. 종료합니다." >&2
    exit 1
  fi

  install_deps
  echo "설치 완료. 원하는 브랜치로 분기하세요."
fi
# 현재 브랜치가 main이면 그냥 pull 후 설치
git pull origin main
install_deps
