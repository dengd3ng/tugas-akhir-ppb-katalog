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
      const headers = { 'apikey': CONFIG.KEY, 'Authorization': `Bearer ${CONFIG.KEY}` };
      const cleanUrl = CONFIG.URL.replace(/\/$/, "");

      const brandRes = await fetch(`${cleanUrl}/rest/v1/brands?select=*`, { headers });
      if (!brandRes.ok) throw new Error("Gagal ambil data brands");
      
      // Fetch Gadgets
      let gadgetRes = await fetch(`${cleanUrl}/rest/v1/gadgets?select=*,categories(name),brands(name,country,website)`, { headers });
      let gadgetsData;

      if (gadgetRes.ok) {
        const json = await gadgetRes.json();
        gadgetsData = json.map(i => ({
          ...i,
          category_name: i.categories?.name,
          // Support multiple possible shapes: brand_name, brand, or nested brands.name
          brand_name: i.brand_name || i.brand || i.brands?.name || 'Unknown'
        }));
      } else {
        // Fallback
        gadgetRes = await fetch(`${cleanUrl}/rest/v1/gadgets?select=*`, { headers });
        const json = await gadgetRes.json();
        gadgetsData = json.map(i => ({
          ...i,
          category_name: 'Gadget',
          brand_name: i.brand_name || i.brand || 'Unknown'
        }));
      }

      const brandJson = await brandRes.json();
      if (!brandJson || (Array.isArray(brandJson) && brandJson.length === 0)) {
        setData({ gadgets: gadgetsData, brands: MOCK_BRANDS });
        setStatus(s => ({ ...s, loading: false, offline: true }));
      } else {
        setData({ gadgets: gadgetsData, brands: brandJson });
        setStatus(s => ({ ...s, loading: false }));
      }

    } catch (err) {
      setData({ gadgets: MOCK_GADGETS, brands: MOCK_BRANDS });
      setStatus({ loading: false, error: err.message, offline: true });
    }
  };

  useEffect(() => { fetchData(); }, []);
  return { ...data, ...status, refresh: fetchData };
};