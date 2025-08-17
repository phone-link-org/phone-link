import React from "react";

interface ContentBoxProps {
  text: string;
}

const ContentBox: React.FC<ContentBoxProps> = ({ text }) => {
  return (
    <div className="flex-1 aspect-square bg-background-light dark:bg-background-dark rounded-lg shadow-md flex items-center justify-center text-lg font-semibold text-primary-light dark:text-primary-dark">
      {text}
    </div>
  );
};

export default ContentBox;
