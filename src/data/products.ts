export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  tags?: string[];
  stock: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
}

export const products: Product[] = [
  {
    id: 1,
    name: "T-Shirt White",
    price: 119000,
    category: "T-Shirts",
    description: "Bahan nyaman untuk aktivitas harian. Potongan modern cocok untuk Gen Z.",
    images: [
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1357.PNG",
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1358.PNG"
    ],
    stock: { S: 10, M: 5, L: 8, XL: 0 },
  },
  {
    id: 2,
    name: "T-Shirt Black",
    price: 119000,
    category: "T-Shirts",
    description: "Bahan nyaman untuk aktivitas harian. Potongan modern cocok untuk Gen Z.",
    images: [
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1359.PNG",
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1360.PNG"
    ],
    stock: { S: 10, M: 5, L: 8, XL: 0 },
  }
];
