import React from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { useTheme } from "../hooks/useTheme";

// SignupPage에서 사용하는 타입과 동일하게 맞춰줍니다.
interface DaumPostcodeData {
  address: string;
  addressType: "R" | "J";
  bname: string;
  buildingName: string;
  zonecode: string;
  sido: string;
  sigungu: string;
  sigunguCode: string;
}

interface AddressSearchButtonProps {
  onAddressComplete: (data: DaumPostcodeData) => void;
}

const AddressSearchButton: React.FC<AddressSearchButtonProps> = ({ onAddressComplete }) => {
  const open = useDaumPostcodePopup();
  const { theme } = useTheme();

  const handleComplete = (data: DaumPostcodeData) => {
    onAddressComplete(data); // data 객체 전체를 전달합니다.
  };

  const handleClick = () => {
    // 다크모드/라이트모드에 따른 테마 설정
    const themeConfig =
      theme === "dark"
        ? {
            // 다크모드 테마
            bgColor: "#343434", // 배경색 (gray-800)
            searchBgColor: "#292929", // 검색창 배경색 (gray-700)
            contentBgColor: "#343434", // 본문 배경색 (gray-800)
            pageBgColor: "#111827", // 페이지 배경색 (gray-900)
            textColor: "#f9fafb", // 기본 글자색 (gray-50)
            queryTextColor: "#ffffff", // 검색창 글자색
            postcodeTextColor: "#d1d5db", // 우편번호 글자색 (gray-300)
            emphTextColor: "#60a5fa", // 강조 글자색 (blue-400)
            outlineColor: "#6b7280", // 테두리색 (gray-600)
          }
        : {
            // 라이트모드 테마
            bgColor: "#ffffff", // 배경색
            searchBgColor: "#f3f4f6", // 검색창 배경색 (gray-100)
            contentBgColor: "#ffffff", // 본문 배경색
            pageBgColor: "#f9fafb", // 페이지 배경색 (gray-50)
            textColor: "#1f2937", // 기본 글자색 (gray-800)
            queryTextColor: "#374151", // 검색창 글자색 (gray-700)
            postcodeTextColor: "#6b7280", // 우편번호 글자색 (gray-500)
            emphTextColor: "#2563eb", // 강조 글자색 (blue-600)
            outlineColor: "#d1d5db", // 테두리색 (gray-300)
          };

    open({
      onComplete: handleComplete,
      theme: themeConfig,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="ml-2 flex-shrink-0 whitespace-nowrap border border-transparent px-4 py-2 font-medium text-white bg-primary-light rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-primary-dark dark:hover:bg-opacity-80 dark:focus:ring-gray-600 dark:text-black"
    >
      주소 찾기
    </button>
  );
};

export default AddressSearchButton;
