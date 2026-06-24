import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AlgonomyLogo from '@/components/AlgonomyLogo';

const LogoBranding = () => (
  <div className="flex flex-col items-center gap-3">
    <AlgonomyLogo className="h-12" />
    <span className="text-sm font-medium tracking-wide text-muted-foreground">Retailer-Supplier OS</span>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store login state
    sessionStorage.setItem('algonomy_logged_in', 'true');
    sessionStorage.setItem('algonomy_user', username);
    sessionStorage.removeItem('algonomy_workspace');
    
    setIsLoading(false);
    navigate('/landing');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI1MmIiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <Card className="w-full max-w-md relative z-10 bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <LogoBranding />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to continue
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">


          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              Demo mode: Enter any username and password to continue
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-slate-500">
        © 2024 Algonomy. All rights reserved.
      </div>
    </div>
  );
};

export default Login;
