import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    productId: number;
    qty: number;
    product: {
      id: number;
      title: string;
      priceCents: number;
      imageUrl: string | null;
    };
  };
  onUpdate: () => void;
}

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: number; qty: number }) => {
      await apiRequest("PATCH", `/api/cart/${productId}`, { qty });
    },
    onSuccess: () => {
      onUpdate();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/cart/${productId}`, {});
    },
    onSuccess: () => {
      onUpdate();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (newQty: number) => {
    if (newQty <= 0) {
      removeItemMutation.mutate(item.productId);
    } else {
      updateQuantityMutation.mutate({ productId: item.productId, qty: newQty });
    }
  };

  return (
    <Card data-testid={`cart-item-${item.productId}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <img 
            src={item.product.imageUrl || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=80"} 
            alt={item.product.title}
            className="w-20 h-16 object-cover rounded"
            data-testid={`img-cart-item-${item.productId}`}
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground" data-testid={`text-cart-item-title-${item.productId}`}>
              {item.product.title}
            </h3>
            <p className="text-sm text-muted-foreground">Sold by Seller</p>
            <p className="text-lg font-bold text-primary mt-1" data-testid={`text-cart-item-price-${item.productId}`}>
              ${(item.product.priceCents / 100).toFixed(2)}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button 
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => handleQuantityChange(item.qty - 1)}
              disabled={updateQuantityMutation.isPending}
              data-testid={`button-decrease-qty-${item.productId}`}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium" data-testid={`text-cart-qty-${item.productId}`}>
              {item.qty}
            </span>
            <Button 
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => handleQuantityChange(item.qty + 1)}
              disabled={updateQuantityMutation.isPending}
              data-testid={`button-increase-qty-${item.productId}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button 
            size="sm"
            variant="ghost"
            onClick={() => removeItemMutation.mutate(item.productId)}
            disabled={removeItemMutation.isPending}
            data-testid={`button-remove-${item.productId}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
