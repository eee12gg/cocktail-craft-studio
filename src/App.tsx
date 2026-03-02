import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import CocktailsPage from "./pages/CocktailsPage";
import ShotsPage from "./pages/ShotsPage";
import NonAlcoholicPage from "./pages/NonAlcoholicPage";
import RecipePage from "./pages/RecipePage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import IngredientPage from "./pages/IngredientPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDrinksPlaceholder from "./pages/admin/AdminDrinksPlaceholder";
import AdminIngredients from "./pages/admin/AdminIngredients";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/cocktails" element={<CocktailsPage />} />
        <Route path="/shots" element={<ShotsPage />} />
        <Route path="/non-alcoholic" element={<NonAlcoholicPage />} />
        <Route path="/recipe/:slug" element={<RecipePage />} />
        <Route path="/ingredient/:slug" element={<IngredientPage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="drinks" element={<AdminDrinksPlaceholder />} />
          <Route path="ingredients" element={<AdminIngredients />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
