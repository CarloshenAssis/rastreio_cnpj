import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Consulta from "./pages/Consulta";
import Monitoramento from "./pages/Monitoramento";
import Alertas from "./pages/Alertas";
import Historico from "./pages/Historico";
import Planos from "./pages/Planos";
import Admin from "./pages/Admin";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/consulta" element={<Consulta />} />
            <Route path="/monitoramento" element={<Monitoramento />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
