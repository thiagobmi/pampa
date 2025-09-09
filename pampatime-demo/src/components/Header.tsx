// src/components/Header.tsx
import logo from '../assets/logo.png';
import { FiClock } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, signOutApp, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOutApp();
    navigate('/login');
  };

  return (
    <header className="font-normal bg-white px-8 py-4 border-b border-gray-200">
      <nav className="max-w-[1200px] mx-auto flex justify-between items-center relative">


        <div className="flex gap-8 text-gray-600 text-sm">
          <Link
            to="/homedashboard"
            className="relative after:content-[''] after:absolute after:left-0 after:bottom-[0.1em] after:h-[1px] after:w-0 after:bg-[#49C17B] after:transition-all after:duration-200 hover:after:w-full"
          >
            Início
          </Link>

          <Link
            to="/calendar"
            className="relative after:content-[''] after:absolute after:left-0 after:bottom-[0.1em] after:h-[1px] after:w-0 after:bg-[#49C17B] after:transition-all after:duration-200 hover:after:w-full"
          >
            Calendário
          </Link>

          <Link
            to="/reports"
            className="relative after:content-[''] after:absolute after:left-0 after:bottom-[0.1em] after:h-[1px] after:w-0 after:bg-[#49C17B] after:transition-all after:duration-200 hover:after:w-full"
          >
            Relatórios
          </Link>

          {[ "Contato"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative after:content-[''] after:absolute after:left-0 after:bottom-[0.1em] after:h-[1px] after:w-0 after:bg-[#49C17B] after:transition-all after:duration-200 hover:after:w-full"
            >
              {item}
            </a>
          ))}

        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img src={logo} alt="PampaTime Logo" className="h-32" />
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          {user && (
            <Link to="/history" title="Histórico">
              <FiClock className="text-2xl text-gray-600 hover:text-[#49C17B] cursor-pointer" />
            </Link>
          )}
          {isAdmin && user && (
            <Link to="/admin" className="text-sm text-gray-700 hover:text-[#49C17B]">Admin</Link>
          )}
          {user && (
            <Link to="/profile" className="text-sm text-gray-700 hover:text-[#49C17B]">Perfil</Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 max-w-[140px] truncate" title={user.email || undefined}>{user.email}</span>
              <Button size="sm" variant="outline" onClick={handleLogout}>Sair</Button>
            </div>
          ) : (
            <Button size="sm" variant="default" onClick={() => navigate('/login')}>Entrar</Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;