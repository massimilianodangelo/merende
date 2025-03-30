import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MyOrdersPage from "@/pages/my-orders-page";
import AdminPage from "@/pages/admin-page";
import RepresentativePage from "@/pages/representative-page";
import UserAdminPage from "@/pages/user-admin-page";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute, AdminRoute, RepresentativeRoute, UserAdminRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/my-orders" component={MyOrdersPage} />
      <RepresentativeRoute path="/representative" component={RepresentativePage} />
      <AdminRoute path="/admin" component={AdminPage} />
      <UserAdminRoute path="/user-admin" component={UserAdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
