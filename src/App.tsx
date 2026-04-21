/**
 * App.tsx — Root application component.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminPathProvider, useAdminPath } from "@/hooks/useAdminPath";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import { lazy, Suspense } from "react";

/* ─── Lazy-loaded public pages ─────────────────────────────────────── */
const Index = lazy(() => import("./pages/Index"));
const CocktailsPage = lazy(() => import("./pages/CocktailsPage"));
const CocktailsClassicPage = lazy(() => import("./pages/CocktailsClassicPage"));
const NonAlcoholicPage = lazy(() => import("./pages/NonAlcoholicPage"));
const RecipePage = lazy(() => import("./pages/RecipePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const IngredientPage = lazy(() => import("./pages/IngredientPage"));
const IngredientsPage = lazy(() => import("./pages/IngredientsPage"));
const RoulettePage = lazy(() => import("./pages/RoulettePage"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));

/* ─── Lazy-loaded admin pages ──────────────────────────────────────── */
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminDrinks = lazy(() => import("./pages/admin/AdminDrinks"));
const AdminIngredients = lazy(() => import("./pages/admin/AdminIngredients"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminLanguages = lazy(() => import("./pages/admin/AdminLanguages"));
const AdminTools = lazy(() => import("./pages/admin/AdminTools"));
const AdminIngredientTypes = lazy(() => import("./pages/admin/AdminIngredientTypes"));
const AdminVideos = lazy(() => import("./pages/admin/AdminVideos"));
const AdminCountryTargets = lazy(() => import("./pages/admin/AdminCountryTargets"));
const AdminSeo = lazy(() => import("./pages/admin/AdminSeo"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminBackup = lazy(() => import("./pages/admin/AdminBackup"));

/* ─── React Query configuration ────────────────────────────────────── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function PublicLayout() {
  return (
    <LanguageProvider>
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Footer />
    </LanguageProvider>
  );
}

/* Shared public routes (used for both /:lang and / prefixes) */
const publicRoutes = (
  <>
    <Route index element={<Index />} />
    <Route path="cocktails" element={<CocktailsPage />} />
    <Route path="cocktails/classic" element={<CocktailsClassicPage />} />
    {/* Legacy /shots → redirect to cocktails */}
    <Route path="shots" element={<Navigate to="../cocktails" replace />} />
    <Route path="non-alcoholic" element={<NonAlcoholicPage />} />
    <Route path="ingredients" element={<IngredientsPage />} />
    <Route path="recipe/:slug" element={<RecipePage />} />
    <Route path="ingredient/:slug" element={<IngredientPage />} />
    <Route path="search" element={<SearchPage />} />
    <Route path="roulette" element={<RoulettePage />} />
    <Route path="contacts" element={<ContactsPage />} />
    <Route path="*" element={<NotFound />} />
  </>
);

function AppRoutes() {
  const { adminPath, loading } = useAdminPath();

  if (loading) return <PageLoader />;

  return (
    <Routes>
      <Route
        path={`/${adminPath}/login`}
        element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>}
      />

      <Route
        path={`/${adminPath}`}
        element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
        <Route path="drinks" element={<Suspense fallback={<PageLoader />}><AdminDrinks /></Suspense>} />
        <Route path="ingredients" element={<Suspense fallback={<PageLoader />}><AdminIngredients /></Suspense>} />
        <Route path="tools" element={<Suspense fallback={<PageLoader />}><AdminTools /></Suspense>} />
        <Route path="ingredient-types" element={<Suspense fallback={<PageLoader />}><AdminIngredientTypes /></Suspense>} />
        <Route path="videos" element={<Suspense fallback={<PageLoader />}><AdminVideos /></Suspense>} />
        <Route path="reviews" element={<Suspense fallback={<PageLoader />}><AdminReviews /></Suspense>} />
        <Route path="languages" element={<Suspense fallback={<PageLoader />}><AdminLanguages /></Suspense>} />
        <Route path="countries" element={<Suspense fallback={<PageLoader />}><AdminCountryTargets /></Suspense>} />
        <Route path="seo" element={<Suspense fallback={<PageLoader />}><AdminSeo /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoader />}><AdminMessages /></Suspense>} />
        <Route path="backup" element={<Suspense fallback={<PageLoader />}><AdminBackup /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
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
  <ErrorBoundary>
    <ThemeProvider>
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
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
