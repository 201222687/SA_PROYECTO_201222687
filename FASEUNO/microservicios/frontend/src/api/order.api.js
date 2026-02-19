import axios from "axios";
import { API } from "./api";

// API Gateway

export const createOrder = async (data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.post(
    `${API}/orden`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};
