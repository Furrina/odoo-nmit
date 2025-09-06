import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { User } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    description: string | null;
    priceCents: number;
    imageUrl: string | null;
    condition: string | null;
    categoryId: number | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
      data-testid={`card-product-${product.id}`}
    >
      <img 
        src={product.imageUrl || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
        alt={product.title}
        className="w-full h-48 object-cover rounded-t-lg"
        data-testid={`img-product-${product.id}`}
      />
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2" data-testid={`badge-category-${product.id}`}>
          Category
        </Badge>
        <h3 className="font-semibold text-foreground mb-1" data-testid={`text-title-${product.id}`}>
          {product.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
          {product.description || "No description available."}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
            ${(product.priceCents / 100).toFixed(2)}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-3 w-3 mr-1" />
            <span data-testid={`text-seller-${product.id}`}>Seller</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
