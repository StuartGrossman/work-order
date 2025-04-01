export interface QRCode {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  createdAt: Date;
  qrCode: string;
} 