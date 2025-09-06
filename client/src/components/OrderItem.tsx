import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

interface OrderItemProps {
  order: {
    id: number;
    totalCents: number;
    status: string;
    createdAt: string;
    items: Array<{
      productId: number;
      qty: number;
      priceCents: number;
      product: {
        id: number;
        title: string;
        imageUrl: string | null;
      };
    }>;
  };
}

export default function OrderItem({ order }: OrderItemProps) {
  const [, navigate] = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card data-testid={`order-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground" data-testid={`text-order-number-${order.id}`}>
              Order #{order.id.toString().padStart(3, '0')}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Badge 
              className="bg-accent text-accent-foreground"
              data-testid={`badge-order-status-${order.id}`}
            >
              {order.status === "completed" ? "Delivered" : order.status}
            </Badge>
            <span className="text-lg font-bold text-primary" data-testid={`text-order-total-${order.id}`}>
              ${(order.totalCents / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center space-x-4" data-testid={`order-item-${order.id}-${item.productId}`}>
              <img 
                src={item.product.imageUrl || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=60"} 
                alt={item.product.title}
                className="w-16 h-12 object-cover rounded"
                data-testid={`img-order-item-${order.id}-${item.productId}`}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground" data-testid={`text-order-item-title-${order.id}-${item.productId}`}>
                  {item.product.title}
                </p>
                <p className="text-sm text-muted-foreground" data-testid={`text-order-item-details-${order.id}-${item.productId}`}>
                  Qty: {item.qty} • ${(item.priceCents / 100).toFixed(2)}
                </p>
              </div>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => navigate(`/product/${item.product.id}`)}
                data-testid={`button-view-item-${order.id}-${item.productId}`}
              >
                View Item
              </Button>
            </div>
          ))}
        </div>

        {/* Order Actions */}
        <div className="flex space-x-4 mt-4 pt-4 border-t border-border">
          {order.status === "completed" ? (
            <>
              <Button data-testid={`button-leave-review-${order.id}`}>
                Leave Review
              </Button>
              <Button variant="outline" data-testid={`button-view-details-${order.id}`}>
                View Details
              </Button>
            </>
          ) : (
            <>
              <Button data-testid={`button-track-order-${order.id}`}>
                Track Order
              </Button>
              <Button variant="outline" data-testid={`button-contact-sellers-${order.id}`}>
                Contact Sellers
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
