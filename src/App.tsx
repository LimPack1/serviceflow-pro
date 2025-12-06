import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

// Root redirect component based on role
function RootRedirect() {
  const { isITStaff, loading, primaryRole } = useAuth();
  
  if (loading) {
    return null;
  }
  
  // IT Staff (admin, manager) go to main dashboard
  // Front Office (user, agent) go to portal
  if (isITStaff) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to="/portal" replace />;
}

// Component to handle initial redirect after login
function HomeRedirect() {
  const { isITStaff, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!isITStaff) {
    return <Navigate to="/portal" replace />;
  }
  
  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* IT Staff Routes (Back Office) - requires IT Staff role */}
            <Route element={
              <ProtectedRoute requireITStaff>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<HomeRedirect />} />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
