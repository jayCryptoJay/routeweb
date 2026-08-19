import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import MapPage from "@/pages/MapPage";
import NotFound from "@/pages/NotFound";
import StopDetail from "@/pages/StopDetail";
import StopList from "@/pages/StopList";
import DriveMode from "@/pages/DriveMode";
import AdminPage from "@/pages/Admin";
import { Loader2 } from "lucide-react";
import { Route, Switch, useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#05070b] text-slate-100">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/stops" component={StopList} />
          <Route path="/stops/:id" component={StopDetail} />
          <Route path="/map" component={MapPage} />
          <Route path="/drive-mode" component={DriveMode} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {location !== "/drive-mode" && location !== "/admin" && <BottomNav />}
    </div>
  );
}

function AuthGate() {
  const { loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#05070b] text-slate-200">
        <div className="text-center"><Loader2 className="mx-auto animate-spin text-sky-300" size={28} /><p className="mt-3 text-sm text-slate-400">Opening your delivery route…</p></div>
      </div>
    );
  }
  return <Router />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Toaster theme="dark" />
        <AuthGate />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
