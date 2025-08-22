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
      (c) => c.carrier_id === carrier.carrier_id,
    );

    if (isSelected) {
      onCarriersChange(
        carrierConditions.filter((c) => c.carrier_id !== carrier.carrier_id),
      );
    } else {
      onCarriersChange([...carrierConditions, carrier]);
    }
  };

  const getCarrierImageUrl = (carrierName: string) => {
    try {
      return new URL(`/src/assets/images/${carrierName}.png`, import.meta.url)
        .href;
    } catch (error) {
      console.error(`Error loading image for carrier: ${carrierName}`, error);
      return "https://placehold.co/500x500";
    }
  };

  return (
    <div>
      <div
        className={`grid gap-3 items-center min-h-60 ${
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
            (c) => c.carrier_id === carrier.carrier_id,
          );

          return (
            <button
              key={carrier.carrier_id}
              type="button"
              onClick={() => handleCarrierChange(carrier)}
              className={`flex flex-col items-center justify-center gap-3 w-full h-full max-h-44 rounded-lg border transition-all shadow-sm hover:shadow-md cursor-pointer
    ${
      isSelected
        ? "border-green-600 bg-green-50 dark:border-gray-400 dark:bg-primary-dark/20 shadow-md"
        : "border-gray-300 bg-white dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-600/40"
    }
  `}
            >
              <div className="flex items-center justify-center w-16 h-16">
                <img
                  src={getCarrierImageUrl(carrier.carrier_name)}
                  alt={carrier.carrier_name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {carrier.carrier_name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CarrierSelector;
