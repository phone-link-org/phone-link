# PhoneLink

## 소개

PhoneLink

---

## 기술 스택

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript

---

## 실행 방법

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone https://github.com/HyunZai/phone-link.git
# 루트 폴더로 이동
cd phone-link
# 의존성 설치 스크립트 쉘 실행
sh install-dependencies-after-pull.sh
```

### 2. 개발 서버 실행

```bash
# 루트에서 프론트/백 동시에 실행
npm run dev

# 또는 각각 실행
cd backend && npm run dev
cd frontend && npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:4000

### 3. 빌드

```bash
npm run build
```

---

## 환경 변수 설정

- 프론트엔드: `frontend/.env`
  ```env
  VITE_API_URL=http://localhost:4000
  ```
- 백엔드: `backend/.env`
  ```env
  PORT=4000

  # DB Connection information
  DATABASE_HOST='{your_db_host}'
  DATABASE_PORT='{your_db_port}'
  DATABASE_USER='{your_db_user_id}'
  DATABASE_PASSWORD='{your_db_password}'
  DATABASE_NAME='phonelink'
  ```

---

## 주요 기능 및 예제


---

## 개발/배포 환경

- Node.js 18+
- npm 9+
- Vite 7+

---

## 라이선스

MIT License