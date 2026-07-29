import axios from 'axios';
import type { Book, CreateOrderPayload, CreateOrderResponse, VerifyPaymentPayload, OrderDetails } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Book[] }>('/books');
    return response.data.data;
  } catch (err: any) {
    // Fallback attempt to localhost if 127.0.0.1 fails
    try {
      const fallbackResponse = await axios.get<{ success: boolean; data: Book[] }>('http://localhost:5000/api/books');
      return fallbackResponse.data.data;
    } catch (fallbackErr) {
      throw err;
    }
  }
};

export const fetchBookById = async (id: string): Promise<Book> => {
  const response = await api.get<{ success: boolean; data: Book }>(`/books/${id}`);
  return response.data.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>('/orders/create', payload);
  return response.data;
};

export const verifyPayment = async (payload: VerifyPaymentPayload) => {
  const response = await api.post('/payments/verify', payload);
  return response.data;
};

export const fetchOrderById = async (orderId: string): Promise<OrderDetails> => {
  const response = await api.get<{ success: boolean; data: OrderDetails }>(`/orders/${orderId}`);
  return response.data.data;
};

export default api;
