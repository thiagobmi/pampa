// src/App.tsx - Versão atualizada com rota para histórico simples
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { managementRoutes, ManagementRouteConfig } from "./config/managementRoutes";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import HomeDashboard from "./pages/HomeDashboard";
import SimpleHistory from "./pages/SimpleHistory"; // Nova página de histórico
import Reports from "./pages/Reports";
import GenericManagement from "./pages/GenericManagementPage";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";
import useAuth from "./hooks/useAuth";

const queryClient = new QueryClient();

// Guard components
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-6">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <div className="p-6">Sem permissão</div>;
  return children;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Landing />} />
            <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
            <Route path="/homedashboard" element={<RequireAuth><HomeDashboard /></RequireAuth>} />
            <Route path="/history" element={<RequireAuth><SimpleHistory /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
            {Object.values(managementRoutes).map((route: ManagementRouteConfig<any>) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RequireAuth>
                    <GenericManagement
                      title={route.title}
                      collectionPath={route.collectionPath}
                      searchPlaceholder={route.searchPlaceholder}
                      addBtnLabel={route.addBtnLabel}
                      columns={route.columns}
                    />
                  </RequireAuth>
                }
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;