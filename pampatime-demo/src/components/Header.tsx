// src/components/Header.tsx
import logo from '../assets/logo.png';
import { FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="font-normal bg-white px-8 py-4 border-b border-gray-200">
      <nav className="max-w-[1200px] mx-auto flex justify-between items-center relative">

        <div className="flex gap-8 text-gray-600 text-sm">
          <Link
            to="/"
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

          {["Configuração", "Contato"].map((item) => (
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
          <img src={logo} alt="PampaTime Logo" className="h-24" />
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Link to="/history">
            <FiClock className="text-2xl text-gray-600 hover:text-[#49C17B] cursor-pointer" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
            alt="Usuário"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;