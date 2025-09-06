import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Heart, Share2, Star, User, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const productId = params?.id ? parseInt(params.id) : null;

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", {
        productId: productId,
        qty: 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
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
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    },
  });

  if (!match || !productId) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
            <Button onClick={() => navigate("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <button 
            onClick={() => navigate("/")} 
            className="text-primary hover:underline flex items-center"
            data-testid="link-breadcrumb-home"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Home
          </button>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground" data-testid="text-breadcrumb-product">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <img 
              src={product.imageUrl || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
              alt={product.title}
              className="w-full rounded-lg shadow-md mb-4"
              data-testid="img-product-main"
            />
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" data-testid="badge-category">Electronics</Badge>
              {product.status === "active" && (
                <Badge className="bg-accent text-accent-foreground" data-testid="badge-featured">Featured</Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="heading-product-title">
              {product.title}
            </h1>
            
            <div className="flex items-center mb-4">
              <span className="text-3xl font-bold text-primary" data-testid="text-price">
                ${(product.priceCents / 100).toFixed(2)}
              </span>
            </div>

            {/* Seller Info */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-foreground" data-testid="text-seller-name">Seller</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      4.8 (127 reviews) · Joined 2 years ago
                    </div>
                  </div>
                  <Button variant="outline" className="ml-auto" data-testid="button-contact-seller">
                    Contact Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Condition & Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold text-foreground">Condition</div>
                  <div className="text-accent font-medium capitalize" data-testid="text-condition">
                    {product.condition || "Good"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold text-foreground">Location</div>
                  <div className="text-muted-foreground" data-testid="text-location">
                    {product.location || "Not specified"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex-1" data-testid="button-save-later">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button variant="outline" className="flex-1" data-testid="button-share">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
