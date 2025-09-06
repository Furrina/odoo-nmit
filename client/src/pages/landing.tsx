import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (isLogin) {
          await refetch();
          window.location.href = "/";
        } else {
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: "",
            firstName: "",
            lastName: "",
            username: "",
            confirmPassword: "",
          });
          setError("");
        }
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="landing-background min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Leaf className="h-12 w-12 text-primary" data-testid="logo-icon" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground" data-testid="title-welcome">
              Welcome to EcoFinds
            </h2>
            <p className="mt-2 text-sm text-muted-foreground" data-testid="text-subtitle">
             
            </p>
          </div>
          
          {/* Login/Register Tabs */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button 
              className={`flex-1 py-2 px-4 rounded-md font-medium ${isLogin ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setIsLogin(true)}
              data-testid="button-signin-tab"
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2 px-4 rounded-md font-medium ${!isLogin ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setIsLogin(false)}
              data-testid="button-signup-tab"
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-signin">
              <Input 
                type="email" 
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                data-testid="input-email"
              />
              <Input 
                type="password" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                data-testid="input-password"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" data-testid="checkbox-remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-primary hover:opacity-80 text-sm" data-testid="link-forgot-password">
                  Forgot password?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-signin"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-signup">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="text" 
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  data-testid="input-firstname"
                />
                <Input 
                  type="text" 
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  data-testid="input-lastname"
                />
              </div>
              <Input 
                type="email" 
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                data-testid="input-signup-email"
              />
              <Input 
                type="text" 
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                data-testid="input-username"
              />
              <Input 
                type="password" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                data-testid="input-signup-password"
              />
              <Input 
                type="password" 
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                data-testid="input-confirm-password"
              />
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required data-testid="checkbox-terms" />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the Terms and Conditions
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
