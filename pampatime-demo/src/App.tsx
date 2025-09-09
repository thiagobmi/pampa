// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { managementRoutes, ManagementRouteConfig } from "./config/managementRoutes";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import HomeDashboard from "./pages/HomeDashboard";
import History from "./pages/History";
import Reports from "./pages/Reports";
import GenericManagement from "./pages/GenericManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/homedashboard" element={<HomeDashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
          {Object.values(managementRoutes).map((route: ManagementRouteConfig<any>) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <GenericManagement
                  title={route.title}
                  collectionPath={route.collectionPath}
                  searchPlaceholder={route.searchPlaceholder}
                  addBtnLabel={route.addBtnLabel}
                  columns={route.columns}
                />
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;