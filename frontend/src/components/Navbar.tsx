import React, { useContext } from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import { IoMenuOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (authContext) {
      authContext.logout();
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 shadow-sm bg-background-light dark:bg-background-dark">
      <div className="flex items-center">
        <Link to="/">
          <button className="text-2xl font-bold mr-8 text-primary-light dark:text-primary-dark hover:opacity-80 transition-opacity">
            PhoneLink
          </button>
        </Link>
        <ul className="hidden md:flex gap-6">
          <li>
            <Link to="/offer">
              <button
                className={`text-base transition-colors text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark`}
              >
                가격 비교
              </button>
            </Link>
          </li>
          <li>
            <Link to="/store">
              <button
                className={`text-base transition-colors text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark`}
              >
                매장 관리
              </button>
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="text-base text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
            >
              정보
            </a>
          </li>
          <li>
            <Link to="/community">
              <button
                className={`text-base transition-colors text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark`}
              >
                커뮤니티
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin">
              <button
                className={`text-base transition-colors text-foreground-light dark:text-foreground-dark hover:text-primary-light dark:hover:text-primary-dark`}
              >
                관리자
              </button>
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        {authContext?.user ? (
          <>
            <Link to="/mypage">
              <button className="hidden md:block px-4 py-2 rounded bg-primary-light hover:bg-[#3d5e33] dark:bg-primary-dark dark:hover:bg-[#759161] text-white dark:text-foreground-light text-base font-medium transition-colors">
                마이페이지
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white text-base font-medium transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="hidden md:block px-4 py-2 rounded bg-primary-light hover:bg-[#3d5e33] dark:bg-primary-dark dark:hover:bg-[#759161] text-white dark:text-foreground-light text-base font-medium transition-colors">
              로그인
            </button>
          </Link>
        )}
        <button
          className="flex md:hidden items-center justify-center w-10 h-10 ml-2"
          aria-label="메뉴"
        >
          <IoMenuOutline size={28}></IoMenuOutline>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
