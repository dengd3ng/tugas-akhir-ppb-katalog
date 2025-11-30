import React from 'react';
import { Award, Smartphone, RefreshCw } from 'lucide-react';
import { Section, AlertBox, Skeleton } from '../components/Layout';
import { GadgetCard, BrandItem } from '../components/Cards';

export default function HomePage({ gadgets, brands, loading, offline, error, onRefresh, navTo, onDetail }) {
  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Banner */}
      <div className="bg-indigo-600 text-white pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">KatalogGadget</h1>
            <p className="text-indigo-100">Katalog Gadget Modern</p>
          </div>
          <button onClick={onRefresh} className={`bg-white/20 p-3 rounded-full hover:bg-white/30 ${loading ? 'animate-spin' : ''}`}>
            <RefreshCw size={24} />
          </button>
        </div>
        {offline && <AlertBox message={error || "Mode Demo (Offline)"} />}
      </div>

      {/* Welcoming Text (replaced Top Brands) */}
      <Section title="Selamat Datang" icon={<Award className="text-indigo-600" />}>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Selamat datang di Katalog Gadget</h3>
          <p className="text-gray-600">Temukan berbagai gadget terbaru dan terbaik dari merek populer. Gunakan pencarian untuk mencari produk, atau lihat koleksi terbaru di bagian "Terbaru".</p>
        </div>
      </Section>

      {/* Featured Gadgets */}
      <Section 
        title="Terbaru" 
        icon={<Smartphone className="text-indigo-600" />} 
        action={<button onClick={() => navTo('gadgets')} className="text-indigo-600 font-bold text-sm">Lihat Semua</button>}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? <Skeleton count={4} /> : gadgets.slice(0, 4).map(g => <GadgetCard key={g.id} item={g} onClick={() => onDetail(g, 'gadget')} />)}
        </div>
      </Section>
    </div>
  );
}