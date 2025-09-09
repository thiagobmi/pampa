import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, Users, MapPin, BookOpen, Eye, Filter, Calendar as CalendarIcon, CheckCircle 
} from 'lucide-react';
import logo from '@/assets/logo.png';
import useAuth from '@/hooks/useAuth';

const features = [
  { icon: Clock,      title: 'Otimização de Horários', desc: 'Organize os horários evitando conflitos e maximizando eficiência.' },
  { icon: Users,      title: 'Gestão de Professores',  desc: 'Cadastre professores, disponibilidades e disciplinas.' },
  { icon: MapPin,     title: 'Alocação de Salas',      desc: 'Distribua aulas nas salas adequadas conforme capacidade e recursos.' },
  { icon: BookOpen,   title: 'Gestão de Disciplinas',  desc: 'Organize disciplinas por curso, turma e semestre.' },
  { icon: Eye,        title: 'Visualização Intuitiva', desc: 'Interface clara para identificar rapidamente conflitos.' },
  { icon: Filter,     title: 'Filtros Avançados',      desc: 'Filtre por professor, sala, período ou turma.' },
];

export default function Landing() {
  const { user } = useAuth();
  const primaryCta = user ? (
    <Link to="/homedashboard">
      <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">Ir para Dashboard</Button>
    </Link>
  ) : (
    <Link to="/login">
      <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">Entrar</Button>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white" id="home">
      {/* Header simples dedicado à landing */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8 text-sm font-medium">
              <a href="#home" className="text-gray-600 hover:text-green-600">Home</a>
              <a href="#sobre" className="text-gray-600 hover:text-green-600">Sobre</a>
              <a href="#recursos" className="text-gray-600 hover:text-green-600">Recursos</a>
              <a href="#contato" className="text-gray-600 hover:text-green-600">Contato</a>
            </div>
            <div className="flex-1 flex justify-center">
              <img src={logo} alt="PampaTime" className="h-32" />
            </div>
            <div>
              {user ? (
                <Link to="/homedashboard"><Button variant="outline" className="border-gray-300 hover:border-green-300 hover:bg-green-50">Dashboard</Button></Link>
              ) : (
                <Link to="/login"><Button variant="outline" className="border-gray-300 hover:border-green-300 hover:bg-green-50">Login</Button></Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">PampaTime</h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Plataforma inteligente para gestão de horários acadêmicos. Reduza conflitos, centralize informações e facilite o planejamento.
            </p>
            <div className="flex gap-4 flex-wrap">
              {primaryCta}
              <a href="#sobre" className="text-green-600 font-medium self-center hover:underline">Saiba mais</a>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-700">Exemplo de Horários</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded font-medium flex-1">Física</div>
                <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded font-medium flex-1">Algoritmos</div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded font-medium inline-block">Matemática</div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500"/>Conflitos evitados</span>
                <span>Visualização rápida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Centralize a gestão acadêmica</h2>
          <p className="text-lg text-gray-600">Salas, professores, turmas, disciplinas e semestres em um único lugar com histórico de alterações e controle de acesso por papéis.</p>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(f => (
              <Card key={f.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para melhorar seus horários?</h2>
          <p className="text-lg text-gray-600 mb-8">Controle completo e colaboração segura entre coordenadores e administradores.</p>
          {primaryCta}
        </div>
      </section>

      {/* Contato (placeholder) */}
      <section id="contato" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-semibold text-gray-800">Fale conosco</h3>
          <p className="text-gray-600 text-sm">Integraremos um formulário ou email de suporte aqui.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2">
              <img src={logo} alt="PampaTime" className="h-8" />
              <span className="text-sm text-gray-600">© {new Date().getFullYear()} PampaTime. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
