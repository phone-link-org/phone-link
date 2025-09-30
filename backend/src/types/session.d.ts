import 'express-session';

// 이미 있는 모듈을 확장
declare module 'express-session' {
  interface SessionData {
    viewedPosts?: number[];
  }
}
