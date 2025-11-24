// src/api/aiClient.js
import axios from "axios";

export async function chatWithGymAi(message, userId) {
  const response = await axios.post(
    "http://localhost:8080/api/ai/chat",
    { message, userId },
    { withCredentials: true }
  );

  return response.data; // { reply: "..." }
}
