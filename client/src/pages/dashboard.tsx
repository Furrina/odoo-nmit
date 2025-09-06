import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { useLocation } from "wouter";
import { Plus, User, Edit, Trash2 } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const { data: userProducts, isLoading, error } = useQuery({
    queryKey: ["/api/user/products"],
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
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
  }, [error, toast]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { username: string; bio: string }) => {
      await apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Your product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
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
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ username, bio });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar search={search} onSearchChange={setSearch} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-dashboard">Dashboard</h1>
          <Button onClick={() => navigate("/add-product")} className="btn-banner-white" data-testid="button-add-listing">
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="heading-profile">Profile</h2>
                
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                        data-testid="img-profile-picture"
                      />
                    ) : (
                      <User className="h-8 w-8" data-testid="icon-default-avatar" />
                    )}
                  </div>
                  <button className="text-primary hover:underline text-sm" data-testid="button-change-photo">
                    Change Photo
                  </button>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                    <Input 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      data-testid="input-username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <Input 
                      value={user?.email || ""}
                      disabled 
                      className="bg-muted text-muted-foreground"
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                    <Textarea 
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself..."
                      data-testid="textarea-bio"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-update-profile"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="heading-stats">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Listed</span>
                    <span className="font-semibold text-foreground" data-testid="text-items-listed">
                      {userProducts?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Sold</span>
                    <span className="font-semibold text-foreground" data-testid="text-items-sold">
                      {userProducts?.filter((p: any) => p.status === "sold").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold text-foreground" data-testid="text-member-since">
                      {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2024"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Listings Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground" data-testid="heading-my-listings">My Listings</h2>
                </div>

                {!userProducts || userProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="heading-no-listings">
                      No listings yet
                    </h3>
                    <p className="text-muted-foreground mb-4">Start selling by creating your first listing</p>
                    <Button onClick={() => navigate("/add-product")} className="btn-banner-white" data-testid="button-create-first-listing">
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProducts.map((product: any) => (
                      <Card key={product.id} className="border border-border">
                        <CardContent className="p-4">
                          <img 
                            src={product.imageUrl || "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"} 
                            alt={product.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                            data-testid={`img-product-${product.id}`}
                          />
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-foreground" data-testid={`text-product-title-${product.id}`}>
                                {product.title}
                              </h3>
                              <Badge 
                                variant={product.status === "active" ? "default" : "secondary"}
                                data-testid={`badge-status-${product.id}`}
                              >
                                {product.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-product-description-${product.id}`}>
                              {product.description}
                            </p>
                            <p className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                              ${(product.priceCents / 100).toFixed(2)}
                            </p>
                            <div className="flex space-x-2 mt-3">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                onClick={() => navigate(`/add-product?id=${product.id}`)}
                                data-testid={`button-edit-${product.id}`}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                                disabled={deleteProductMutation.isPending}
                                data-testid={`button-delete-${product.id}`}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
