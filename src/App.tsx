import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminPathProvider, useAdminPath } from "@/hooks/useAdminPath";
import { LanguageProvider } from "@/hooks/useLanguage";
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
import IngredientsPage from "./pages/IngredientsPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDrinks from "./pages/admin/AdminDrinks";
import AdminIngredients from "./pages/admin/AdminIngredients";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminLanguages from "./pages/admin/AdminLanguages";
import AdminTools from "./pages/admin/AdminTools";
import AdminIngredientTypes from "./pages/admin/AdminIngredientTypes";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

function PublicLayout() {
  return (
    <LanguageProvider>
      <Header />
      <Outlet />
      <Footer />
    </LanguageProvider>
  );
}

const publicRoutes = (
  <>
    <Route index element={<Index />} />
    <Route path="cocktails" element={<CocktailsPage />} />
    <Route path="shots" element={<ShotsPage />} />
    <Route path="non-alcoholic" element={<NonAlcoholicPage />} />
    <Route path="ingredients" element={<IngredientsPage />} />
    <Route path="recipe/:slug" element={<RecipePage />} />
    <Route path="ingredient/:slug" element={<IngredientPage />} />
    <Route path="search" element={<SearchPage />} />
    <Route path="*" element={<NotFound />} />
  </>
);

function AppRoutes() {
  const { adminPath, loading } = useAdminPath();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path={`/${adminPath}/login`} element={<AdminLogin />} />
      <Route
        path={`/${adminPath}`}
        element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="drinks" element={<AdminDrinks />} />
        <Route path="ingredients" element={<AdminIngredients />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="ingredient-types" element={<AdminIngredientTypes />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="languages" element={<AdminLanguages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/:lang" element={<PublicLayout />}>
        {publicRoutes}
      </Route>

      <Route path="/" element={<PublicLayout />}>
        {publicRoutes}
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminPathProvider>
            <ScrollToTop />
            <AppRoutes />
          </AdminPathProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
