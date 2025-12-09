import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

// --- HELPER FUNCTIONS ---

const fmtRupiah = (v) => {
  if (v == null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

// --- LOCAL STORAGE FALLBACK (Jika Backend Mati/Belum Diset) ---
const STORAGE_PREFIX = 'negotiations:';
const loadNegotiations = (itemId) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + itemId);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

const saveNegotiations = (itemId, data) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + itemId, JSON.stringify(data));
  } catch (e) {}
};

// --- COMPONENTS ---

export const DetailPage = ({ data, onBack }) => {
  if (!data) return null;
  const { item, type } = data;

  // Resolusi Gambar: Cek 'image_url' (dari DB baru) atau fallback ke properti lain
  const imageSrc = item.image_url || item.image || item.photo || '/images/product-placeholder.svg';

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 animate-fade-in">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:gap-3 transition"
      >
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-contain bg-white"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image'; }}
          />
        </div>

        {/* Info Section */}
        <div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{item.name}</h1>
          
          {type === 'gadget' && (
            <>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                {item.description || 'Deskripsi produk belum tersedia.'}
              </p>
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium">Kategori</span>
                  <span className="font-bold text-gray-800">{item.category || '-'}</span>
                </div>
                {item.brands && (
                   <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Brand</span>
                    <span className="font-bold text-gray-800">{item.brands.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-500 font-medium">Harga</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    {item.price ? fmtRupiah(item.price) : 'Hubungi Penjual'}
                  </span>
                </div>
              </div>
            </>
          )}

          {type === 'brand' && (
            <>
              <p className="text-gray-600 mb-6 text-lg">{item.description || 'Deskripsi brand belum tersedia.'}</p>
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Negara Asal</span>
                  <span className="font-bold text-gray-800">{item.country || 'Global'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Total Produk</span>
                  <span className="font-bold text-gray-800">{item.product_count || 0} Item</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Negotiation / Offer Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-indigo-600 pl-3">
          Negosiasi & Tawaran
        </h2>
        {/* Gunakan ID item untuk mengambil data offers yang relevan */}
        <NegotiationSection itemId={item.id} />
      </div>
    </div>
  );
};

const NegotiationSection = ({ itemId }) => {
  const [offers, setOffers] = useState([]);
  const [name, setName] = useState('Anda'); // Default name
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Cek konfigurasi backend
  const hasBackend = CONFIG && CONFIG.URL && !CONFIG.URL.includes('ganti') && CONFIG.KEY;
  const cleanUrl = hasBackend ? CONFIG.URL.replace(/\/$/, '') : null;
  
  const headers = hasBackend ? { 
    'apikey': CONFIG.KEY, 
    'Authorization': `Bearer ${CONFIG.KEY}`, 
    'Content-Type': 'application/json',
    'Prefer': 'return=representation' // Agar Supabase mengembalikan data setelah insert
  } : null;

  // --- API OPERATIONS ---

  const fetchOffers = async () => {
    try {
      if (!hasBackend) return loadNegotiations(itemId);

      const res = await fetch(`${cleanUrl}/rest/v1/offers?item_id=eq.${encodeURIComponent(itemId)}&order=created_at.desc`, { headers });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error("Gagal mengambil offers:", error);
      return [];
    }
  };

  const postOffer = async (payload) => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers`, { 
        method: 'POST', 
        headers, 
        body: JSON.stringify(payload) 
      });
      return res.ok;
    } catch (e) { return false; }
  };

  const patchStatus = async (offerId, newStatus) => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers?id=eq.${offerId}`, { 
        method: 'PATCH', 
        headers, 
        body: JSON.stringify({ status: newStatus }) 
      });
      return res.ok;
    } catch (e) { return false; }
  };

  const deleteOffer = async (offerId) => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers?id=eq.${offerId}`, { 
        method: 'DELETE', 
        headers 
      });
      return res.ok;
    } catch (e) { return false; }
  };

  // --- HANDLERS ---

  const refreshData = async () => {
    const data = await fetchOffers();
    // Normalisasi data (Local storage pakai camelCase, Supabase pakai snake_case)
    const normalized = data.map(o => ({
      ...o,
      createdAt: o.created_at || o.createdAt, // Handle both formats
    }));
    setOffers(normalized);
  };

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    refreshData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleAdd = async () => {
    if (!price && !message) return alert("Isi harga tawaran atau pesan.");

    const newOffer = {
      item_id: itemId, // Penting untuk relasi
      author: name || 'Anonim',
      price: price ? parseInt(price) : null,
      message: message,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (hasBackend) {
      setLoading(true);
      const success = await postOffer(newOffer);
      if (success) {
        await refreshData();
        setMessage('');
        setPrice('');
      } else {
        alert("Gagal mengirim data ke server.");
      }
      setLoading(false);
    } else {
      // Local Storage Mode
      const localOffer = { ...newOffer, id: Date.now().toString() };
      const next = [localOffer, ...offers];
      setOffers(next);
      saveNegotiations(itemId, next);
      setMessage('');
      setPrice('');
    }
  };

  const handleStatus = async (id, status) => {
    if (hasBackend) {
      await patchStatus(id, status);
      refreshData();
    } else {
      const next = offers.map(o => o.id === id ? { ...o, status } : o);
      setOffers(next);
      saveNegotiations(itemId, next);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus tawaran ini?')) return;
    
    if (hasBackend) {
      await deleteOffer(id);
      refreshData();
    } else {
      const next = offers.filter(o => o.id !== id);
      setOffers(next);
      saveNegotiations(itemId, next);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Form Input */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <h3 className="font-bold text-gray-700 mb-3">Buat Tawaran Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Nama Anda" 
            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
          <input 
            type="number" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            placeholder="Harga Tawaran (Rp)" 
            className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
          />
        </div>
        <textarea 
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          placeholder="Pesan untuk penjual (opsional)..." 
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3" 
          rows={2} 
        />
        <button 
          onClick={handleAdd} 
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? 'Mengirim...' : 'Kirim Tawaran'}
        </button>
      </div>

      {/* List Offers */}
      <div className="space-y-4">
        {offers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Belum ada tawaran. Jadilah yang pertama menawar!
          </div>
        )}

        {offers.map(o => (
          <div key={o.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition bg-white">
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{o.author}</span>
                <span className="text-xs text-gray-400">• {new Date(o.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                  ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    o.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'}`}>
                  {o.status}
                </span>
                {o.price && <span className="font-bold text-indigo-600">{fmtRupiah(o.price)}</span>}
              </div>

              <p className="text-gray-600 text-sm">
                {o.message || <span className="italic text-gray-400">Tidak ada pesan tambahan</span>}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start gap-2 self-end md:self-center">
              {o.status === 'pending' && (
                <>
                  <button onClick={() => handleStatus(o.id, 'accepted')} className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition">
                    Terima
                  </button>
                  <button onClick={() => handleStatus(o.id, 'rejected')} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                    Tolak
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(o.id)} className="px-3 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <span className="sr-only">Hapus</span>
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};