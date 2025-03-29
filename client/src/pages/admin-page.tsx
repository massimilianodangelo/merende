import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, formatCurrency } from "@/lib/utils";
import { 
  LogOut, 
  Loader2,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Product as ProductType,
  ProductCategories,
  OrderStatus
} from "@shared/schema";

// Tipo per gli ordini con dettagli
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

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<ProductType[]>({
    queryKey: ["/api/products"],
  });

  // Fetch all orders (for admin)
  const { data: orders, isLoading: isLoadingOrders } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/admin/orders"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Calculate stats if data is available
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc, order) => acc + order.total, 0) || 0;
  const pendingOrders = orders?.filter(order => order.status === OrderStatus.PENDING).length || 0;
  const completedOrders = orders?.filter(order => order.status === OrderStatus.COMPLETED).length || 0;
  
  // Group orders by class
  const ordersByClass = orders?.reduce((acc, order) => {
    const classRoom = order.user.classRoom;
    if (!acc[classRoom]) {
      acc[classRoom] = [];
    }
    acc[classRoom].push(order);
    return acc;
  }, {} as Record<string, OrderWithDetails[]>) || {};
  
  // Calculate total products ordered
  const productCounts = orders?.reduce((acc, order) => {
    order.items.forEach(item => {
      const productId = item.productId;
      if (!acc[productId]) {
        acc[productId] = 0;
      }
      acc[productId] += item.quantity;
    });
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">
              ScuolaMerenda
            </h1>
            <span className="text-sm text-gray-500">Pannello Amministratore</span>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {user && <span>{getInitials(user.firstName, user.lastName)}</span>}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span>Ordini</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center justify-center">
              <Package className="h-4 w-4 mr-2" />
              <span>Prodotti</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Classi</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Dashboard content */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <CardTitle className="text-sm font-medium text-gray-500">Ricavi Totali</CardTitle>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Riepilogo Prodotti Ordinati</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProducts || isLoadingOrders ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prodotto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead className="text-right">Quantità Ordinata</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-right">{productCounts[product.id] || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders content */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tutti gli Ordini</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Totale</TableHead>
                        <TableHead>Data Ordine</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map(order => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                          <TableCell>{order.user.classRoom}</TableCell>
                          <TableCell>
                            {order.status === OrderStatus.PENDING && <span className="text-yellow-600">In Attesa</span>}
                            {order.status === OrderStatus.PROCESSING && <span className="text-blue-600">In Preparazione</span>}
                            {order.status === OrderStatus.COMPLETED && <span className="text-green-600">Completato</span>}
                            {order.status === OrderStatus.CANCELLED && <span className="text-red-600">Annullato</span>}
                          </TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" /> Gestisci
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products content */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestione Prodotti</CardTitle>
                <Button size="sm">
                  <Package className="h-4 w-4 mr-1" /> Nuovo Prodotto
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>Disponibilità</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">#{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            {product.available ? (
                              <span className="text-green-600">Disponibile</span>
                            ) : (
                              <span className="text-red-600">Non disponibile</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" /> Modifica
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes content */}
          <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ordini per Classe</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : Object.keys(ordersByClass).length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Nessun ordine trovato
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(ordersByClass).map(([classRoom, classOrders]) => (
                      <div key={classRoom} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">Classe {classRoom}</h3>
                        <div className="text-sm text-gray-500 mb-4">
                          {classOrders.length} ordini - Totale: {formatCurrency(
                            classOrders.reduce((sum, order) => sum + order.total, 0)
                          )}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Stato</TableHead>
                              <TableHead>Totale</TableHead>
                              <TableHead className="text-right">Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classOrders.map(order => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{order.user.firstName} {order.user.lastName}</TableCell>
                                <TableCell>
                                  {order.status === OrderStatus.PENDING && <span className="text-yellow-600">In Attesa</span>}
                                  {order.status === OrderStatus.PROCESSING && <span className="text-blue-600">In Preparazione</span>}
                                  {order.status === OrderStatus.COMPLETED && <span className="text-green-600">Completato</span>}
                                  {order.status === OrderStatus.CANCELLED && <span className="text-red-600">Annullato</span>}
                                </TableCell>
                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                <TableCell className="text-right">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}