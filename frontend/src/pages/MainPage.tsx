import React from "react";
import BannerSlider from "../components/BannerSlider";
import ContentBox from "../components/ContentBox";
import RecentOffersList from "../components/RecentOffersList";

const MainPage: React.FC = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6 mt-16">
        <BannerSlider />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto px-4">
        <RecentOffersList />
        <ContentBox text="박스 2"></ContentBox>
      </div>
    </>
  );
};

export default MainPage;
