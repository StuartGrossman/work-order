export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface QRCode {
  id: string;
  itemId: string;
  createdAt: Date;
  createdBy: string;
}

export interface CartItem {
  id: string;
  itemId: string;
  quantity: number;
  timestamp: Date;
} 