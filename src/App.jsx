import { useState } from 'react';
import { useSupabase } from './hooks/useSupabase';
import { Navbar } from './components/Layout';
import HomePage from './pages/Home';
import { CatalogPage, BrandsPage } from './pages/Catalog';
import { ProfilePage, DetailPage } from './pages/Details';

export default function App() {
  const { gadgets, brands, loading, error, offline, refresh } = useSupabase();
  const [page, setPage] = useState('home');
  const [detail, setDetail] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);

  const go = (targetPage) => { setPage(targetPage); setDetail(null); if (targetPage !== 'gadgets') setBrandFilter(null); window.scrollTo(0,0); };
  const showDetail = (item, type) => { setDetail({ item, type }); setPage('detail'); window.scrollTo(0,0); };
  const handleBrandClick = (brandName) => { setBrandFilter(brandName); setPage('gadgets'); window.scrollTo(0,0); };

  const renderPage = () => {
    switch (page) {
      case 'home': return (
        <HomePage
          gadgets={gadgets}
          brands={brands}
          loading={loading}
          offline={offline}
          error={error}
          onRefresh={refresh}
          navTo={go}
          onDetail={showDetail}
          onBrandClick={handleBrandClick}
        />
      );
      case 'gadgets': return (
        <CatalogPage
          gadgets={gadgets}
          loading={loading}
          onDetail={showDetail}
          activeBrand={brandFilter}
          onClearBrand={() => setBrandFilter(null)}
        />
      );
      case 'brands': return (
        <BrandsPage brands={brands} loading={loading} onBrandClick={handleBrandClick} />
      );
      case 'profile': return <ProfilePage offline={offline} />;
      case 'detail': return <DetailPage data={detail} onBack={() => go('gadgets')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
      <div className="w-full">{renderPage()}</div>
      {page !== 'detail' && <Navbar active={page} onNav={go} />}
    </div>
  );
}