import { useEffect, useState } from "react";
import CustomCheckbox from "../CustomCheckbox";
import type { Carrier } from "../../../../shared/types";

interface CarrierSelectorProps {
  carrierConditions: Carrier[];
  onCarriersChange: (carriers: Carrier[]) => void;
}

const CarrierSelector: React.FC<CarrierSelectorProps> = ({
  carrierConditions,
  onCarriersChange,
}) => {
  // const [carriers, setCarriers] = useState
  const [carriers, setCarriers] = useState<Carrier[]>([]);

  const SERVER = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${SERVER}/api/offer/carriers`)
      .then((res) => res.json())
      .then(setCarriers)
      .catch((error) => console.error("Error fetching carriers:", error));
  }, [SERVER]);

  const handleCarrierChange = (carrier: Carrier) => {
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
            key={carrier.carrier_id}
            className="flex justify-center items-center cursor-pointer"
          >
            <CustomCheckbox
              label={carrier.carrier_name}
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
