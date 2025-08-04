import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Editor() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, setRedirectPath } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 현재 경로를 리디렉션 경로로 저장
      const currentPath = `/editor${params.type ? `/${params.type}` : ''}`;
      setRedirectPath(currentPath);
      
      // 로그인 필요 알림
      toast({
        title: "로그인이 필요한 페이지입니다",
        description: "굿즈 에디터를 사용하려면 로그인해주세요.",
        variant: "destructive",
      });
      
      // 로그인 페이지로 리디렉션
      setTimeout(() => {
        setLocation(`/login?redirect_to=${encodeURIComponent(currentPath)}`);
      }, 1000);
    }
  }, [isAuthenticated, isLoading, params.type, setLocation, setRedirectPath, toast]);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null;
  }

  return (
    <EditorLayout productType={params.type} />
  );
}