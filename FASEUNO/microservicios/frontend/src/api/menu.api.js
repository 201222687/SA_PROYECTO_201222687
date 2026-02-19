import axios from "axios";
import { API } from "./api";


// ===============================
// OBTENER TODOS LOS MENU ITEMS
// ===============================
export const getMenuItems = async () => {

  return axios.get(`${API}/menu`);
};


// ===============================
// OBTENER MENU ITEMS POR RESTAURANTE
// ===============================
export const getMenuItemsByRestaurant = async (id_restaurante) => {

  return axios.get(`${API}/menu/restaurant/${id_restaurante}`);
};


// ===============================
// CREAR MENU ITEM (ROL RESTAURANTE)
// ===============================
export const createMenuItem = async (data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.post(
    `${API}/menu`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// ===============================
// ACTUALIZAR MENU ITEM
// ===============================
export const updateMenuItem = async (id_item, data) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.put(
    `${API}/menu/${id_item}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// ===============================
// ELIMINAR MENU ITEM
// ===============================
export const deleteMenuItem = async (id_item) => {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No hay token disponible");
  }

  return axios.delete(
    `${API}/menu/${id_item}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// Obtener todos los restaurantes (público)
export const getRestaurants = async () => {
  return axios.get(`${API}/catalog/restaurants`);
};
