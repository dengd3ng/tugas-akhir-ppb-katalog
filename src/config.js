// src/config.js
const config = {
  // Mengambil variable dari .env
  URL: import.meta.env.VITE_SUPABASE_URL,
  KEY: import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Log untuk ngecek apakah kunci terbaca atau tidak di Console browser
console.log("Cek Config:", config); 

export const CONFIG = config;

// Data Mock (Biarkan di bawah sini)
export const MOCK_GADGETS = [
  { id: '1', name: 'iPhone 15 Pro (Mock)', price: 19500000, category_name: 'Smartphone' },
  { id: '2', name: 'Samsung S24 Ultra (Mock)', price: 21999000, category_name: 'Smartphone' },
];

export const MOCK_BRANDS = [
  { id: 'b1', name: 'Apple', country: 'USA' }, 
  { id: 'b2', name: 'Samsung', country: 'Korea' }
];