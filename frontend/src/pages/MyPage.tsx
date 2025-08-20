import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const MyPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
      {user ? (
        <div>
          <p className="text-lg">
            안녕하세요, <span className="font-bold">{user.id}</span>님!
          </p>
          <p className="text-lg">
            회원님은{" "}
            <span className="font-bold">
              {user.userType === "seller" ? "판매자" : "일반 유저"}
            </span>
            입니다.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-lg text-gray-600">
            로그인이 필요한 서비스입니다.
          </p>
          <Link to="/login">
            <button className="mt-4 px-4 py-2 rounded bg-primary-light text-white hover:bg-opacity-80">
              로그인 페이지로 이동
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPage;

