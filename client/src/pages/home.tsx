import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function Home() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false);
  const [, navigate] = useLocation();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Build query parameters for products
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append("categoryId", categoryId);
  if (search) queryParams.append("search", search);
  if (sortBy) queryParams.append("sortBy", sortBy);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products" + queryString],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar search={search} onSearchChange={setSearch} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4" data-testid="heading-hero">
              Find Your Perfect Pre-Loved Treasure
            </h1>
            <p className="text-xl text-primary-foreground opacity-90 mb-8" data-testid="text-hero-subtitle">
              Sustainable shopping that's good for you and the planet
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="secondary" 
                onClick={() => {
                  const mainSection = document.querySelector('[data-testid="heading-featured"]');
                  if (mainSection) {
                    mainSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                data-testid="button-start-shopping"
              >
                Start Shopping
              </Button>
              <Button 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => navigate("/add-product")}
                data-testid="button-sell-items"
              >
                Sell Your Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            variant={categoryId === "" ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategoryId("")}
            data-testid="button-category-all"
          >
            All
          </Button>
          {categories?.map((category: any) => (
            <Button 
              key={category.id}
              variant={categoryId === category.id.toString() ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setCategoryId(category.id.toString())}
              data-testid={`button-category-${category.name.toLowerCase()}`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-foreground" data-testid="heading-featured">Featured Items</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="group-by-category"
                checked={groupByCategory}
                onCheckedChange={setGroupByCategory}
                data-testid="switch-group-category"
              />
              <Label htmlFor="group-by-category" className="text-sm font-medium">
                Group by Category
              </Label>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort">
                <SelectValue placeholder="Sort by: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="price-low">Sort by: Price Low to High</SelectItem>
                <SelectItem value="price-high">Sort by: Price High to Low</SelectItem>
                <SelectItem value="popular">Sort by: Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ProductList products={products || []} isLoading={isLoading} groupByCategory={groupByCategory} />

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button size="lg" data-testid="button-load-more">
            Load More Items
          </Button>
        </div>
      </div>
    </div>
  );
}
