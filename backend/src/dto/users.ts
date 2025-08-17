export interface UserSignup {
  email: string;
  id: string;
  password: string;
  name: string;
  phoneNumber: string;
  address: string;
  gender: "male" | "female";
  role: "user" | "seller" | "admin";
}

export interface UserLogin {
  id: string;
  password: string;
}
