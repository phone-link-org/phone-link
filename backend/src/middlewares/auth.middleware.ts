import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { UserAuthData } from "../../../shared/types"; // 프론트/백엔드 공유 타입

// Express의 Request 인터페이스를 확장하여 user 속성을 추가
export interface AuthenticatedRequest extends Request {
  user?: UserAuthData & JwtPayload; // 토큰에서 디코딩된 사용자 정보
}

/**
 * [인증 미들웨어]
 * JWT 토큰의 유효성을 검증하고, 유효한 경우 req.user에 디코딩된 페이로드를 추가
 * 이 미들웨어를 통과하면, 해당 사용자는 '로그인된 사용자'임이 보장
 */
export const isAuthenticated = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "인증 토큰이 필요합니다." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    (err: VerifyErrors | null, decodedUser) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ success: false, message: "토큰이 만료되었습니다." });
        }
        return res
          .status(403)
          .json({ success: false, message: "유효하지 않은 토큰입니다." });
      }
      req.user = decodedUser as UserAuthData & JwtPayload;
      next();
    },
  );
};

/**
 * [권한 부여 미들웨어 팩토리]
 * 필요한 역할(role)들을 배열로 받아, 해당 역할을 가진 사용자인지 확인하는 미들웨어를 반환
 * @param requiredRoles 허용할 역할의 배열 (예: ['ADMIN'], ['SELLER', 'ADMIN'])
 */
export const hasRole = (requiredRoles: Array<"USER" | "SELLER" | "ADMIN">) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 이 미들웨어는 isAuthenticated 뒤에 실행되므로 req.user는 항상 존재해야 함.
    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        message: "사용자 역할 정보를 찾을 수 없습니다.",
      });
    }

    const userRole = req.user.role;

    // 사용자의 역할이 필요한 역할 중 하나에 포함되는지 확인
    if (requiredRoles.includes(userRole as "USER" | "SELLER" | "ADMIN")) {
      next(); // 권한이 있으면 다음 미들웨어로 진행
    } else {
      // 권한이 없으면 403 Forbidden 에러를 반환
      return res
        .status(403)
        .json({ success: false, message: "요청에 대한 접근 권한이 없습니다." });
    }
  };
};
