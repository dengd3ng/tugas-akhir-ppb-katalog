import { Header } from '../components/layout';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export const DetailPage = ({ data, onBack }) => {
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
    </div>
  );
};

export const ProfilePage = ({ offline }) => {
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