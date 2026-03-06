import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPath } from "@/hooks/useAdminPath";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const { adminPath } = useAdminPath();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to={`/${adminPath}/login`} replace />;
  }

  return <>{children}</>;
}
