import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : import.meta.env.VITE_BASE_URL || window.location.origin;

console.log("BASE URL:", baseURL);

const api = axios.create({
  baseURL,
});

export default api;
