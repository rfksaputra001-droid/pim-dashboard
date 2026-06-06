import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-gray-900 text-sm">Kas KT Pengeteh Keker</span>
          <span className="text-xs text-gray-400">RT 22/06</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/" className={linkClass('/')}>Dashboard</Link>
          <Link
            to="/setor"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
          >
            Kirim Dukungan
          </Link>
        </div>
      </div>
    </nav>
  );
}
