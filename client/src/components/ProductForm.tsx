import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { CloudUpload, Plus, X } from "lucide-react";

export default function ProductForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priceCents: "",
    condition: "good",
    location: "",
    imageUrl: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/products", {
        ...data,
        priceCents: Math.round(parseFloat(data.priceCents) * 100),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "Your product listing has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/products"] });
      navigate("/dashboard");
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
        description: "Failed to create product listing.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.priceCents) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-product">
      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Product Images</label>
        <div className="border-2 border-dashed border-input rounded-lg p-8 text-center">
          <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
          <p className="text-sm text-muted-foreground">Max 5 images, up to 10MB each</p>
          <Button type="button" className="mt-4" data-testid="button-choose-files">
            Choose Files
          </Button>
        </div>
        
        {/* Image Preview Placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="relative border border-border rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" 
              alt="Product preview" 
              className="w-full h-24 object-cover"
              data-testid="img-preview-sample"
            />
            <button 
              type="button"
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs"
              data-testid="button-remove-image"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 text-white text-xs p-1">
              Main
            </div>
          </div>
          <div className="border-2 border-dashed border-input rounded-lg h-24 flex items-center justify-center text-muted-foreground">
            <Plus className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Product Title*</label>
          <Input 
            type="text" 
            required 
            placeholder="Enter product title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            data-testid="input-title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category*</label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => handleChange("categoryId", value)}
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description*</label>
        <Textarea 
          rows={6} 
          required 
          placeholder="Describe your item in detail. Include condition, features, and any defects."
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          data-testid="textarea-description"
        />
        <p className="text-sm text-muted-foreground mt-1">Be honest about the condition to build trust with buyers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Price*</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-muted-foreground">$</span>
            <Input 
              type="number" 
              required 
              placeholder="0.00"
              min="0"
              step="0.01"
              className="pl-8"
              value={formData.priceCents}
              onChange={(e) => handleChange("priceCents", e.target.value)}
              data-testid="input-price"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Condition</label>
          <Select 
            value={formData.condition} 
            onValueChange={(value) => handleChange("condition", value)}
          >
            <SelectTrigger data-testid="select-condition">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Location</label>
          <Input 
            type="text" 
            placeholder="City, State"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            data-testid="input-location"
          />
        </div>
      </div>

      {/* Additional Options */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Additional Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="allow-offers" data-testid="checkbox-allow-offers" />
            <label htmlFor="allow-offers" className="text-sm text-foreground">
              Allow offers (buyers can negotiate price)
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="local-pickup" data-testid="checkbox-local-pickup" />
            <label htmlFor="local-pickup" className="text-sm text-foreground">
              Local pickup only
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="featured" data-testid="checkbox-featured" />
            <label htmlFor="featured" className="text-sm text-foreground">
              Featured listing ($5 fee for premium placement)
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6">
        <Button 
          type="submit" 
          className="sm:flex-1"
          disabled={createProductMutation.isPending}
          data-testid="button-publish"
        >
          {createProductMutation.isPending ? "Publishing..." : "Publish Listing"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          className="sm:flex-1"
          data-testid="button-save-draft"
        >
          Save as Draft
        </Button>
        <Button 
          type="button" 
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          data-testid="button-cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
