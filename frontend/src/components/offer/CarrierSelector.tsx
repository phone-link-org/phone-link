import { useEffect, useState } from "react";
import type { Carrier } from "../../../../shared/types";

interface CarrierSelectorProps {
  carrierConditions: Carrier[];
  onCarriersChange: (carriers: Carrier[]) => void;
}

const CarrierSelector: React.FC<CarrierSelectorProps> = ({
  carrierConditions,
  onCarriersChange,
}) => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const SERVER = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${SERVER}/api/offer/carriers`)
      .then((res) => res.json())
      .then(setCarriers)
      .catch((error) => console.error("Error fetching carriers:", error));
  }, [SERVER]);

  const handleCarrierChange = (carrier: Carrier) => {
    const isSelected = carrierConditions.some(
      (c) => c.carrier_id === carrier.carrier_id
    );

    if (isSelected) {
      onCarriersChange(
        carrierConditions.filter((c) => c.carrier_id !== carrier.carrier_id)
      );
    } else {
      onCarriersChange([...carrierConditions, carrier]);
    }
  };

  return (
    <div>
      <div
        className={`grid gap-4 justify-items-center content-center min-h-60 ${
          carriers.length === 1
            ? "grid-cols-1"
            : carriers.length === 2
            ? "grid-cols-2"
            : carriers.length === 3
            ? "grid-cols-3"
            : carriers.length === 4
            ? "grid-cols-4"
            : "grid-cols-5"
        }`}
      >
        {carriers.map((carrier) => {
          const isSelected = carrierConditions.some(
            (c) => c.carrier_id === carrier.carrier_id
          );

          return (
            <button
              key={carrier.carrier_id}
              type="button"
              onClick={() => handleCarrierChange(carrier)}
              className={`flex flex-col items-center justify-center w-full h-24 rounded-2xl border transition-all shadow-sm hover:shadow-md cursor-pointer
    ${
      isSelected
        ? "border-green-600 bg-green-50 dark:bg-green-900/20"
        : "border-gray-300 bg-white dark:bg-gray-800"
    }
  `}
            >
              <div className="flex items-center justify-center w-16 h-16">
                <img
                  src={`${SERVER}/uploads/images/carrier/${carrier.carrier_name}.png`}
                  alt={carrier.carrier_name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CarrierSelector;
