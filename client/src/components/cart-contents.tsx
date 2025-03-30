import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isBeforeOrderDeadline } from "@/lib/utils";

interface CartContentsProps {
  onClose: () => void;
  onOrderPlaced?: (orderId: number) => void;
}

export function CartContents({ onClose, onOrderPlaced }: CartContentsProps) {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Gli ordini sono sempre disponibili
  const beforeDeadline = true;
  
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/orders", {
        userId: user?.id,
        total,
        items,
        orderDate: new Date()
      });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Ordine confermato!",
        description: "Il tuo ordine è stato registrato con successo.",
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (onOrderPlaced) {
        onOrderPlaced(data.id);
      }
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione dell'ordine.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const handlePlaceOrder = () => {
    // Rimuove controllo deadline, ordini sempre disponibili
    
    if (items.length === 0) {
      toast({
        title: "Carrello vuoto",
        description: "Aggiungi prodotti al carrello per procedere con l'ordine.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    createOrderMutation.mutate();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Il carrello è vuoto.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.product.id} className="py-4 flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.product.price)}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2 text-red-500 hover:text-red-700"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex justify-between font-medium mb-4">
          <span>Totale:</span>
          <span>{formatCurrency(total)}</span>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Continua acquisti
          </Button>
          
          <Button
            className="flex-1"
            onClick={handlePlaceOrder}
            disabled={items.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Elaborazione..." : "Conferma ordine"}
          </Button>
        </div>
      </div>
    </div>
  );
}
