import React from 'react';
import ThemeToggleButton from './ThemeToggleButton';

const Navbar: React.FC = () => {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 shadow-sm bg-background-light dark:bg-background-dark">
      <div className="flex items-center">
        <span className="text-2xl font-bold mr-8 text-primary-light dark:text-primary-dark">PhoneLink</span>
        <ul className="flex gap-6">
          <li><a href="#" className="text-base text-foreground-light dark:text-foreground-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors">가격 비교</a></li>
          <li><a href="#" className="text-base text-foreground-light dark:text-foreground-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors">정보</a></li>
          <li><a href="#" className="text-base text-foreground-light dark:text-foreground-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors">커뮤니티</a></li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggleButton />
        <button className="px-4 py-2 rounded bg-primary-light hover:bg-blue-700 dark:bg-primary-dark dark:hover:bg-blue-600 text-white dark:text-foreground-light text-base font-medium transition-colors">로그인</button>
      </div>
    </nav>
  );
};

export default Navbar; 