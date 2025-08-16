import React from "react";
import CustomCheckbox from "../CustomCheckbox";

interface OfferTypeSelectorProps {
  offerTypeConditions: string[];
  onOfferTypesChange: (offerTypes: string[]) => void;
}

const OfferTypeSelector: React.FC<OfferTypeSelectorProps> = ({
  offerTypeConditions,
  onOfferTypesChange,
}) => {
  const offerTypes = [
    { value: "MNP", label: "번호이동" },
    { value: "CHG", label: "기기변경" },
  ];

  const handleOfferTypeChange = (offerType: string) => {
    const isSelected = offerTypeConditions.includes(offerType);

    if (isSelected) {
      // 선택 해제
      onOfferTypesChange(
        offerTypeConditions.filter((type) => type !== offerType)
      );
    } else {
      // 선택 추가
      onOfferTypesChange([...offerTypeConditions, offerType]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 min-h-60">
        {offerTypes.map(({ value, label }) => (
          <label
            key={value}
            className="flex justify-center items-center cursor-pointer"
          >
            <CustomCheckbox
              label={label}
              checked={offerTypeConditions.includes(value)}
              onChange={() => handleOfferTypeChange(value)}
              textStyle="text-lg"
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default OfferTypeSelector;
