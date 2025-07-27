import React from 'react';

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`
        px-4 py-1 rounded-lg border text-sm transition
        ${checked 
          ? 'border-none bg-primary-light dark:bg-primary-dark text-foreground-dark dark:text-foreground-light' 
          : 'border-none text-foreground-light dark:text-foreground-dark hover:bg-gray-100 dark:hover:bg-gray-600'
        }
      `}
    >
      {label}
    </button>
  );
};

export default CustomCheckbox;
