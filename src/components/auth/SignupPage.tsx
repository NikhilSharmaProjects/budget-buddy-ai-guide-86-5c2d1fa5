
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AuthContext } from "@/App";
import { Sparkles, User, KeyRound, Mail, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useContext(AuthContext);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup delay
    setTimeout(() => {
      signup(email, password);
      setIsLoading(false);
    }, 1000);
  };

  // Floating finance symbols for background animation
  const symbols = ['$', '€', '₿', '¥', '£', '%', '📊', '💰', '📈'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background to-muted">
      {/* Animated background symbols */}
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className="absolute text-2xl text-primary/10 animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-50px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {symbol}
        </div>
      ))}
      
      <Card className="w-full max-w-md animate-scale-in shadow-xl border-primary/20 backdrop-blur-md bg-card/80">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-budget-purple to-budget-purple-dark flex items-center justify-center text-white animate-pulse shadow-lg">
              <Sparkles size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>Join Budget Buddy to start your financial journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 transition-all duration-300 focus:border-budget-purple"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 transition-all duration-300 focus:border-budget-purple"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 transition-all duration-300 focus:border-budget-purple"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full game-button mt-2 group" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Sign Up"} 
              <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-budget-purple hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
