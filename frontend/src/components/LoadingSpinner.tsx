import React from "react";
import { ClipLoader } from "react-spinners";
import { useTheme } from "../hooks/useTheme";

interface LoadingSpinnerProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  spinnerColor?: string;
  spinnerSize?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isVisible,
  title = "처리 중",
  subtitle = "잠시만 기다려주세요...",
  spinnerSize = 48,
}) => {
  if (!isVisible) return null;
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background-light dark:bg-background-dark rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <ClipLoader
            size={spinnerSize}
            color={theme === "light" ? "#4F7942" : "#9DC183"}
            loading={true}
            className="animate-pulse"
          />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
