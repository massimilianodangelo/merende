import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Countdown } from "@/components/ui/countdown";
import { getInitials, formatCurrency } from "@/lib/utils";
import { ProductCategories, type ProductCategory, type Product } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  ShoppingCart, 
  Search, 
  LogOut, 
  User, 
  FileText,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CartContents } from "@/components/cart-contents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [_, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(ProductCategories.ALL);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{ open: boolean, orderId: number | null }>({
    open: false,
    orderId: null
  });

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
    queryFn: async () => {
      const url = `/api/products${selectedCategory !== ProductCategories.ALL ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  // Filter products by search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOrderPlaced = (orderId: number) => {
    setOrderConfirmation({
      open: true,
      orderId
    });
  };

  const closeOrderConfirmation = () => {
    setOrderConfirmation({
      open: false,
      orderId: null
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Distribuzione merende</h1>
              <span className="text-xs sm:text-sm text-gray-500 block sm:hidden">
                {user?.firstName} {user?.lastName} - {user?.classRoom}
              </span>
            </div>
            
            <div className="sm:hidden flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative sm:hidden"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <span>{getInitials(user?.firstName || '', user?.lastName || '')}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>I miei ordini</span>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Pannello amministratore</span>
                    </DropdownMenuItem>
                  )}
                  {user?.isUserAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/user-admin")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Gestione utenti</span>
                    </DropdownMenuItem>
                  )}
                  {user?.isRepresentative && !user?.isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/representative")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Pannello rappresentante</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center mt-2 sm:mt-0">
            <span className="mr-4 text-sm font-medium text-gray-700 hidden md:inline-block">
              {user?.firstName} {user?.lastName} - {user?.classRoom}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span>{getInitials(user?.firstName || '', user?.lastName || '')}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>I miei ordini</span>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Pannello amministratore</span>
                  </DropdownMenuItem>
                )}
                {user?.isUserAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/user-admin")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Gestione utenti</span>
                  </DropdownMenuItem>
                )}
                {user?.isRepresentative && !user?.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/representative")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Pannello rappresentante</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Countdown timer */}
        <Countdown />
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12">
            <div className="flex overflow-x-auto w-full no-scrollbar">
              <Link href="/">
                <a className="border-b-2 border-primary text-primary px-3 py-2 text-sm font-medium whitespace-nowrap" aria-current="page">
                  Prodotti
                </a>
              </Link>
              <Link href="/my-orders">
                <a className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-2 text-sm font-medium whitespace-nowrap">
                  I miei ordini
                </a>
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Product filter */}
          <div className="mb-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg font-medium text-gray-900">Prodotti disponibili</h2>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Cerca prodotti..." 
                  className="pl-9 pr-3 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar md:flex-wrap">
              {Object.values(ProductCategories).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className="rounded-full flex-shrink-0"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Product list */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Nessun prodotto trovato.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Cart modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center sm:text-left">Il tuo ordine</DialogTitle>
          </DialogHeader>
          <CartContents onClose={() => setCartOpen(false)} onOrderPlaced={handleOrderPlaced} />
        </DialogContent>
      </Dialog>
      
      {/* Order confirmation modal */}
      <Dialog open={orderConfirmation.open} onOpenChange={closeOrderConfirmation}>
        <DialogContent className="w-[95vw] max-w-md mx-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-center sm:text-left">Ordine confermato!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4 text-center sm:text-left">
              Il tuo ordine è stato confermato. Puoi ritirarlo durante l'intervallo.
            </p>
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex flex-col sm:flex-row">
                <div className="text-center sm:text-left sm:ml-3">
                  <h3 className="text-sm font-medium text-green-800">Dettagli ordine</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Numero ordine: <span className="font-medium">#{orderConfirmation.orderId}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center sm:justify-end">
            <Button onClick={closeOrderConfirmation} className="w-full sm:w-auto">
              Torna ai prodotti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
