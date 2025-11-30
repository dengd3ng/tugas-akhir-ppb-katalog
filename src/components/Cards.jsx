import React from 'react';
import { Smartphone, Award, Globe, ShoppingBag } from 'lucide-react';
import { CONFIG } from '../config';

const resolveImageSrc = (item) => {
  // Common fields used for images in different backends
  const candidates = [
    item.image_url,
    item.imageUrl,
    item.image,
    item.picture,
    item.photo,
    item.thumbnail,
    item.image_path,
    item.imagePath,
  ];

  // If item.images is an array, try its first entry
  if (!candidates.some(Boolean) && Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];
    if (typeof first === 'string') candidates.push(first);
    else if (first && (first.url || first.path)) candidates.push(first.url || first.path);
  }

  const src = candidates.find(Boolean) || null;

  return src;
};

export const GadgetCard = ({ item, onClick }) => {
  const imgSrc = resolveImageSrc(item);
  return (
    <div onClick={onClick} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer group flex flex-col h-full">
      <div className="bg-gray-50 aspect-square rounded-xl flex items-center justify-center text-gray-300 mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.name}
            className="w-full h-full object-contain bg-white"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/product-placeholder.svg'; }}
          />
        ) : (
          <div className="p-6"><Smartphone size={40} /></div>
        )}
      </div>
      <h3 className="font-bold text-gray-800 line-clamp-2 mb-auto">{item.name}</h3>
      <div className="mt-3 pt-3 border-t flex justify-between items-center">
        <p className="text-indigo-600 font-bold">Rp {parseInt(item.price || 0).toLocaleString('id-ID')}</p>
        <div className="bg-indigo-50 p-1.5 rounded-full text-indigo-600 opacity-0 group-hover:opacity-100 transition">
          <ShoppingBag size={14} />
        </div>
      </div>
    </div>
  );
};

export const BrandCard = ({ item, onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md cursor-pointer hover:border-indigo-200 transition">
    <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Award size={24} /></div>
    <div>
      <h3 className="font-bold text-gray-800">{item.name}</h3>
      <p className="text-sm text-gray-500">{item.country || 'Global'}</p>
    </div>
  </div>
);

export const BrandItem = ({ item, onClick }) => (
  <div onClick={onClick} className="bg-white p-3 rounded-xl shadow-sm border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 transition">
    <div className="bg-indigo-50 p-2 rounded-full text-indigo-600"><Globe size={20} /></div>
    <span className="text-xs font-semibold text-center truncate w-full">{item.name}</span>
  </div>
);