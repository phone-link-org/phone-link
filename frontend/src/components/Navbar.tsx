import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 shadow-sm bg-white dark:bg-gray-900">
      <div className="flex items-center">
        <span className="text-2xl font-bold mr-8 text-blue-600 dark:text-blue-400">PhoneLink</span>
        <ul className="flex gap-6">
          <li><a href="#" className="text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">가격 비교</a></li>
          <li><a href="#" className="text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">정보</a></li>
          <li><a href="#" className="text-base text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">커뮤니티</a></li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-base font-medium transition-colors">로그인</button>
      </div>
    </nav>
  );
};

export default Navbar; 