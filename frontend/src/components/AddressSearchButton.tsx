import React from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";

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

  const handleComplete = (data: DaumPostcodeData) => {
    onAddressComplete(data); // data 객체 전체를 전달합니다.
  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
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
