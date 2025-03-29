import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username è richiesto"),
  password: z.string().min(1, "Password è richiesta"),
  rememberMe: z.boolean().optional(),
});

// Registration form schema
const registerSchema = z.object({
  firstName: z.string().min(1, "Nome è richiesto"),
  lastName: z.string().min(1, "Cognome è richiesto"),
  classRoom: z.string().min(1, "Classe è richiesta"),
  username: z.string().min(1, "Username è richiesto").email("Inserisci un'email valida"),
  password: z.string().min(6, "La password deve contenere almeno 6 caratteri"),
  confirmPassword: z.string().min(1, "Conferma password è richiesta"),
  terms: z.boolean().refine((val) => val === true, {
    message: "Devi accettare i termini e le condizioni",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isRepresentative, setIsRepresentative] = useState(false);
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      classRoom: "",
      username: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });
  
  // Handle login submission
  function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  }
  
  // Handle registration submission
  function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    registerMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      classRoom: data.classRoom,
      username: data.username,
      email: data.username, // Usiamo l'username (email) come email
      password: data.password,
      isRepresentative: isRepresentative
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        <Card className="w-full">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-800 mb-2">ScuolaMerenda</h1>
                  <p className="text-gray-600">Accedi per ordinare la tua merenda</p>
                </div>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="esempio@scuola.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
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
                    
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remember-me"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="remember-me"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Ricordami
                            </label>
                          </div>
                        )}
                      />
                      
                      <a href="#" className="text-sm font-medium text-primary hover:text-indigo-500">
                        Password dimenticata?
                      </a>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Accesso in corso...
                        </>
                      ) : (
                        "Accedi"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        Oppure
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("register")}>
                      Registrati
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-800 mb-2">Registrati a ScuolaMerenda</h1>
                  <p className="text-gray-600">Crea un account per ordinare la tua merenda</p>
                </div>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
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
                        control={registerForm.control}
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
                      control={registerForm.control}
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
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="esempio@scuola.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
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
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conferma Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Accetto i termini e le condizioni
                          </label>
                          <FormMessage />
                        </div>
                      )}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isRepresentative"
                        checked={isRepresentative}
                        onCheckedChange={(checked) => setIsRepresentative(!!checked)}
                      />
                      <label
                        htmlFor="isRepresentative"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Sono un rappresentante di classe
                      </label>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registrazione in corso...
                        </>
                      ) : (
                        "Registrati"
                      )}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Hai già un account?{" "}
                    <button
                      className="font-medium text-primary hover:text-indigo-500"
                      onClick={() => setActiveTab("login")}
                    >
                      Accedi
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="hidden md:block">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">ScuolaMerenda</h2>
            <p className="text-lg text-gray-600 mb-6">
              Semplifica l'ordine della merenda a scuola
            </p>
            
            <div className="space-y-4 text-left bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">Come funziona:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm font-medium mr-3">1</span>
                  <span>Registrati con il tuo account.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm font-medium mr-3">2</span>
                  <span>Sfoglia il catalogo di prodotti disponibili.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm font-medium mr-3">3</span>
                  <span>Aggiungi prodotti al carrello e conferma l'ordine.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm font-medium mr-3">4</span>
                  <span>Ritira la tua merenda durante l'intervallo.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
