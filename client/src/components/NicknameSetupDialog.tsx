import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";

interface NicknameSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NicknameSetupDialog({
  open,
  onOpenChange,
  onSuccess,
}: NicknameSetupDialogProps) {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    if (nickname.length < 2 || nickname.length > 10) {
      setError("닉네임은 2-10자 사이여야 합니다.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiRequest(`/api/users/${user?.id}/nickname`, {
        method: "PATCH",
        body: JSON.stringify({ nickname }),
      });

      // apiRequest throws on non-OK responses
      const updatedUser = await response.json();
      setUser(updatedUser);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error setting nickname:", error);
      const defaultMessage = "닉네임 설정에 실패했습니다. 다시 시도해주세요.";
      if (error instanceof Error) {
        const colonIndex = error.message.indexOf(":");
        if (colonIndex !== -1) {
          const errorText = error.message.slice(colonIndex + 1).trim();
          try {
            const parsed = JSON.parse(errorText);
            setError(parsed.message || defaultMessage);
            return;
          } catch {
            setError(errorText || defaultMessage);
            return;
          }
        }
      }
      setError(defaultMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>닉네임 설정</DialogTitle>
          <DialogDescription>
            댓글 작성을 위해 닉네임이 필요합니다. 닉네임을 설정해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              placeholder="닉네임을 입력하세요 (2-10자)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={10}
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500">
              댓글 작성 시 표시될 닉네임입니다.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              나중에
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "설정 중..." : "설정 완료"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}