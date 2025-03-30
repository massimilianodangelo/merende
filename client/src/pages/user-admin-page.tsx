import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  UserPlus,
  AlertCircle,
  Search,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";

// Schema per la creazione di un nuovo utente
const createUserSchema = z.object({
  username: z.string().min(3, "Lo username deve avere almeno 3 caratteri").email("Deve essere un'email valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  classRoom: z.string(),
  isRepresentative: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  isUserAdmin: z.boolean().default(false),
}).refine((data) => {
  // Se l'utente è amministratore (isAdmin o isUserAdmin), la classe non è obbligatoria
  // altrimenti è obbligatorio selezionare una classe
  if (data.isAdmin || data.isUserAdmin) {
    return true;
  } else {
    return data.classRoom.length > 0;
  }
}, {
  message: "Seleziona una classe (obbligatorio per utenti non amministratori)",
  path: ["classRoom"]
});

// Schema per la modifica di un utente esistente
const updateUserSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri"),
  classRoom: z.string(),
  isRepresentative: z.boolean().default(false),
  isAdmin: z.boolean().default(false),
  isUserAdmin: z.boolean().default(false),
  password: z.string().optional(),
}).refine((data) => {
  // Se l'utente è amministratore (isAdmin o isUserAdmin), la classe non è obbligatoria
  // altrimenti è obbligatorio selezionare una classe
  if (data.isAdmin || data.isUserAdmin) {
    return true;
  } else {
    return data.classRoom.length > 0;
  }
}, {
  message: "Seleziona una classe (obbligatorio per utenti non amministratori)",
  path: ["classRoom"]
});

type UserWithoutPassword = Omit<User, "password">;

export default function UserAdminPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Recupera tutti gli utenti
  const { data: apiUsers, isLoading, refetch } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 10000,
    retry: 1
  });
  
  // Aggiunta manuale degli utenti amministratori
  const adminUsers: UserWithoutPassword[] = [
    {
      id: 1,
      username: "prova@amministratore.it",
      firstName: "Admin",
      lastName: "System",
      classRoom: "Admin",
      email: "prova@amministratore.it",
      isAdmin: true,
      isRepresentative: false,
      isUserAdmin: false
    },
    {
      id: 2,
      username: "gestione@amministratore.it",
      firstName: "Gestione",
      lastName: "Utenti",
      classRoom: "Admin",
      email: "gestione@amministratore.it",
      isAdmin: false,
      isRepresentative: false,
      isUserAdmin: true
    }
  ];
  
  // Combina gli utenti API con gli admin hardcoded
  const users = useMemo(() => {
    if (!apiUsers) return adminUsers;
    
    // Filtra gli admin esistenti dagli utenti API per evitare duplicati
    const filteredApiUsers = apiUsers.filter(user => 
      user.username !== "prova@amministratore.it" && 
      user.username !== "gestione@amministratore.it"
    );
    
    return [...adminUsers, ...filteredApiUsers];
  }, [apiUsers]);

  // Form per la creazione di un nuovo utente
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      classRoom: "",

      isRepresentative: false,
      isAdmin: false,
      isUserAdmin: false,
    },
  });

  // Form per la modifica di un utente esistente
  const editUserForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      classRoom: "",
      isRepresentative: false,
      isAdmin: false,
      isUserAdmin: false,
      password: "",
    },
  });

  // Mutation per creare un nuovo utente
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof createUserSchema>) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Utente creato",
        description: "L'utente è stato creato con successo.",
      });
      setIsCreateUserDialogOpen(false);
      createUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Non è stato possibile creare l'utente: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation per modificare un utente esistente
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: z.infer<typeof updateUserSchema> }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Utente aggiornato",
        description: "L'utente è stato aggiornato con successo.",
      });
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare l'utente: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Handler per la creazione di un nuovo utente
  const onCreateUserSubmit = (data: z.infer<typeof createUserSchema>) => {
    createUserMutation.mutate(data);
  };

  // Handler per la modifica di un utente esistente
  const onEditUserSubmit = (data: z.infer<typeof updateUserSchema>) => {
    if (!selectedUser) return;
    
    // Se la password è vuota, rimuovila dall'oggetto
    if (!data.password) {
      const { password, ...rest } = data;
      updateUserMutation.mutate({ id: selectedUser.id, userData: rest });
    } else {
      updateUserMutation.mutate({ id: selectedUser.id, userData: data });
    }
  };

  // Handler per aprire il dialog di modifica utente
  const handleEditUser = (user: UserWithoutPassword) => {
    setSelectedUser(user);
    editUserForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      classRoom: user.classRoom,
      isRepresentative: user.isRepresentative ?? false,
      isAdmin: user.isAdmin ?? false,
      isUserAdmin: user.isUserAdmin ?? false,
      password: "",
    });
    setIsEditUserDialogOpen(true);
  };

  // Mutation per eliminare un utente
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Utente eliminato",
        description: "L'utente è stato eliminato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Non è stato possibile eliminare l'utente: " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handler per eliminare un utente
  const handleDeleteUser = (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.")) {
      deleteUserMutation.mutate(id);
    }
  };
  
  // Filtra gli utenti in base alla ricerca
  const filteredUsers = users
    ? users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.classRoom.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">Distribuzione merende</h1>
            <span className="ml-4 text-sm text-gray-500 hidden md:inline-block">
              Gestione utenti
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Torna alla home
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Gestione Utenti</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Cerca utenti..."
                      className="pl-9 pr-3"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="icon"
                    title="Aggiorna"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuovo Utente
                  </Button>
                </div>
              </div>

              {/* Tabella utenti */}
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cognome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Classe</TableHead>
                        <TableHead>Ruoli</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>{user.lastName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.classRoom}</TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Amministratore
                                </span>
                              )}
                              {user.isUserAdmin && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Admin Utenti
                                </span>
                              )}
                              {user.isRepresentative && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Rappresentante
                                </span>
                              )}
                              {!user.isAdmin && !user.isRepresentative && !user.isUserAdmin && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Studente
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Modifica
                              </Button>
                              {/* Non mostrare il pulsante elimina per gli utenti admin principali */}
                              {user.id !== 1 && user.id !== 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Elimina
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun utente trovato</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery
                        ? "Nessun utente corrisponde ai criteri di ricerca."
                        : "Non ci sono ancora utenti nel sistema."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialog per creare un nuovo utente */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea nuovo utente</DialogTitle>
          </DialogHeader>
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email / Username</FormLabel>
                    <FormControl>
                      <Input placeholder="mario.rossi@scuola.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <FormField
                control={createUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo classe (mostrato solo per utenti non amministratori) */}
              {!(createUserForm.watch("isAdmin") || createUserForm.watch("isUserAdmin")) && (
                <FormField
                  control={createUserForm.control}
                  name="classRoom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />
              <div className="text-sm font-medium mb-2">Ruoli</div>

              <div className="space-y-4">
                <FormField
                  control={createUserForm.control}
                  name="isRepresentative"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Rappresentante di classe</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Amministratore (gestione ordini e prodotti)</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createUserForm.control}
                  name="isUserAdmin"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Amministratore utenti</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateUserDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creazione in corso...
                    </>
                  ) : (
                    "Crea utente"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog per modificare un utente esistente */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modifica utente: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editUserForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editUserForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campo classe (mostrato solo per utenti non amministratori) */}
              {!(editUserForm.watch("isAdmin") || editUserForm.watch("isUserAdmin")) && (
                <FormField
                  control={editUserForm.control}
                  name="classRoom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={editUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuova Password (lasciare vuoto per non modificare)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />
              <div className="text-sm font-medium mb-2">Ruoli</div>

              <div className="space-y-4">
                <FormField
                  control={editUserForm.control}
                  name="isRepresentative"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Rappresentante di classe</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editUserForm.control}
                  name="isAdmin"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Amministratore (gestione ordini e prodotti)</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editUserForm.control}
                  name="isUserAdmin"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Amministratore utenti</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditUserDialogOpen(false)}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aggiornamento in corso...
                    </>
                  ) : (
                    "Salva modifiche"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}