import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Leaf className="h-12 w-12 text-primary" data-testid="logo-icon" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground" data-testid="title-welcome">
              Welcome to EcoFinds
            </h2>
            <p className="mt-2 text-sm text-muted-foreground" data-testid="text-subtitle">
              Sustainable shopping for a better tomorrow
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

          {isLogin ? (
            <form className="space-y-4" data-testid="form-signin">
              <div>
                <Input 
                  type="email" 
                  placeholder="Email address"
                  required
                  data-testid="input-email"
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  placeholder="Password"
                  required
                  data-testid="input-password"
                />
              </div>
              
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
                type="button" 
                className="w-full"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signin"
              >
                Sign In
              </Button>
            </form>
          ) : (
            <form className="space-y-4" data-testid="form-signup">
              <div>
                <Input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  data-testid="input-fullname"
                />
              </div>
              <div>
                <Input 
                  type="email" 
                  placeholder="Email address"
                  required
                  data-testid="input-signup-email"
                />
              </div>
              <div>
                <Input 
                  type="text" 
                  placeholder="Username"
                  required
                  data-testid="input-username"
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  placeholder="Password"
                  required
                  data-testid="input-signup-password"
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  placeholder="Confirm Password"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required data-testid="checkbox-terms" />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the Terms and Conditions
                </label>
              </div>

              <Button 
                type="button" 
                className="w-full"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signup"
              >
                Create Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
