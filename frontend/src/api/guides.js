// api/guides.js
import axios from "axios";

export const getGuideDocument = () => {
  return axios.get("http://localhost:5000/api/guides");
};
