import React from 'react';
import { Home, Smartphone, Tag, User, Search, AlertCircle } from 'lucide-react';

export const Navbar = ({ active, onNav }) => (
  // SAYA MENGHAPUS 'md:hidden' DI BAWAH INI
  <nav className="fixed bottom-0 w-full bg-white border-t px-4 py-2 z-50 flex justify-between items-center shadow-[0_-6px_20px_rgba(15,23,42,0.06)]">
    <div className="w-full flex justify-around">
      <NavBtn icon={<Home />} label="Home" active={active === 'home'} onClick={() => onNav('home')} />
      <NavBtn icon={<Smartphone />} label="Gadgets" active={active === 'gadgets'} onClick={() => onNav('gadgets')} />
      <NavBtn icon={<Tag />} label="Brands" active={active === 'brands'} onClick={() => onNav('brands')} />
      <NavBtn icon={<User />} label="Profil" active={active === 'profile'} onClick={() => onNav('profile')} />
    </div>
  </nav>
);

export const Section = ({ title, icon, action, children }) => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
      <h2 className="font-bold text-lg sm:text-xl flex items-center gap-2">{icon} {title}</h2>
      {action}
    </div>
    {children}
  </div>
);

export const Header = ({ title, search, searchValue, onSearchChange }) => (
  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
    <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
    {search && (
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Cari gadget..."
          className="w-full bg-white border border-gray-200 py-2.5 pl-10 pr-3 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>
    )}
  </div>
);

export const AlertBox = ({ message, variant = 'red' }) => (
  <div className={`mt-4 ${variant === 'red' ? 'bg-red-500/10 border border-red-500/30 text-red-100' : 'bg-orange-500/10 border border-orange-500/30 text-orange-700'} p-3 rounded-xl flex items-center gap-3 text-sm animate-pulse`}>
    <AlertCircle size={20} /> <span>{message}</span>
  </div>
);

export const Skeleton = ({ count, type }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`bg-gray-200 animate-pulse rounded-2xl ${type === 'list' ? 'h-24' : 'aspect-[4/5]'}`} />
    ))}
  </>
);
// Paste ini di bagian bawah file Layout.jsx, atau di bawah komponen Navbar
const NavBtn = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-transform focus:outline-none ${active ? 'text-indigo-600 -translate-y-0.5' : 'text-gray-500'}`}
    aria-pressed={active}
  >
    {React.cloneElement(icon, { size: 22 })}
    <span className="text-[11px] font-semibold mt-1 hidden sm:block">{label}</span>
  </button>
);