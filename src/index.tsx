
import "@/style/index.css";

export { default as manifest } from "./manifest";

declare global {
  interface Window {
    CARE_API_URL: string;
  }
}

export const CARE_API_URL = window.CARE_API_URL;
