import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  
  const { login, isLoading, redirectPath } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Redirect to the originally requested page or home
        setLocation(redirectPath || '/');
      } else {
        setError(t({ 
          ko: "이메일 또는 비밀번호가 올바르지 않습니다.", 
          en: "Invalid email or password." 
        }));
      }
    } catch (error) {
      setError(t({ 
        ko: "로그인 중 오류가 발생했습니다.", 
        en: "An error occurred during login." 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t({ ko: "로그인", en: "Login" })}
          </CardTitle>
          <p className="text-muted-foreground">
            {t({ 
              ko: "계정에 로그인하여 서비스를 이용하세요", 
              en: "Sign in to your account to continue" 
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Demo credentials info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              {t({ ko: "테스트 계정:", en: "Demo Account:" })}
            </p>
            <div className="text-sm text-blue-800">
              <p>Email: test@example.com</p>
              <p>Password: password</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t({ ko: "이메일", en: "Email" })}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t({ ko: "example@email.com", en: "example@email.com" })}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {t({ ko: "비밀번호", en: "Password" })}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t({ ko: "비밀번호를 입력하세요", en: "Enter your password" })}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t({ ko: "로그인 중...", en: "Signing in..." })}
                </>
              ) : (
                t({ ko: "로그인", en: "Sign In" })
              )}
            </Button>
          </form>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t({ ko: "계정이 없으신가요?", en: "Don't have an account?" })}
              {" "}
              <Link href="/register" className="text-primary hover:underline">
                {t({ ko: "회원가입", en: "Sign Up" })}
              </Link>
            </p>
            
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {t({ ko: "비밀번호를 잊으셨나요?", en: "Forgot your password?" })}
            </Link>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t({ ko: "또는", en: "Or" })}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t({ ko: "Google로 계속하기", en: "Continue with Google" })}
            </Button>
            
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <div className="w-4 h-4 mr-2 bg-yellow-400 rounded text-black text-xs flex items-center justify-center font-bold">
                K
              </div>
              {t({ ko: "카카오로 계속하기", en: "Continue with Kakao" })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}