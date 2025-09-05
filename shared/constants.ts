export const ROLES = {
  USER: "USER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const OFFER_TYPES = {
  MNP: "MNP",
  CHG: "CHG",
} as const;

export type OfferType = (typeof OFFER_TYPES)[keyof typeof OFFER_TYPES];

export const USER_STATUSES = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export const SELLER_STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  REJECTED: "REJECTED",
} as const;

export const APPROVAL_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const SSO_PROVIDERS = {
  GOOGLE: "google",
  KAKAO: "kakao",
  NAVER: "naver",
  APPLE: "apple",
} as const;

export type SsoProvider = (typeof SSO_PROVIDERS)[keyof typeof SSO_PROVIDERS];

export const CARRIERS = {
  SKT: "SKT",
  KT: "KT",
  LG: "LG U+",
} as const;

export const SORT_ORDER = {
  DEFAULT: "default",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
} as const;

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
