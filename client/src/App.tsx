import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import DataUpload from "./pages/DataUpload";
import Forecasts from "./pages/Forecasts";
import Alerts from "./pages/Alerts";
import { LayoutDashboard, Package, Upload, TrendingUp, Bell } from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    href: "/products",
    icon: Package,
  },
  {
    title: "Upload de Dados",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Previsões",
    href: "/forecasts",
    icon: TrendingUp,
  },
  {
    title: "Alertas",
    href: "/alerts",
    icon: Bell,
  },
];

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <DashboardLayout navigationItems={navigationItems}>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/products"}>
        <DashboardLayout navigationItems={navigationItems}>
          <Products />
        </DashboardLayout>
      </Route>
      <Route path={"/upload"}>
        <DashboardLayout navigationItems={navigationItems}>
          <DataUpload />
        </DashboardLayout>
      </Route>
      <Route path={"/forecasts"}>
        <DashboardLayout navigationItems={navigationItems}>
          <Forecasts />
        </DashboardLayout>
      </Route>
      <Route path={"/alerts"}>
        <DashboardLayout navigationItems={navigationItems}>
          <Alerts />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
