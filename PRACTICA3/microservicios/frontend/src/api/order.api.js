import axios from "axios";

const API = "http://localhost:5000";

export const createOrder = async (data) => {
  const token = localStorage.getItem("token");

  return axios.post(`${API}/orden`, data, {
    headers: {
      Authorization: token
    }
  });
};
