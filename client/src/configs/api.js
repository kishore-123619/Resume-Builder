import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : import.meta.env.VITE_BASE_URL ||
      "https://resume-builder-2-5j1d.onrender.com";

console.log("BASE URL:", baseURL);

const api = axios.create({
  baseURL,
});

export default api;
