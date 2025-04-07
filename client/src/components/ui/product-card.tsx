import { Button } from "@/components/ui/button";
import { PlusIcon, CheckIcon, XIcon } from "lucide-react";
import { Product } from "@shared/schema";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product.available) return;
    
    addToCart(product);
    setIsAdding(true);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-1">
          <h3 className="text-base font-medium text-gray-900 truncate max-w-[70%]">{product.name}</h3>
          <p className="text-base font-medium text-primary whitespace-nowrap">{formatCurrency(product.price)}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 flex-1">{product.description}</p>
        <div className="mt-4 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2">
          <span className={`text-xs font-medium whitespace-nowrap ${product.available ? 'text-green-600' : 'text-red-600'}`}>
            {product.available ? (
              <>
                <CheckIcon className="inline-block h-3 w-3 mr-1" /> Disponibile
              </>
            ) : (
              <>
                <XIcon className="inline-block h-3 w-3 mr-1" /> Esaurito
              </>
            )}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddToCart}
            disabled={!product.available}
            className={`${isAdding ? 'bg-primary text-white' : ''} ${!product.available ? 'opacity-50 cursor-not-allowed' : ''} w-full sm:w-auto mt-1 sm:mt-0`}
          >
            {isAdding ? (
              <>
                <CheckIcon className="h-4 w-4 mr-1" /> Aggiunto
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-1" /> Aggiungi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
