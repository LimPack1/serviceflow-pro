import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { InterfaceModeProvider, useInterfaceMode } from "./contexts/InterfaceModeContext";
import { AppLayout } from "./components/layout/AppLayout";
import { UserPortalLayout } from "./components/layout/UserPortalLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import Inventory from "./pages/Inventory";
import Knowledge from "./pages/Knowledge";
import Catalog from "./pages/Catalog";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

// IT Staff Pages
import AdminHome from "./pages/it/AdminHome";
import TechnicianHome from "./pages/it/TechnicianHome";

// Portal Pages
import UserHome from "./pages/portal/UserHome";
import UserTickets from "./pages/portal/UserTickets";
import UserTicketDetail from "./pages/portal/UserTicketDetail";
import UserCreateTicket from "./pages/portal/UserCreateTicket";
import UserCatalog from "./pages/portal/UserCatalog";
import UserKnowledge from "./pages/portal/UserKnowledge";

const queryClient = new QueryClient();

// Component to handle interface mode routing
function InterfaceModeRouter() {
  const { isITStaff, loading } = useAuth();
  const { mode } = useInterfaceMode();

  if (loading) {
    return null;
  }

  // IT Staff in user mode should use portal layout
  if (isITStaff && mode === 'user') {
    return (
      <Routes>
        {/* Portal Routes for IT Staff in user mode */}
        <Route element={
          <ProtectedRoute>
            <UserPortalLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<UserHome />} />
          <Route path="/portal" element={<UserHome />} />
          <Route path="/portal/tickets" element={<UserTickets />} />
          <Route path="/portal/tickets/:id" element={<UserTicketDetail />} />
          <Route path="/portal/tickets/new" element={<UserCreateTicket />} />
          <Route path="/portal/catalog" element={<UserCatalog />} />
          <Route path="/portal/knowledge" element={<UserKnowledge />} />
          <Route path="/tickets" element={<Navigate to="/portal/tickets" replace />} />
          <Route path="/tickets/new" element={<Navigate to="/portal/tickets/new" replace />} />
          <Route path="/catalog" element={<Navigate to="/portal/catalog" replace />} />
          <Route path="/knowledge" element={<Navigate to="/portal/knowledge" replace />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Default routing for IT Staff in SI mode or non-IT users
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      
      {/* IT Staff Routes (Back Office) - requires IT Staff role */}
      <Route element={
        <ProtectedRoute requireITStaff>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/inventory" element={<Inventory />} />
        {/* Admin only routes */}
        <Route path="/users" element={
          <ProtectedRoute requireAdmin>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requireAdmin>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* User Portal Routes (Front Office) */}
      <Route element={
        <ProtectedRoute>
          <UserPortalLayout />
        </ProtectedRoute>
      }>
        <Route path="/portal" element={<UserHome />} />
        <Route path="/portal/tickets" element={<UserTickets />} />
        <Route path="/portal/tickets/:id" element={<UserTicketDetail />} />
        <Route path="/portal/tickets/new" element={<UserCreateTicket />} />
        <Route path="/portal/catalog" element={<UserCatalog />} />
        <Route path="/portal/knowledge" element={<UserKnowledge />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InterfaceModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <InterfaceModeRouter />
          </BrowserRouter>
        </TooltipProvider>
      </InterfaceModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
