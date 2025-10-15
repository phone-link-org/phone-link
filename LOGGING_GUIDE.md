# 로깅 시스템 가이드

## 개요

이 프로젝트는 백엔드와 프론트엔드 모두에서 체계적인 로깅 시스템을 구현했습니다. 에러 발생 시 파일명, 라인 번호, 스택 트레이스, 요청 정보 등을 자동으로 로그 파일에 기록합니다.

## 아키텍처

### 백엔드 로깅 시스템

#### 1. Logger 클래스 (`backend/src/utils/Logger.ts`)

- **파일 기반 로깅**: 날짜별로 로그 파일 생성 (`logs/error-2024-01-15.log`)
- **로그 로테이션**: 파일 크기 제한 (10MB) 및 파일 개수 제한 (5개)
- **레벨별 분리**: ERROR, WARN, INFO, DEBUG 레벨별로 별도 파일
- **자동 스택 트레이스**: 에러 발생 시 파일명, 라인 번호, 함수명 자동 추출

#### 2. 미들웨어 (`backend/src/middlewares/logging.middleware.ts`)

- **요청 로깅**: 모든 HTTP 요청/응답 자동 로깅
- **에러 로깅**: 처리되지 않은 에러 자동 캐치 및 로깅
- **요청 ID**: 각 요청에 고유 ID 부여하여 추적 가능

#### 3. 라우트별 로깅

```typescript
// 예시: offer.routes.ts
router.get("/latest", async (req, res) => {
  try {
    // 요청 시작 로깅
    await logger.info(
      "Fetching latest offers",
      {
        query: req.query,
        userAgent: req.get("User-Agent"),
      },
      {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      }
    );

    // 비즈니스 로직...

    // 성공 로깅
    await logger.info(
      "Successfully fetched latest offers",
      {
        resultCount: response.length,
      },
      requestInfo
    );
  } catch (error) {
    // 에러 로깅
    await logger.error(
      "Error fetching latest offers",
      error,
      {
        query: req.query,
      },
      requestInfo
    );
  }
});
```

### 프론트엔드 로깅 시스템

#### 1. Logger 클래스 (`frontend/src/utils/Logger.ts`)

- **세션 기반 로깅**: 사용자 세션별 로그 추적
- **서버 전송**: 프로덕션 환경에서 백엔드로 로그 전송
- **콘솔 출력**: 개발 환경에서 콘솔에도 출력

#### 2. Axios 인터셉터 (`frontend/src/api/axios.ts`)

- **자동 API 로깅**: 모든 API 요청/응답 자동 로깅
- **에러 추적**: API 에러 발생 시 상세 정보 로깅

#### 3. 컴포넌트 로깅

```typescript
// 예시: LatestOffers.tsx
const fetchLatestOffers = async () => {
  try {
    // API 호출 시작 로깅
    await logger.info("Fetching latest offers from API", {
      component: "LatestOffers",
      action: "fetchLatestOffers",
    });

    const response = await api.get<Offer[]>("/offer/latest");

    // 성공 로깅
    await logger.info("Successfully fetched latest offers", {
      resultCount: response.length,
    });
  } catch (error) {
    // 에러 로깅
    await logger.error("Failed to fetch latest offers", error, {
      component: "LatestOffers",
      action: "fetchLatestOffers",
    });
  }
};
```

## 로그 파일 구조

### 백엔드 로그 파일

```
backend/logs/
├── error-2024-01-15.log      # 에러 로그
├── error-2024-01-15.log.1    # 로테이션된 에러 로그
├── warn-2024-01-15.log       # 경고 로그
├── info-2024-01-15.log       # 정보 로그
└── debug-2024-01-15.log      # 디버그 로그
```

### 로그 엔트리 예시

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "ERROR",
  "message": "Error fetching latest offers",
  "file": "/Users/kimhyunjae/Desktop/phone-link/backend/src/routes/offer.routes.ts",
  "line": 118,
  "function": "router.get",
  "stack": "Error: Database connection failed\n    at QueryBuilder.getRawMany...",
  "requestId": "req_1234567890",
  "userId": "user_123",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "method": "GET",
  "url": "/api/offer/latest",
  "statusCode": 500,
  "responseTime": 1500,
  "data": {
    "query": {},
    "userAgent": "Mozilla/5.0..."
  }
}
```

## 사용법

### 백엔드에서 로깅

```typescript
import { logger } from "../utils/Logger";

// 정보 로깅
await logger.info("User login successful", {
  userId: user.id,
  loginTime: new Date(),
});

// 경고 로깅
await logger.warn("Slow query detected", {
  query: "SELECT * FROM offers",
  executionTime: 5000,
});

// 에러 로깅
await logger.error("Database connection failed", error, {
  database: "mysql",
  host: "localhost",
});
```

### 프론트엔드에서 로깅

```typescript
import { logger } from "../utils/Logger";

// 사용자 액션 로깅
await logger.info("User clicked on offer", {
  component: "OfferCard",
  offerId: 123,
  modelName: "iPhone 15",
});

// 에러 로깅
await logger.error("Failed to load image", error, {
  component: "OfferCard",
  imageUrl: "https://example.com/image.jpg",
});
```

## 로그 모니터링

### 실시간 로그 확인

```bash
# 에러 로그 실시간 모니터링
tail -f backend/logs/error-$(date +%Y-%m-%d).log

# 특정 요청 ID로 필터링
grep "req_1234567890" backend/logs/error-$(date +%Y-%m-%d).log

# 특정 사용자 로그 확인
grep "userId.*user_123" backend/logs/error-$(date +%Y-%m-%d).log
```

### 로그 분석

```bash
# 오늘 발생한 에러 개수
grep -c "ERROR" backend/logs/error-$(date +%Y-%m-%d).log

# 가장 많이 발생한 에러 메시지
grep "ERROR" backend/logs/error-$(date +%Y-%m-%d).log | \
  grep -o '"message":"[^"]*"' | \
  sort | uniq -c | sort -nr

# 특정 시간대 에러 확인
grep "2024-01-15T10:" backend/logs/error-2024-01-15.log
```

## 설정

### 환경 변수

```bash
# 백엔드
NODE_ENV=development  # 개발/프로덕션 모드
LOG_LEVEL=debug       # 로그 레벨 설정

# 프론트엔드
VITE_DEV_MODE=true    # 개발 모드에서 콘솔 출력
```

### 로그 레벨 설정

- **ERROR**: 시스템 에러, 예외 상황
- **WARN**: 경고 상황, 성능 이슈
- **INFO**: 일반적인 정보, 사용자 액션
- **DEBUG**: 개발/디버깅 정보

## 장점

1. **자동화**: 모든 요청/응답이 자동으로 로깅됨
2. **추적성**: 요청 ID로 전체 플로우 추적 가능
3. **디버깅**: 파일명, 라인 번호, 스택 트레이스 자동 기록
4. **성능**: 응답 시간, 쿼리 성능 모니터링
5. **보안**: 사용자 액션, 인증 실패 추적
6. **확장성**: 로그 로테이션으로 디스크 공간 관리

이 로깅 시스템을 통해 프로덕션 환경에서 발생하는 모든 문제를 체계적으로 추적하고 해결할 수 있습니다.
