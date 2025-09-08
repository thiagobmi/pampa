import useRealtimeCollection from '@/hooks/useRealtimeCollection';
import { TeacherItem, BookingItem, CourseItem, SubjectItem, TurmaItem } from '@/types/management';
import { Link } from 'react-router-dom';
import React from 'react';
import {
    FiClock,
    FiUsers,
    FiHome,
    FiBook,
    FiAward,
    FiUserCheck,
} from 'react-icons/fi';

const CardsAdm = () => { 
    const userName = 'Usuário';

    const { data: professoresData, loading: professoresLoading } = useRealtimeCollection<TeacherItem>('professores', { listenLive: true });
    const { data: salasData, loading: salasLoading } = useRealtimeCollection<BookingItem>('salas', { listenLive: true });
    const { data: cursosData, loading: cursosLoading } = useRealtimeCollection<CourseItem>('cursos', { listenLive: true });
    const { data: disciplinasData, loading: disciplinasLoading } = useRealtimeCollection<SubjectItem>('disciplinas', { listenLive: true });
    const { data: turmasData, loading: turmasLoading } = useRealtimeCollection<TurmaItem>('turmas', { listenLive: true });

    return (
        <section className="px-8 py-6 font-ubuntu">
            <div className="flex justify-between items-start gap-8 mb-8 flex-wrap">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Bem-vindo, {userName}!
                    </h1>
                    <p className="text-gray-600">
                        Painel de administração do Horário Central
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-black/30 shadow-md p-6 pt-10 relative flex flex-col gap-2 border-t-4 border-pink-400 min-w-[685px] w-[350px]">
                    <FiClock className="absolute top-4 right-4 text-2xl text-black" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Horários</h3>
                    <p className="text-gray-600 mb-4">Organize e Visualize os horários</p>
                    <Link
                        to="/semestres"
                        className="border border-black px-4 py-2 rounded-full font-medium hover:bg-green-500 hover:text-white transition text-center"
                    >
                        Ver Detalhes
                    </Link>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {[
                    {
                        title: 'Professores',
                        icon: <FiUsers />,
                        color: 'border-blue-500',
                        path: '/professores',
                        count: professoresData.length, 
                        loading: professoresLoading,    
                    },
                    {
                        title: 'Salas',
                        icon: <FiHome />,
                        color: 'border-green-500',
                        path: '/salas',
                        count: salasData.length,
                        loading: salasLoading,
                    },
                    {
                        title: 'Cursos',
                        icon: <FiAward />,
                        color: 'border-orange-500',
                        path: '/cursos',
                        count: cursosData.length,
                        loading: cursosLoading,
                    },
                    {
                        title: 'Turmas',
                        icon: <FiUserCheck />,
                        color: 'border-purple-500',
                        path: '/turmas',
                        count: turmasData.length,
                        loading: turmasLoading,
                    },
                    {
                        title: 'Disciplinas',
                        icon: <FiBook />,
                        color: 'border-red-500',
                        path: '/disciplinas',
                        count: disciplinasData.length,
                        loading: disciplinasLoading,
                    },
                ].map(({ title, icon, color, path, count, loading }) => ( 
                    <div
                        key={title}
                        className={`relative bg-white p-6 rounded-xl border-t-4 ${color} border border-gray-200 shadow`}
                    >
                        <div className="absolute top-4 right-4 text-xl text-black">
                            {icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-gray-600">{title} no Sistema</p>
                        <div className="text-2xl font-bold text-gray-900 my-2">
                            {loading ? '...' : count} 
                        </div>
                        <Link
                            to={path}
                            className="border border-black px-4 py-2 rounded-full font-medium hover:bg-green-500 hover:text-white transition text-center inline-block"
                        >
                            Ver Detalhes
                        </Link>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Passos</h2>
                    <ul className="space-y-4">
                        <li className="flex gap-4">
                            <FiClock className="text-2xl text-black mt-1" />
                            <div>
                                <strong className="text-gray-900">Visualize os Horários</strong>
                                <p className="text-gray-600 text-sm">
                                    Consulte os horários alocados para disciplinas e professores.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <FiUserCheck className="text-2xl text-black mt-1" />
                            <div>
                                <strong className="text-gray-900">Gerencie Turmas</strong>
                                <p className="text-gray-600 text-sm">
                                    Organize e gerencie as turmas dos diferentes cursos.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <FiBook className="text-2xl text-black mt-1" />
                            <div>
                                <strong className="text-gray-900">Gerencie Disciplinas</strong>
                                <p className="text-gray-600 text-sm">
                                    Adicione, edite e remova disciplinas.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <FiUsers className="text-2xl text-black mt-1" />
                            <div>
                                <strong className="text-gray-900">Gerencie Professores</strong>
                                <p className="text-gray-600 text-sm">
                                    Adicione, edite e remova professores.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Sobre o Sistema</h2>
                    <p className="text-gray-600 mb-4">
                        O sistema Horário Central foi desenvolvido para facilitar o gerenciamento
                        de horários acadêmicos, permitindo a alocação eficiente de salas,
                        professores, turmas e disciplinas.
                    </p>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li><strong style={{ color: '#785AEF' }}>T</strong> - Teórica</li>
                        <li><strong style={{ color: '#EF4346' }}>P</strong> - Prática</li>
                        <li><strong style={{ color: "#5AEF82" }}>S</strong> - Seminário</li>
                        <li><strong style={{ color: '#6DC1DD' }}>TP/PS/TS</strong> - Combinações</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default CardsAdm;