import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [secureLogin, setSecureLogin] = useState(false);
  const [error, setError] = useState("");

  const { setUser, redirectPath } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.username,
        password: formData.password,
      });

      if (!error && data.user) {
        const mappedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email!,
          username: data.user.user_metadata?.username || data.user.email!,
          email: data.user.email!,
          points: 0,
          coupons: 0,
          totalOrders: 0,
          totalSpent: 0,
          isAdmin: data.user.user_metadata?.isAdmin || false,
          firstName: data.user.user_metadata?.first_name || "",
          lastName: data.user.user_metadata?.last_name || "",
        };
        setUser(mappedUser);
        localStorage.setItem("user", JSON.stringify(mappedUser));
        setTimeout(() => {
          setLocation(redirectPath || "/");
        }, 100);
      } else {
        setError(
          t({
            ko: "아이디 또는 비밀번호가 잘못되었습니다.",
            en: "Invalid username or password.",
          }),
        );
      }
    } catch (err) {
      setError(
        t({
          ko: "로그인 중 오류가 발생했습니다.",
          en: "An error occurred during login.",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnsLogin = (provider: "kakao" | "naver") => {
    console.log(`${provider} 로그인 시도`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t({ ko: "로그인", en: "Login", ja: "ログイン", zh: "登录" })}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 bg-white dark:bg-[#1a1a1a]">
            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="user-id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t({
                    ko: "아이디",
                    en: "Username",
                    ja: "ユーザー名",
                    zh: "用户名",
                  })}
                </label>
                <input
                  id="user-id"
                  name="user-id"
                  type="text"
                  placeholder={t({
                    ko: "아이디를 입력하세요",
                    en: "Enter your username",
                    ja: "ユーザー名を入力してください",
                    zh: "请输入用户名",
                  })}
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t({
                    ko: "비밀번호",
                    en: "Password",
                    ja: "パスワード",
                    zh: "密码",
                  })}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t({
                      ko: "비밀번호를 입력하세요",
                      en: "Enter your password",
                      ja: "パスワードを入力してください",
                      zh: "请输入密码",
                    })}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="h-12 text-base pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="secure-login"
                      checked={secureLogin}
                      onCheckedChange={(checked) =>
                        setSecureLogin(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="secure-login"
                      className="text-sm text-gray-600 dark:text-white cursor-pointer flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      {t({
                        ko: "보안접속",
                        en: "Secure Login",
                        ja: "セキュアログイン",
                        zh: "安全登录",
                      })}
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading
                  ? t({
                      ko: "로그인 중...",
                      en: "Logging in...",
                      ja: "ログイン中...",
                      zh: "登录中...",
                    })
                  : t({
                      ko: "로그인",
                      en: "Login",
                      ja: "ログイン",
                      zh: "登录",
                    })}
              </Button>
            </form>

            {/* Find ID/Password Links */}
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/find-id"
                className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-blue-300"
              >
                아이디 찾기
              </Link>
              <span className="text-gray-400 dark:text-white">|</span>
              <Link
                href="/find-password"
                className="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-blue-300"
              >
                비밀번호 찾기
              </Link>
            </div>

            {/* SNS Login */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-[#1a1a1a] text-gray-500 dark:text-white">
                    간편 로그인
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 dark:border-yellow-500 text-gray-700 dark:text-white"
                  onClick={() => handleSnsLogin("kakao")}
                >
                  <MessageCircle className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                  카카오
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-500 text-gray-700 dark:text-white"
                  onClick={() => handleSnsLogin("naver")}
                >
                  <span className="w-5 h-5 mr-2 bg-green-500 text-white rounded text-xs flex items-center justify-center font-bold">
                    N
                  </span>
                  네이버
                </Button>
              </div>
            </div>

            {/* Sign up promotion */}
            <div className="bg-gray-50 dark:bg-[#1a1a1a] p-4 rounded-lg text-center border dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-white mb-3">
                아직 회원이 아니신가요? 지금 회원가입을 하시면
                <br />
                다양한 특별 혜택이 준비되어 있습니다.
              </p>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full h-10 border-gray-300 dark:border-gray-500 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-white bg-white dark:bg-[#1a1a1a]"
                >
                  회원가입
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
