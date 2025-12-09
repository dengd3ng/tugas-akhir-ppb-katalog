import { Header } from '../components/Layout';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

// LocalStorage helpers for negotiations
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

const fmtRupiah = (v) => {
  if (v == null || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const resolveImageSrc = (item) => {
  if (!item) return null;
  const candidates = [
    item.image_url,
    item.imageUrl,
    item.image,
    item.photo,
    item.picture,
    item.thumbnail,
    item.image_path,
    item.imagePath,
  ];

  if (!candidates.some(Boolean) && Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'string') candidates.push(first);
    else if (first && (first.url || first.path)) candidates.push(first.url || first.path);
  }

  const src = candidates.find(Boolean) || null;
  return src;
};

const DetailPage = ({ data, onBack }) => {
  if (!data) return null;
  const { item, type } = data;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:gap-3 transition">
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
          <img
            src={item.image || item.image_url || item.photo || '/images/product-placeholder.svg'}
            alt={item.name}
            className="w-full h-full object-contain bg-white"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/product-placeholder.svg'; }}
          />
        </div>

        {/* Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{item.name}</h1>
          {type === 'gadget' && (
            <>
              <p className="text-gray-600 mb-6">{item.description || 'No description available'}</p>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500">Kategori:</span>
                  <p className="font-bold">{item.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Harga:</span>
                  <p className="text-2xl font-bold text-indigo-600">{item.price ? `Rp ${parseInt(item.price).toLocaleString('id-ID')}` : 'N/A'}</p>
                </div>
              </div>
            </>
          )}
          {type === 'brand' && (
            <>
              <p className="text-gray-600 mb-6">{item.description || 'No description available'}</p>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500">Negara:</span>
                  <p className="font-bold">{item.country || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Produk:</span>
                  <p className="font-bold">{item.product_count || 'N/A'} Produk</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Negotiation / Offer Section */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Negosiasi & Tawaran</h2>
        <NegotiationSection itemId={item.id || item._id || item.slug || item.name} />
      </div>
    </div>
  );
};

const NegotiationSection = ({ itemId }) => {
  const [offers, setOffers] = useState([]);
  const [name, setName] = useState('Anda');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  const hasBackend = CONFIG && CONFIG.URL && !CONFIG.URL.includes('ganti') && CONFIG.KEY && !CONFIG.KEY.includes('ganti');
  const cleanUrl = hasBackend ? CONFIG.URL.replace(/\/$/, '') : null;
  const headers = hasBackend ? { 'apikey': CONFIG.KEY, 'Authorization': `Bearer ${CONFIG.KEY}`, 'Content-Type': 'application/json' } : null;

  // API helpers for Supabase REST when available
  const apiLoadOffers = async () => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers?item_id=eq.${encodeURIComponent(itemId)}&order=created_at.desc`, { headers });
      if (!res.ok) throw new Error('Failed to load offers');
      const json = await res.json();
      // normalize fields
      return json.map(o => ({
        id: o.id?.toString() || o.id,
        author: o.author || o.name || 'Anonim',
        message: o.message || '',
        price: o.price || null,
        status: o.status || 'pending',
        createdAt: o.created_at || o.createdAt || new Date().toISOString(),
      }));
    } catch (e) {
      return [];
    }
  };

  const apiAddOffer = async (o) => {
    try {
      const payload = {
        item_id: itemId,
        author: o.author,
        message: o.message,
        price: o.price,
        status: o.status,
        created_at: o.createdAt
      };
      const res = await fetch(`${cleanUrl}/rest/v1/offers`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to create offer');
      return true;
    } catch (e) { return false; }
  };

  const apiUpdateOffer = async (offerId, patch) => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers?id=eq.${encodeURIComponent(offerId)}`, { method: 'PATCH', headers, body: JSON.stringify(patch) });
      return res.ok;
    } catch (e) { return false; }
  };

  const apiRemoveOffer = async (offerId) => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/offers?id=eq.${encodeURIComponent(offerId)}`, { method: 'DELETE', headers });
      return res.ok;
    } catch (e) { return false; }
  };

  useEffect(() => {
    let mounted = true;
    if (!itemId) return;
    (async () => {
      if (hasBackend) {
        const list = await apiLoadOffers();
        if (mounted) setOffers(list);
      } else {
        setOffers(loadNegotiations(itemId));
      }
    })();
    return () => { mounted = false; };
  }, [itemId]);

  const addOffer = async () => {
    if (!itemId) return;
    const o = {
      id: Date.now().toString(),
      author: name || 'Anda',
      message: message || '',
      price: price ? Number(price) : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (hasBackend) {
      const ok = await apiAddOffer(o);
      if (ok) {
        const list = await apiLoadOffers();
        setOffers(list);
      }
    } else {
      const next = [o, ...offers];
      setOffers(next);
      saveNegotiations(itemId, next);
    }

    setMessage(''); setPrice('');
  };

  const updateStatus = async (offerId, status) => {
    if (hasBackend) {
      const ok = await apiUpdateOffer(offerId, { status });
      if (ok) {
        const list = await apiLoadOffers();
        setOffers(list);
      }
    } else {
      const next = offers.map(o => o.id === offerId ? { ...o, status } : o);
      setOffers(next);
      saveNegotiations(itemId, next);
    }
  };

  const removeOffer = async (offerId) => {
    if (hasBackend) {
      const ok = await apiRemoveOffer(offerId);
      if (ok) {
        const list = await apiLoadOffers();
        setOffers(list);
      }
    } else {
      const next = offers.filter(o => o.id !== offerId);
      setOffers(next);
      saveNegotiations(itemId, next);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama (opsional)" className="border p-2 rounded" />
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Tawaran harga (angka)" className="border p-2 rounded" />
        <button onClick={addOffer} className="bg-indigo-600 text-white px-4 py-2 rounded">Kirim Tawaran</button>
      </div>
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Catatan / alasan negosiasi (opsional)" className="w-full border p-3 rounded mb-4" rows={3} />

      {offers.length === 0 ? (
        <div className="text-gray-500">Belum ada tawaran untuk produk ini.</div>
      ) : (
        <div className="space-y-4">
          {offers.map(o => (
            <div key={o.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="font-bold">{o.author}</div>
                  <div className="text-sm text-gray-500">• {new Date(o.createdAt).toLocaleString()}</div>
                  <div className={`ml-3 px-2 py-1 rounded-full text-xs ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : o.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{o.status}</div>
                </div>
                <div className="mt-2 text-gray-700">{o.message || <span className="text-gray-400">(Tidak ada catatan)</span>}</div>
                <div className="mt-2 font-bold">{o.price ? fmtRupiah(o.price) : <span className="text-gray-500">Tanpa tawaran harga</span>}</div>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-2">
                {o.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(o.id, 'accepted')} className="px-3 py-1 bg-green-600 text-white rounded">Terima</button>
                    <button onClick={() => updateStatus(o.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Tolak</button>
                  </>
                )}
                <button onClick={() => removeOffer(o.id)} className="px-3 py-1 bg-gray-200 rounded">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfilePage = ({ offline }) => {
  const [profile, setProfile] = useState({ name: 'Denzel Helguera Simanjuntak', nim: '21120123130077', tugas: 'Tugas Akhir Praktikum PPB', avatar: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('profile');
      if (raw) {
        const json = JSON.parse(raw);
        // Only load from localStorage if the saved profile contains a name
        if (json && json.name) {
          setProfile({ name: json.name || '', nim: json.nim || '', tugas: json.tugas || '', avatar: json.avatar || '' });
        }
      }
    } catch (e) {}
  }, []);

  const avatarSrc = profile.avatar || '/avatars/me.jpg';

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 animate-fade-in">
      <Header title="Profile" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
          <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
            <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/icons/icon-192.png'; }} />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{profile.name || 'Nama Anda'}</div>
            <div className="text-sm text-gray-500">NIM: {profile.nim || '-'}</div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold mb-4">About Saya</h3>
          <p className="text-gray-700 mb-4">{profile.tugas || 'Belum ada tugas.'}</p>
        </div>
      </div>
    </div>
  );
};

// Named exports at the bottom so bundlers (Rollup/esbuild) can statically analyze them
export { DetailPage, ProfilePage };

  // Exports are declared inline above as named exports; no extra export statement needed.