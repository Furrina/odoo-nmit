import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/Navbar";
import { useLocation } from "wouter";
import { ArrowLeft, Package, Calendar, DollarSign } from "lucide-react";

export default function TransactionHistory() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground" data-testid="heading-transaction-history">
              Transaction History
            </h1>
          </div>
        </div>

        {/* Orders List */}
        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2" data-testid="heading-no-orders">
                No orders yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Your purchase history will appear here once you make your first order.
              </p>
              <Button onClick={() => navigate("/")} data-testid="button-start-shopping">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="border border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-order-id-${order.id}`}>
                        Order #{order.id}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span data-testid={`text-order-date-${order.id}`}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={order.status === "completed" ? "default" : "secondary"}
                        data-testid={`badge-order-status-${order.id}`}
                      >
                        {order.status}
                      </Badge>
                      <div className="flex items-center text-lg font-bold text-primary mt-2">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span data-testid={`text-order-total-${order.id}`}>
                          ${(order.totalCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Items Purchased:</h4>
                    {order.items && order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground" data-testid={`text-item-name-${order.id}-${index}`}>
                              {item.product?.title || `Product #${item.productId}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.qty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground" data-testid={`text-item-price-${order.id}-${index}`}>
                            ${(item.priceCents / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total: ${((item.priceCents * item.qty) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
