export interface Product {
  id: number;
  name: string;
  price: string;
  images: string[];
  category: string;
  description: string;
  tags?: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "T-Shirt White",
    price: "Rp 119.000",
    category: "T-Shirts",
    description: "Bahan nyaman untuk aktivitas harian. Potongan modern cocok untuk Gen Z.",
    images: [
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1357.PNG",
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1358.PNG"
    ],
  },
  {
    id: 2,
    name: "T-Shirt Black",
    price: "Rp 119.000",
    category: "T-Shirts",
    description: "Bahan nyaman untuk aktivitas harian. Potongan modern cocok untuk Gen Z.",
    images: [
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1359.PNG",
      "https://raw.githubusercontent.com/x666dbg/x666dbg/refs/heads/master/avrelle/IMG_1360.PNG"
    ],
  }
];
