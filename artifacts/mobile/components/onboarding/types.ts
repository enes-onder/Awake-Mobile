export type Step = "auth" | "email" | "phone" | "otp" | "name";
export type AuthProvider = "google" | "apple" | "email" | "phone";

export interface ProviderItem {
  id: AuthProvider;
  label: string;
  icon: string;
  color: string;
}
