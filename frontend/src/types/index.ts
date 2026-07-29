export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface CreateOrderPayload {
  customerDetails: CustomerDetails;
  cartItems: {
    bookId: string;
    quantity: number;
  }[];
  idempotencyKey?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  orderId: string;
}

export interface OrderDetails {
  id: string;
  razorpayOrderId: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  createdAt: string;
  customer: CustomerDetails;
  items: {
    id: string;
    quantity: number;
    price: number;
    book: Book;
  }[];
  payment?: {
    razorpayPaymentId: string;
    amount: number;
    status: string;
    paymentMethod?: string;
  };
  activityLogs?: {
    id: string;
    event: string;
    details?: string;
    createdAt: string;
  }[];
}
