import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavItem } from '@/types/management';


interface ManagementNavProps {
  className?: string;
}

const navLinks: NavItem[] = [
  { label: 'Professor', path: '/professores' },
  { label: 'Sala', path: '/salas' },
  { label: 'Curso', path: '/cursos' },
  { label: 'Turmas', path: '/turmas' },
  { label: 'Disciplinas', path: '/disciplinas' },
  { label: 'Semestres', path: '/semestres' },
];


const ManagementNav = ({ className }: ManagementNavProps) => {
  const location = useLocation();

  return (
    <nav className={`w-full ${className || ''}`}>
      <ul className="flex flex-row flex-wrap justify-center gap-4 p-1">
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`
                px-6 py-2 rounded-full font-medium transition flex-shrink-0
                ${location.pathname === link.path
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ManagementNav;