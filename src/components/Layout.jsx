import React from 'react';
import { Home, Smartphone, Tag, User, Search, AlertCircle } from 'lucide-react';

export const Navbar = ({ active, onNav }) => (
  <nav className="fixed bottom-0 w-full bg-white border-t px-6 py-3 z-50 flex justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
    <NavBtn icon={<Home />} label="Home" active={active === 'home'} onClick={() => onNav('home')} />
    <NavBtn icon={<Smartphone />} label="Gadgets" active={active === 'gadgets'} onClick={() => onNav('gadgets')} />
    <NavBtn icon={<Tag />} label="Brands" active={active === 'brands'} onClick={() => onNav('brands')} />
    <NavBtn icon={<User />} label="Profil" active={active === 'profile'} onClick={() => onNav('profile')} />
  </nav>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-xl transition ${active ? 'text-indigo-600 -translate-y-1' : 'text-gray-400'}`}>
    {React.cloneElement(icon, { size: 24 })}
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export const Section = ({ title, icon, action, children }) => (
  <div className="max-w-6xl mx-auto px-6 mb-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="font-bold text-xl flex items-center gap-2">{icon} {title}</h2>
      {action}
    </div>
    {children}
  </div>
);

export const Header = ({ title, search, searchValue, onSearchChange }) => (
  <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
    <h2 className="text-3xl font-bold">{title}</h2>
    {search && <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Cari gadget..."
        className="w-full bg-white border border-gray-200 py-2.5 pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-sm"
        value={searchValue}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
      />
    </div>}
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