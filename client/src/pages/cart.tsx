import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/Navbar";
import CartItem from "@/components/CartItem";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Create Razorpay order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("POST", "/api/payment/create-order", { amount });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create payment order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return await apiRequest("POST", "/api/payment/verify", paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Payment successful!",
        description: "Your order has been placed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      navigate("/orders");
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: "Payment verification failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle payment with Razorpay
  const handlePayment = async () => {
    if (!cartData || !(cartData as any).items || (cartData as any).items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty.",
        variant: "destructive",
      });
      return;
    }

    const items = (cartData as any).items;
    const subtotal = items.reduce((total: number, item: any) => 
      total + (item.product.priceCents * item.qty), 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    try {
      // Create Razorpay order
      const orderData = await createOrderMutation.mutateAsync(total);
      
      if (!window.Razorpay) {
        toast({
          title: "Error",
          description: "Razorpay is not loaded. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Replace with your actual Razorpay key
        amount: total,
        currency: "INR",
        name: "EcoFinds",
        description: "Payment for your order",
        order_id: (orderData as any).id,
        handler: async function (response: any) {
          try {
            await verifyPaymentMutation.mutateAsync({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          } catch (error) {
            console.error("Payment verification failed:", error);
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#22c55e"
        },
        modal: {
          ondismiss: function() {
            toast({
              title: "Payment cancelled",
              description: "Payment was cancelled by user.",
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = (cartData as any)?.items || [];
  const subtotal = items.reduce((total: number, item: any) => 
    total + (item.product.priceCents * item.qty), 0);
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="heading-cart">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground mb-2" data-testid="heading-empty-cart">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate("/")} data-testid="button-browse-products">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item: any) => (
                  <CartItem 
                    key={item.productId} 
                    item={item}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/cart"] })}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="heading-order-summary">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span className="font-medium" data-testid="text-subtotal">
                        ${(subtotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-accent" data-testid="text-shipping">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium" data-testid="text-tax">${(tax / 100).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary" data-testid="text-total">
                          ${(total / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mb-4" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={createOrderMutation.isPending || verifyPaymentMutation.isPending}
                    data-testid="button-checkout"
                  >
                    {createOrderMutation.isPending || verifyPaymentMutation.isPending ? "Processing..." : "Pay with Razorpay"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate("/")}
                    data-testid="button-continue-shopping"
                  >
                    Continue Shopping
                  </Button>

                  {/* Security Info */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-accent mr-2" />
                      Secure checkout powered by Razorpay
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
