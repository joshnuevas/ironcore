import axios from "axios";

const API_URL = "http://localhost:8080/api/trainers";

export const getAllTrainers = async () => {
  return axios.get(API_URL);
};

export const getTrainerById = async (id) => {
  return axios.get(`${API_URL}/${id}`);
};
