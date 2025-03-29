import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { getInitials, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { 
  ShoppingCart, 
  LogOut, 
  User, 
  FileText,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Clipboard,
  Filter
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderWithDetails = {
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
  }[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    classRoom: string;
  };
};

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch admin orders (filtered by class if classFilter is set)
  const { data: orders, isLoading, isError, refetch } = useQuery<OrderWithDetails[]>({
    queryKey: classFilter ? [`/api/admin/orders/class/${classFilter}`] : ["/api/admin/orders"],
    queryFn: async () => {
      const endpoint = classFilter 
        ? `/api/admin/orders/class/${classFilter}`
        : "/api/admin/orders";
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch admin orders");
      return res.json();
    }
  });

  // Mutation to update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Stato aggiornato",
        description: "Lo stato dell'ordine è stato aggiornato con successo.",
      });
      // Invalida tutte le query relative agli ordini, inclusi quelli filtrati per classe
      if (classFilter) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/orders/class/${classFilter}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare lo stato dell'ordine.",
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleOrderSelect = (order: OrderWithDetails) => {
    setSelectedOrder(order);
  };

  const handleUpdateStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> In attesa</span>;
      case "processing":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" /> In preparazione</span>;
      case "completed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Completato</span>;
      case "cancelled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="mr-1 h-3 w-3" /> Annullato</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  // Filter orders based on status
  const filteredOrders = orders ? 
    statusFilter === "all" 
      ? orders 
      : orders.filter(order => order.status === statusFilter)
    : [];
    
  // Calculate summary stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = filteredOrders.filter(order => order.status === "pending").length;
  const completedOrders = filteredOrders.filter(order => order.status === "completed").length;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">ScuolaMerenda</h1>
            <span className="ml-4 text-sm text-gray-500 hidden md:inline-block">
              Pannello rappresentante
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
                <DropdownMenuItem asChild>
                  <Link href="/my-orders">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>I miei ordini</span>
                  </Link>
                </DropdownMenuItem>
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
                <a className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-2 text-sm font-medium">
                  I miei ordini
                </a>
              </Link>
              <Link href="/admin">
                <a className="border-b-2 border-primary text-primary px-3 py-2 text-sm font-medium" aria-current="page">
                  Pannello rappresentante
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Dashboard summary */}
          {!selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Ordini Totali</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Totale Ricavi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Ordini in Attesa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Ordini Completati</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedOrders}</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Orders management */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedOrder ? `Gestione ordine #${selectedOrder.id}` : "Gestione ordini di oggi"}
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
              
              {!selectedOrder && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtra per stato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti gli stati</SelectItem>
                        <SelectItem value="pending">In attesa</SelectItem>
                        <SelectItem value="processing">In preparazione</SelectItem>
                        <SelectItem value="completed">Completati</SelectItem>
                        <SelectItem value="cancelled">Annullati</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center">
                    <Clipboard className="h-4 w-4 mr-2 text-gray-500" />
                    <Select 
                      value={classFilter || ""} 
                      onValueChange={(value) => setClassFilter(value === "" ? null : value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtra per classe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le classi</SelectItem>
                        <SelectItem value="1A">1A</SelectItem>
                        <SelectItem value="1B">1B</SelectItem>
                        <SelectItem value="2A">2A</SelectItem>
                        <SelectItem value="2B">2B</SelectItem>
                        <SelectItem value="3A">3A</SelectItem>
                        <SelectItem value="3B">3B</SelectItem>
                        <SelectItem value="4A">4A</SelectItem>
                        <SelectItem value="4B">4B</SelectItem>
                        <SelectItem value="5A">5A</SelectItem>
                        <SelectItem value="5B">5B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
          ) : filteredOrders.length > 0 ? (
            selectedOrder ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Ordine #{selectedOrder.id}</h3>
                      <p className="text-sm text-gray-500">
                        Cliente: {selectedOrder.user.firstName} {selectedOrder.user.lastName} - Classe: {selectedOrder.user.classRoom}
                      </p>
                      <p className="text-sm text-gray-500">
                        Effettuato il {formatDate(new Date(selectedOrder.createdAt))} alle {formatTime(new Date(selectedOrder.createdAt))}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div>
                        <Select 
                          defaultValue={selectedOrder.status}
                          onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Aggiorna stato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">In attesa</SelectItem>
                            <SelectItem value="processing">In preparazione</SelectItem>
                            <SelectItem value="completed">Completato</SelectItem>
                            <SelectItem value="cancelled">Annullato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Prodotti ordinati</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prodotto ID</TableHead>
                          <TableHead className="text-right">Quantità</TableHead>
                          <TableHead className="text-right">Prezzo unitario</TableHead>
                          <TableHead className="text-right">Totale</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>Prodotto #{item.productId}</TableCell>
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
                      <TableHead>Cliente</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                        <TableCell>{order.user.classRoom}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOrderSelect(order)}
                            >
                              Dettagli
                            </Button>
                            
                            <Select 
                              defaultValue={order.status}
                              onValueChange={(value) => handleUpdateStatus(order.id, value)}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue placeholder="Stato" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In attesa</SelectItem>
                                <SelectItem value="processing">In preparazione</SelectItem>
                                <SelectItem value="completed">Completato</SelectItem>
                                <SelectItem value="cancelled">Annullato</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <p className="text-gray-500">Non ci sono ordini da gestire per oggi.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
