import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import ProductDetailSupabase from "@/pages/ProductDetailSupabase";
import CategoryPage from "@/pages/CategoryPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import CartPage from "@/pages/CartPage";
import Checkout from "@/pages/Checkout";
import OrderComplete from "@/pages/OrderComplete";
import Community from "@/pages/Community";
import Editor from "@/pages/Editor";
import Inquiry from "@/pages/Inquiry";
import ReviewDetail from "@/pages/ReviewDetail";
import Resources from "@/pages/Resources";
import Events from "@/pages/Events";
import CommunityShare from "@/pages/CommunityShare";
import CommunityQuestion from "@/pages/CommunityQuestion";
import Collections from "@/pages/Collections";
import Rewards from "@/pages/Rewards";
import ReviewsAll from "@/pages/ReviewsAll";
import DesignServiceProduct from "@/pages/DesignServiceProduct";
import CommunityDesignShare from "@/pages/CommunityDesignShare";
import CommunityEvents from "@/pages/CommunityEvents";
import CommunityResources from "@/pages/CommunityResources";
import UserContentShowcase from "@/pages/UserContentShowcase";
import CommunityQA from "@/pages/CommunityQA";
import MyPage from "@/pages/MyPage";
import MyPageSupabase from "@/pages/MyPageSupabase";
import OrderDetail from "@/pages/OrderDetail";
import Wishlist from "@/pages/Wishlist";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminLogin from "@/pages/admin/Login";
import AdditionalServices from "@/pages/AdditionalServices";
import SearchResults from "@/pages/SearchResults";
import ProductSearchPage from "@/pages/ProductSearchPage";
import ProductList from "@/pages/ProductList";
import CommunityWrite from "@/pages/CommunityWrite";
import ReviewWrite from "@/pages/ReviewWrite";
import { Notifications } from "@/pages/Notifications";
import PaymentSelect from "@/pages/PaymentSelect";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailed from "@/pages/PaymentFailed";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SupabaseProvider } from "@/components/SupabaseProvider";
import SupabaseExample from "@/components/examples/SupabaseExample";
import ProductsPage from "@/pages/ProductsPage";
import AuthPage from "@/components/auth/AuthPage";
import OrdersPage from "@/pages/OrdersPage";
import CommunityPage from "@/pages/CommunityPage";
import CommunityWritePage from "@/pages/CommunityWritePage";
import CommunityPostPage from "@/pages/CommunityPostPage";
import CommunityPostDetail from "@/pages/CommunityPostDetail";
import SellerDashboard from "@/pages/SellerDashboard";

function Router() {
  const [location] = useLocation();

  // Determine if we should show community navigation
  const showCommunityNav =
    location.startsWith("/community") ||
    location === "/resources" ||
    location === "/events" ||
    location === "/showcase" ||
    location === "/doan" ||
    location === "/event" ||
    location.startsWith("/community/qna") ||
    location.startsWith("/community/question");

  return (
    <Layout showCommunityNav={showCommunityNav}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={ProductList} />
        <Route path="/product/:id" component={ProductDetailSupabase} />
        <Route path="/search" component={ProductSearchPage} />

        {/* Category routes */}
        <Route
          path="/category/:category/:subcategory"
          component={CategoryPage}
        />
        <Route path="/category/:category" component={CategoryPage} />

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout">
          {() => (
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/payment/select/:orderId">
          {() => (
            <ProtectedRoute>
              <PaymentSelect />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/payment-failed" component={PaymentFailed} />
        <Route path="/order-complete" component={OrderComplete} />
        <Route path="/mypage">
          {() => (
            <ProtectedRoute>
              <MyPageSupabase />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/order/:id">
          {() => (
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/wishlist">
          {() => (
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/notifications">
          {() => (
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/orders">
          {() => (
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/community" component={CommunityPage} />
        <Route path="/community/write">
          {() => (
            <ProtectedRoute>
              <CommunityWritePage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/community/:id" component={CommunityPostDetail} />
        <Route path="/reviews/:id" component={ReviewDetail} />
        <Route path="/reviews/write">
          {() => (
            <ProtectedRoute>
              <ReviewWrite />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/resources" component={Resources} />
        <Route path="/events" component={Events} />
        <Route path="/collections" component={Collections} />
        <Route path="/community/share" component={CommunityShare} />
        <Route path="/community/question" component={CommunityQuestion} />
        <Route
          path="/community/design-share"
          component={CommunityDesignShare}
        />
        <Route path="/community/events" component={Events} />
        <Route path="/community/resources" component={CommunityResources} />
        <Route path="/community/qna" component={CommunityQA} />
        <Route path="/showcase" component={UserContentShowcase} />

        {/* Shortcut routes */}
        <Route path="/doan" component={CommunityDesignShare} />
        <Route path="/event" component={Events} />
        <Route path="/editor" component={Editor} />
        <Route path="/inquiry" component={Inquiry} />
        <Route path="/support" component={Inquiry} />
        <Route path="/rewards" component={Rewards} />
        <Route path="/reviews/all" component={ReviewsAll} />
        <Route path="/design-service" component={DesignServiceProduct} />
        <Route path="/additional-services" component={AdditionalServices} />

        {/* Seller routes */}
        <Route path="/seller">
          {() => (
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/seller/dashboard">
          {() => (
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          )}
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        
        {/* Supabase Demo */}
        <Route path="/supabase-demo" component={SupabaseExample} />
        <Route path="/supabase-products" component={ProductsPage} />

        {/* Category and section routes */}
        <Route path="/popular" component={Products} />
        <Route path="/new" component={Products} />
        <Route path="/reviews" component={ReviewsAll} />
        <Route path="/showcase" component={Community} />
        <Route path="/material" component={Products} />
        <Route path="/trending" component={Products} />
        <Route path="/picks" component={Products} />
        <Route path="/brand" component={Products} />
        <Route path="/benefits" component={Products} />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <SupabaseProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main>
                  <Router />
                </main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </SupabaseProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
