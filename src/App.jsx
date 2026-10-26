import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Landing from './pages/Landing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DeleteData from './pages/DeleteData';
import Planos from './pages/Planos';
import Rescisao from './pages/Rescisao';
import VideoPromo from './pages/VideoPromo';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Approvals from './pages/Approvals';
import Policy from './pages/Policy';
import Punch from './pages/Punch';
import Espelho from './pages/Espelho';
import Employees from './pages/Employees';
import Audit from './pages/Audit';
import CompanySettings from './pages/CompanySettings';
import Assistant from './pages/Assistant';
import Calculators from './pages/Calculators';
import Contador from './pages/Contador';
import PainelContador from './pages/PainelContador';
import Ativar from './pages/Ativar';
import AppHome from './pages/AppHome';
import Ranking from './pages/Ranking';
import RelatorioContador from './pages/RelatorioContador';
import TabelasOficiais from './pages/TabelasOficiais';
import Indicacao from './pages/Indicacao';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Landing />} />
      <Route path="/privacidade" element={<Privacy />} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/excluir-dados" element={<DeleteData />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/contador" element={<Contador />} />
      <Route path="/ativar/:id" element={<Ativar />} />
      <Route path="/r/:code" element={<Indicacao />} />
      <Route path="/video-promo" element={<VideoPromo />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/painel-contador" element={<PainelContador />} />
        <Route element={<AppShell />}>
          <Route path="/p" element={<AppHome />} />
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/despesas" element={<Expenses />} />
          <Route path="/aprovacoes" element={<Approvals />} />
          <Route path="/politica" element={<Policy />} />
          <Route path="/ponto" element={<Punch />} />
          <Route path="/espelho" element={<Espelho />} />
          <Route path="/colaboradores" element={<Employees />} />
          <Route path="/auditoria" element={<Audit />} />
          <Route path="/empresa" element={<CompanySettings />} />
          <Route path="/assistente" element={<Assistant />} />
          <Route path="/calculadoras" element={<Calculators />} />
          <Route path="/rescisao" element={<Rescisao />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/relatorio-contador" element={<RelatorioContador />} />
          <Route path="/tabelas-oficiais" element={<TabelasOficiais />} />
          <Route path="/planos" element={<Planos />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App