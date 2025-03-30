import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { getInitials, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { 
  ShoppingCart, 
  LogOut, 
  User, 
  FileText,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OrderWithItems = {
  id: number;
  userId: number;
  status: string;
  total: number;
  createdAt: string;
  orderDate: string;
  items: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    price: number;
    product?: {
      id: number;
      name: string;
      description: string;
      price: number;
    };
  }[];
};

export default function MyOrdersPage() {
  const { user, logoutMutation } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

  // Fetch orders
  const { data: orders, isLoading, isError, refetch } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOrderSelect = (order: OrderWithItems) => {
    setSelectedOrder(order);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> In attesa</span>;
      case "processing":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Package className="mr-1 h-3 w-3" /> In preparazione</span>;
      case "completed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Completato</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Annullato</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">Distribuzione merende</h1>
            <span className="ml-4 text-sm text-gray-500 hidden md:inline-block">
              Sistema di ordinazione merende
            </span>
          </div>
          
          <div className="flex items-center">
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
                <DropdownMenuItem onClick={() => {}}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>I miei ordini</span>
                </DropdownMenuItem>
                {user?.isRepresentative && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <User className="mr-2 h-4 w-4" />
                      <span>Pannello rappresentante</span>
                    </Link>
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
            <div className="flex">
              <Link href="/">
                <a className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-2 text-sm font-medium">
                  Prodotti
                </a>
              </Link>
              <Link href="/my-orders">
                <a className="border-b-2 border-primary text-primary px-3 py-2 text-sm font-medium" aria-current="page">
                  I miei ordini
                </a>
              </Link>
            </div>
            
            <div className="flex items-center">
              <Link href="/">
                <a className="relative p-2 text-gray-700 hover:text-primary">
                  <ShoppingCart className="h-5 w-5" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Orders list */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedOrder ? `Dettaglio ordine #${selectedOrder.id}` : "I miei ordini"}
            </h2>
            
            <div className="flex gap-2">
              {selectedOrder && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedOrder(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Torna agli ordini
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Aggiorna
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-red-500">Si è verificato un errore durante il caricamento degli ordini.</p>
            </div>
          ) : orders && orders.length > 0 ? (
            selectedOrder ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Ordine #{selectedOrder.id}</h3>
                      <p className="text-sm text-gray-500">
                        Effettuato il {formatDate(new Date(selectedOrder.createdAt))} alle {formatTime(new Date(selectedOrder.createdAt))}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Prodotti ordinati</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prodotto</TableHead>
                          <TableHead className="text-right">Quantità</TableHead>
                          <TableHead className="text-right">Prezzo unitario</TableHead>
                          <TableHead className="text-right">Totale</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product?.name || `Prodotto #${item.productId}`}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Totale:</span>
                        <span className="font-bold">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ordine #</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{formatDate(new Date(order.createdAt))}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleOrderSelect(order)}
                          >
                            Dettagli
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500">Non hai ancora effettuato ordini.</p>
              <Link href="/">
                <Button>Vai ai prodotti</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
