import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Package, Clock, RotateCcw, CheckCircle, Home } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@shared/schema";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Traduzioni degli stati degli ordini
const orderStatusTranslations = {
  [OrderStatus.PENDING]: "In attesa",
  [OrderStatus.PROCESSING]: "In preparazione",
  [OrderStatus.COMPLETED]: "Completati",
  [OrderStatus.CANCELLED]: "Annullati"
};

// Mappa dei colori per gli stati
const orderStatusColors = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800"
};

// Mappa delle icone per gli stati
const OrderStatusIcon = ({ status }: { status: string }) => {
  switch(status) {
    case OrderStatus.PENDING:
      return <Clock className="h-4 w-4 mr-1" />;
    case OrderStatus.PROCESSING:
      return <Package className="h-4 w-4 mr-1" />;
    case OrderStatus.COMPLETED:
      return <CheckCircle className="h-4 w-4 mr-1" />;
    case OrderStatus.CANCELLED:
      return <X className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

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
    product?: {
      id: number;
      name: string;
      description: string;
      price: number;
    };
  }[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    classRoom: string;
  };
};

export default function RepresentativePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(true);
  
  // Funzione per verificare se un ordine è di oggi
  const isOrderFromToday = useCallback((orderDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orderDateObj = new Date(orderDate);
    orderDateObj.setHours(0, 0, 0, 0);
    
    return orderDateObj.getTime() === today.getTime();
  }, []);

  // Fetch degli ordini per la classe del rappresentante
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/admin/orders/class", user?.classRoom, selectedDate],
    queryFn: async () => {
      console.log("Fetching orders for class:", user?.classRoom);
      // Utilizziamo una chiamata API diretta senza richiedere autenticazione
      const res = await fetch(`/api/admin/orders/class/${encodeURIComponent(user?.classRoom || "")}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error loading orders:", errorText);
        throw new Error("Errore nel caricamento degli ordini: " + errorText);
      }
      
      const data = await res.json();
      console.log("Received orders data:", data);
      return data;
    },
    enabled: !!user?.classRoom
  });

  // Fetch dei prodotti per visualizzare i dettagli degli ordini
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Errore nel caricamento dei prodotti");
      return res.json();
    }
  });

  // Elaborazione degli ordini con i dettagli dei prodotti
  const processedOrders = orders ? orders.map((order: OrderWithDetails) => {
    return {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: products?.find((p: any) => p.id === item.productId)
      }))
    };
  }) : [];

  // Raggruppa gli ordini per stato
  const ordersByStatus = processedOrders.reduce((acc: Record<string, OrderWithDetails[]>, order: OrderWithDetails) => {
    if (!acc[order.status]) {
      acc[order.status] = [];
    }
    acc[order.status].push(order);
    return acc;
  }, {});

  // Ottieni un conteggio dei prodotti da tutti gli ordini completati
  interface OrderItem {
    productId: number;
    quantity: number;
    product?: {
      name: string;
      id: number;
    };
  }

  interface ProductSummary {
    [key: string]: { 
      quantity: number; 
      name: string;
    };
  }

  const productSummary: ProductSummary = processedOrders
    .filter((order: OrderWithDetails) => 
      // Filtra per stato dell'ordine
      (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.PROCESSING) &&
      // Filtra per data se showOnlyToday è attivo
      (!showOnlyToday || isOrderFromToday(order.orderDate))
    )
    .flatMap((order: OrderWithDetails) => order.items)
    .reduce((acc: ProductSummary, item: OrderItem) => {
      if (!item.product) return acc;
      
      const key = item.productId.toString();
      if (!acc[key]) {
        acc[key] = {
          quantity: 0,
          name: item.product.name
        };
      }
      acc[key].quantity += item.quantity;
      return acc;
    }, {} as ProductSummary);

  // Gestisci la selezione di un ordine
  const handleOrderSelect = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Formatta la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  // Componente per il riepilogo
  const OrderSummary = () => (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo Prodotti</CardTitle>
        <CardDescription>
          Totale prodotti per gli ordini in lavorazione e completati
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prodotto</TableHead>
              <TableHead className="text-right">Quantità</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(productSummary).length > 0 ? (
              Object.entries(productSummary).map(entry => {
                const [id, summary] = entry;
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{summary.name}</TableCell>
                    <TableCell className="text-right">{summary.quantity}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                  Nessun prodotto da visualizzare
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Componente per i dettagli dell'ordine
  const OrderDetailsDialog = () => (
    <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dettagli Ordine #{selectedOrder?.id}</DialogTitle>
          <DialogDescription>
            Effettuato da {selectedOrder?.user?.firstName} {selectedOrder?.user?.lastName} - {selectedOrder?.user?.classRoom}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Stato Ordine</p>
              <Badge
                className={`${
                  selectedOrder && Object.prototype.hasOwnProperty.call(orderStatusColors, selectedOrder.status)
                    ? orderStatusColors[selectedOrder.status as keyof typeof orderStatusColors]
                    : "bg-gray-100 text-gray-800"
                } flex items-center`}
              >
                {selectedOrder && <OrderStatusIcon status={selectedOrder.status} />}
                {selectedOrder && Object.prototype.hasOwnProperty.call(orderStatusTranslations, selectedOrder.status)
                  ? orderStatusTranslations[selectedOrder.status as keyof typeof orderStatusTranslations]
                  : selectedOrder?.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Ordine</p>
              <p className="font-medium">
                {selectedOrder && formatDate(selectedOrder.orderDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Totale</p>
              <p className="font-medium">
                {selectedOrder && formatCurrency(selectedOrder.total)}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prodotto</TableHead>
                <TableHead className="text-center">Quantità</TableHead>
                <TableHead className="text-right">Prezzo</TableHead>
                <TableHead className="text-right">Totale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder?.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product?.name}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right py-4 font-semibold">
                  Totale Ordine:
                </td>
                <td className="text-right py-4 font-semibold">
                  {selectedOrder && formatCurrency(selectedOrder.total)}
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Componente per la lista degli ordini
  const OrdersList = ({ status }: { status: string }) => {
    // Assicurati che ordersByStatus contenga la proprietà status, se non c'è, inizializza come array vuoto
    const baseOrders = ordersByStatus[status] || [];
    
    // Filtra per data se showOnlyToday è attivo
    const filteredOrders = showOnlyToday 
      ? baseOrders.filter((order: OrderWithDetails) => isOrderFromToday(order.orderDate))
      : baseOrders;
    
    // Usiamo il valore sicuro per la traduzione
    const statusTranslation = Object.prototype.hasOwnProperty.call(orderStatusTranslations, status) 
      ? orderStatusTranslations[status as keyof typeof orderStatusTranslations]
      : status;
    
    return (
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order: OrderWithDetails) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Ordine #{order.id}
                  </CardTitle>
                  <Badge
                    className={`${
                      Object.prototype.hasOwnProperty.call(orderStatusColors, order.status)
                        ? orderStatusColors[order.status as keyof typeof orderStatusColors]
                        : "bg-gray-100 text-gray-800"
                    } flex items-center`}
                  >
                    <OrderStatusIcon status={order.status} />
                    {Object.prototype.hasOwnProperty.call(orderStatusTranslations, order.status)
                      ? orderStatusTranslations[order.status as keyof typeof orderStatusTranslations]
                      : order.status}
                  </Badge>
                </div>
                <CardDescription>
                  {order.user?.firstName} {order.user?.lastName} - {order.user?.classRoom}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Data</p>
                    <p>{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Totale</p>
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Prodotti</p>
                    <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOrderSelect(order)}
                >
                  Vedi Dettagli
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Nessun ordine {statusTranslation.toLowerCase()}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Ordini</h1>
          <p className="text-gray-500">
            Visualizza e gestisci gli ordini per la classe {user?.classRoom}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" size="icon" asChild>
            <Link href="/" className="flex items-center justify-center" title="Torna alla Home">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="show-only-today" className="text-sm">
                Mostra solo gli ordini di oggi
              </Label>
              <Switch
                id="show-only-today"
                checked={showOnlyToday}
                onCheckedChange={setShowOnlyToday}
              />
            </div>
          </div>
          
          <Tabs defaultValue={OrderStatus.PENDING} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value={OrderStatus.PENDING}>
                In attesa
              </TabsTrigger>
              <TabsTrigger value={OrderStatus.COMPLETED}>
                Completati
              </TabsTrigger>
            </TabsList>

            <TabsContent value={OrderStatus.PENDING}>
              <OrdersList status={OrderStatus.PENDING} />
            </TabsContent>
            
            <TabsContent value={OrderStatus.COMPLETED}>
              <OrdersList status={OrderStatus.COMPLETED} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <OrderSummary />
        </div>
      </div>

      {selectedOrder && <OrderDetailsDialog />}
    </div>
  );
}