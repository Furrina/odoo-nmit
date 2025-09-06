import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Leaf, Search, ShoppingCart, LogOut, User } from "lucide-react";

interface NavbarProps {
  search: string;
  onSearchChange: (search: string) => void;
}

export default function Navbar({ search, onSearchChange }: NavbarProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartData } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartItemCount = cartData?.items?.reduce((total: number, item: any) => total + item.qty, 0) || 0;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Search */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate("/")}
              className="flex-shrink-0 flex items-center"
              data-testid="button-logo"
            >
              <Leaf className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl text-foreground">EcoFinds</span>
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-80 pl-10"
                  data-testid="input-search"
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Right side - Cart, User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                className="relative"
                onClick={() => navigate("/cart")}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="text-cart-count">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => navigate("/dashboard")}
                  data-testid="button-dashboard"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10"
              data-testid="input-search-mobile"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </nav>
  );
}
