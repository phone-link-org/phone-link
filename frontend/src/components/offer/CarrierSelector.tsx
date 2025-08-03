import CustomCheckbox from "../CustomCheckbox";

interface CarrierSelectorProps {
  carrierConditions: string[];
  onCarriersChange: (carriers: string[]) => void;
}

const CarrierSelector: React.FC<CarrierSelectorProps> = ({
  carrierConditions,
  onCarriersChange,
}) => {
  // const [carriers, setCarriers] = useState
  const carriers = ["SKT", "KT", "LG U+"];

  const handleCarrierChange = (carrier: string) => {
    const isSelected = carrierConditions.includes(carrier);

    if (isSelected) {
      // 선택 해제
      onCarriersChange(carrierConditions.filter((c) => c !== carrier));
    } else {
      // 선택 추가
      onCarriersChange([...carrierConditions, carrier]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-foreground-light dark:text-foreground-dark">
        통신사 선택
      </label>
      <div className="grid grid-cols-3 gap-3">
        {carriers.map((carrier) => (
          <label
            key={carrier}
            className="flex justify-center items-center cursor-pointer"
          >
            <CustomCheckbox
              label={carrier}
              checked={carrierConditions.includes(carrier)}
              onChange={() => handleCarrierChange(carrier)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default CarrierSelector;
