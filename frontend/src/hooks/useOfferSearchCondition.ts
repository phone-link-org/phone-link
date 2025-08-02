import { useState } from "react";
import type { OfferSearchCondition } from "../../../shared/offer_types";

export const useOfferSearchCondition = () => {
  const [offerSearchCondition, setOfferSearchCondition] =
    useState<OfferSearchCondition | null>(null);

  const updateOfferSearchCondition = (
    updater: (prev: OfferSearchCondition | null) => OfferSearchCondition | null
  ) => {
    setOfferSearchCondition(updater);
  };

  const resetOfferSearchCondition = () => {
    setOfferSearchCondition(null);
  };

  return {
    offerSearchCondition,
    setOfferSearchCondition,
    updateOfferSearchCondition,
    resetOfferSearchCondition,
  };
};
