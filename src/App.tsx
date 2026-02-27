import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import CocktailsPage from "./pages/CocktailsPage";
import ShotsPage from "./pages/ShotsPage";
import NonAlcoholicPage from "./pages/NonAlcoholicPage";
import RecipePage from "./pages/RecipePage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import IngredientPage from "./pages/IngredientPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cocktails" element={<CocktailsPage />} />
          <Route path="/shots" element={<ShotsPage />} />
          <Route path="/non-alcoholic" element={<NonAlcoholicPage />} />
          <Route path="/recipe/:slug" element={<RecipePage />} />
          <Route path="/ingredient/:slug" element={<IngredientPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
