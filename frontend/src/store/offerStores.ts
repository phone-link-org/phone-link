// src/store/offerStore.ts

import { create } from "zustand";
import apiClient from "../api/axios";
import { toast } from "sonner";
import type {
  CarrierDto,
  OfferModelDto,
  OfferRegionDto,
  OfferSearchRequest,
  OfferSearchResult,
} from "../../../shared/types";

// 1. Store의 상태(state)와 액션(actions)에 대한 타입을 정의합니다.
interface OfferState {
  selectedRegions: OfferRegionDto[];
  selectedModels: OfferModelDto[];
  selectedCarriers: CarrierDto[];
  selectedOfferTypes: ("MNP" | "CHG")[];
  sortOrder: "default" | "price_asc" | "price_desc";

  offerDatas: OfferSearchResult[];
  page: number;
  hasNextPage: boolean;
  loading: boolean;
}

interface OfferActions {
  setSelectedRegions: (regions: OfferRegionDto[]) => void;
  setSelectedModels: (models: OfferModelDto[]) => void;
  setSelectedCarriers: (carriers: CarrierDto[]) => void;
  setSelectedOfferTypes: (types: ("MNP" | "CHG")[]) => void;
  setSortOrder: (order: "default" | "price_asc" | "price_desc") => void;
  resetFilters: () => void; // 여러 상태를 한번에 초기화하는 액션

  fetchOffers: (isNewSearch: boolean) => Promise<void>;
}

// 2. 초기 상태를 정의합니다.
const initialState: OfferState = {
  selectedRegions: [],
  selectedModels: [],
  selectedCarriers: [],
  selectedOfferTypes: [],
  sortOrder: "default",
  offerDatas: [],
  page: 1,
  hasNextPage: true,
  loading: false,
};

// 3. create 함수로 store를 생성합니다.
export const useOfferStore = create<OfferState & OfferActions>((set, get) => ({
  ...initialState, // 초기 상태 적용

  // --- Actions 구현 ---
  setSelectedRegions: (regions) => set({ selectedRegions: regions }),
  setSelectedModels: (models) => set({ selectedModels: models }),
  setSelectedCarriers: (carriers) => set({ selectedCarriers: carriers }),
  setSelectedOfferTypes: (types) => set({ selectedOfferTypes: types }),
  setSortOrder: (order) => set({ sortOrder: order }),

  // 여러 상태를 한번에 바꾸는 액션을 만들면 매우 편리합니다.
  resetFilters: () => {
    set(initialState); // 모든 상태를 초기 상태로 되돌림
  },

  fetchOffers: async (isNewSearch = false) => {
    const {
      loading,
      page,
      sortOrder,
      selectedRegions,
      selectedModels,
      selectedCarriers,
      selectedOfferTypes,
    } = get();

    if (loading) return; // 중복 호출 방지
    set({ loading: true });

    // 새 검색이면 페이지 번호를 1로 초기화
    const currentPage = isNewSearch ? 1 : page;

    try {
      const params: OfferSearchRequest = {
        regions: selectedRegions,
        models: selectedModels,
        carriers: selectedCarriers,
        offerTypes: selectedOfferTypes,
        page: currentPage, // ref에서 현재 페이지 번호 가져오기
        limit: 20,
        sortOrder: sortOrder, // 정렬 순서 추가
      };

      const response = await apiClient.post<{
        offers: OfferSearchResult[];
        hasNextPage: boolean;
      }>(`/offer/search`, params);

      const data = await response.data;

      set((state) => ({
        offerDatas: isNewSearch
          ? data.offers
          : [...state.offerDatas, ...data.offers],
        hasNextPage: data.hasNextPage,
        page: data.hasNextPage ? currentPage + 1 : currentPage,
      }));
    } catch (error) {
      console.error("Error searching offer datas:", error);
      toast.error("검색 과정에서 에러가 발생했습니다.");
    } finally {
      set({ loading: false });
    }
  },
}));
