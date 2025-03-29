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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between">
          <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
          <p className="text-base font-medium text-primary">{formatCurrency(product.price)}</p>
        </div>
        <p className="mt-1 text-sm text-gray-500 min-h-[40px]">{product.description}</p>
        <div className="mt-4 flex justify-between items-end">
          <span className={`text-xs font-medium ${product.available ? 'text-green-600' : 'text-red-600'}`}>
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
            className={`${isAdding ? 'bg-primary text-white' : ''} ${!product.available ? 'opacity-50 cursor-not-allowed' : ''}`}
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
