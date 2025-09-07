import React from "react";
import { Link } from "react-router-dom";
import { IoHome, IoArrowBack } from "react-icons/io5";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="max-w-md mx-auto text-center px-4">
        {/* 404 숫자 */}
        <div className="text-9xl font-bold text-gray-300 dark:text-gray-500 mb-4">
          404
        </div>

        {/* 메인 메시지 */}
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          페이지를 찾을 수 없습니다
        </h1>

        {/* 설명 */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        {/* 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-primary-light hover:bg-[#3d5e33] dark:bg-primary-dark dark:hover:bg-[#759161] text-white rounded-lg font-medium transition-colors">
              <IoHome className="w-5 h-5" />
              홈으로 돌아가기
            </button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <IoArrowBack className="w-5 h-5" />
            이전 페이지
          </button>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>도움이 필요하시면 고객센터에 문의해주세요.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
