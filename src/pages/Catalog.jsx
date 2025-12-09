import { useState } from 'react';
import { Header, Skeleton } from '../components/Layout';
import { X, Smartphone } from 'lucide-react';
import { GadgetCard, BrandCard } from '../components/Cards';

export const CatalogPage = ({ gadgets = [], loading, onDetail, activeBrand, onClearBrand }) => {
  const [searchTerm, setSearchTerm] = useState('');

const filteredGadgets = gadgets.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // PERBAIKAN DISINI:
    // Cek item.brands.name (struktur default Supabase) ATAU item.brand_name (jaga-jaga)
    const brandName = item.brands?.name || item.brand_name; 
    
    // ... di dalam CatalogPage
const matchesBrand = activeBrand 
  ? (item.brand_name && item.brand_name.toLowerCase() === activeBrand.toLowerCase()) 
  : true;

    return matchesSearch && matchesBrand;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 animate-fade-in">
      <Header
        title="Katalog Gadget"
        search
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Active brand indicator */}
      {activeBrand && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-500">Menampilkan produk dari:</span>
          <div className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
            {activeBrand}
            {onClearBrand && (
              <button onClick={onClearBrand} className="ml-2 bg-white/10 rounded-full p-0.5">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && filteredGadgets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Smartphone size={48} className="mx-auto mb-2 opacity-20" />
          <p>{activeBrand ? `Tidak ada gadget untuk brand ${activeBrand} 😔` : `Gadget "${searchTerm}" tidak ditemukan 😔`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? <Skeleton count={8} /> : filteredGadgets.map(g => (
            <GadgetCard key={g.id} item={g} onClick={() => onDetail(g, 'gadget')} />
          ))}
        </div>
      )}
    </div>
  );
};

export const BrandsPage = ({ brands = [], loading, onDetail, onBrandClick }) => {
  const handleClick = (b) => {
    if (onBrandClick) return onBrandClick(b.name || b);
    if (onDetail) return onDetail(b, 'brand');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-24 animate-fade-in">
      <Header title="Official Brands" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton count={6} type="list" />
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>Tidak ada brand tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map(b => <BrandCard key={b.id} item={b} onClick={() => handleClick(b)} />)}
        </div>
      )}
    </div>
  );
};