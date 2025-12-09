import { useState, useEffect } from 'react';
import { CONFIG, MOCK_GADGETS, MOCK_BRANDS } from '../config';

export const useSupabase = () => {
  const [data, setData] = useState({ gadgets: [], brands: [] });
  const [status, setStatus] = useState({ loading: true, error: null, offline: false });

  const fetchData = async () => {
    setStatus({ loading: true, error: null, offline: false });
    
    // Cek apakah config masih default
    if (CONFIG.URL.includes('ganti') || CONFIG.KEY.includes('ganti')) {
      setStatus({ loading: false, error: "Config URL/Key belum diisi", offline: true });
      setData({ gadgets: MOCK_GADGETS, brands: MOCK_BRANDS });
      return;
    }

    try {
      const headers = { 
        'apikey': CONFIG.KEY, 
        'Authorization': `Bearer ${CONFIG.KEY}`,
        'Content-Type': 'application/json'
      };
      const cleanUrl = CONFIG.URL.replace(/\/$/, "");

      // 1. Fetch Brands
      const brandRes = await fetch(`${cleanUrl}/rest/v1/brands`, { 
        headers,
        method: 'GET'
      });
      
      // 2. Fetch Gadgets (SUDAH DIPERBAIKI: Hapus relasi categories, cukup ambil brands)
      let gadgetRes = await fetch(`${cleanUrl}/rest/v1/gadgets?select=*,brands(name,country,website)`, { 
        headers,
        method: 'GET'
      });

      let gadgetsData;

      if (gadgetRes.ok) {
        // --- SKENARIO SUKSES ---
        const json = await gadgetRes.json();
        gadgetsData = json.map(i => {
          // Handle brands jika bentuknya array
          const brandData = Array.isArray(i.brands) ? i.brands[0] : i.brands;
          
          return {
            ...i,
            // Perbaikan: Ambil langsung dari kolom text 'category', bukan relasi object
            category_name: i.category || 'Gadget', 
            brand_name: brandData?.name || 'Unknown'
          };
        });
      } else {
        // --- SKENARIO GAGAL (Fallback) ---
        // Jika query relasi gagal, coba ambil data gadget polos tanpa join
        const fallbackRes = await fetch(`${cleanUrl}/rest/v1/gadgets`, { 
          headers,
          method: 'GET'
        });
        
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          gadgetsData = json.map(i => ({
            ...i,
            category_name: i.category || 'Gadget',
            brand_name: 'Unknown' // Tidak ada join, jadi unknown
          }));
        } else {
           throw new Error("Gagal mengambil data gadget");
        }
      }

      // 3. Proses Data Brand
      const brandJson = await brandRes.json();
      if (!brandJson || (Array.isArray(brandJson) && brandJson.length === 0)) {
        setData({ gadgets: gadgetsData, brands: MOCK_BRANDS });
        setStatus(s => ({ ...s, loading: false, offline: true }));
      } else {
        setData({ gadgets: gadgetsData, brands: brandJson });
        setStatus(s => ({ ...s, loading: false }));
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      setData({ gadgets: MOCK_GADGETS, brands: MOCK_BRANDS });
      setStatus({ loading: false, error: err.message, offline: true });
    }
  };

  useEffect(() => { fetchData(); }, []);
  return { ...data, ...status, refresh: fetchData };
};