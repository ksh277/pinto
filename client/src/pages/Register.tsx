import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/useLanguage";
import { Link, useLocation } from "wouter";
import { Check, ChevronRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { BelugaMascot } from "@/components/BelugaMascot";

type Step = 1 | 2 | 3;

interface AgreementData {
  allAgreed: boolean;
  serviceTerms: boolean;
  privacyPolicy: boolean;
  shoppingInfo: boolean;
  smsMarketing: boolean;
  emailMarketing: boolean;
}

interface UserData {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  name: string;
  phone: string;
  email: string;
  memberType: "lifetime" | "guest";
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [agreements, setAgreements] = useState<AgreementData>({
    allAgreed: false,
    serviceTerms: false,
    privacyPolicy: false,
    shoppingInfo: false,
    smsMarketing: false,
    emailMarketing: false,
  });

  const [userData, setUserData] = useState<UserData>({
    username: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    name: "",
    phone: "",
    email: "",
    memberType: "lifetime",
  });

  const handleAllAgreementChange = (checked: boolean) => {
    setAgreements({
      allAgreed: checked,
      serviceTerms: checked,
      privacyPolicy: checked,
      shoppingInfo: checked,
      smsMarketing: checked,
      emailMarketing: checked,
    });
  };

  const handleAgreementChange = (
    field: keyof AgreementData,
    checked: boolean,
  ) => {
    const newAgreements = { ...agreements, [field]: checked };

    // Check if all agreements are now checked
    const allChecked =
      newAgreements.serviceTerms &&
      newAgreements.privacyPolicy &&
      newAgreements.shoppingInfo &&
      newAgreements.smsMarketing &&
      newAgreements.emailMarketing;

    newAgreements.allAgreed = allChecked;
    setAgreements(newAgreements);
  };

  const canProceedFromStep1 =
    agreements.serviceTerms && agreements.privacyPolicy;

  // 닉네임 중복 체크 함수
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    if (!nickname || nickname.length < 2) {
      setNicknameStatus({ checking: false, available: null, message: "" });
      return;
    }

    if (nickname.length > 10) {
      setNicknameStatus({ 
        checking: false, 
        available: false, 
        message: "닉네임은 10자 이하여야 합니다." 
      });
      return;
    }

    setNicknameStatus({ checking: true, available: null, message: "확인 중..." });

    try {
      const response = await fetch(`/api/auth/check-nickname/${encodeURIComponent(nickname)}`);
      const data = await response.json();
      
      setNicknameStatus({
        checking: false,
        available: data.available,
        message: data.message
      });
    } catch (error) {
      setNicknameStatus({
        checking: false,
        available: false,
        message: "닉네임 확인 중 오류가 발생했습니다."
      });
    }
  }, []);

  // 닉네임 변경 시 중복 체크 (debouncing 적용)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userData.nickname) {
        checkNicknameAvailability(userData.nickname);
      }
    }, 500); // 500ms 지연

    return () => clearTimeout(timeoutId);
  }, [userData.nickname, checkNicknameAvailability]);

  const canProceedFromStep2 =
    userData.username &&
    userData.password &&
    userData.confirmPassword &&
    userData.name &&
    userData.nickname &&
    userData.phone &&
    userData.email &&
    userData.password === userData.confirmPassword &&
    userData.nickname.length >= 2 &&
    userData.nickname.length <= 10 &&
    nicknameStatus.available === true;

  const handleStep1Next = () => {
    if (!canProceedFromStep1) {
      setError("필수 약관에 동의해주세요.");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handleStep2Next = async () => {
    if (!canProceedFromStep2) {
      setError("필수 정보를 모두 입력해주세요.");
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          nickname: userData.nickname,
          firstName: userData.name,
          lastName: "", // 성이 없으므로 빈 문자열
          phone: userData.phone,
        }),
      });

      if (response.ok) {
        console.log("회원가입 성공:", userData);
        setError("");
        setCurrentStep(3);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          약관 동의
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          서비스 이용을 위한 약관에 동의해주세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <Checkbox
            id="all-agree"
            checked={agreements.allAgreed}
            onCheckedChange={handleAllAgreementChange}
          />
          <label
            htmlFor="all-agree"
            className="text-sm font-medium text-blue-900 dark:text-blue-300 cursor-pointer"
          >
            전체 동의
          </label>
        </div>

        <div className="space-y-3 ml-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="service-terms"
                checked={agreements.serviceTerms}
                onCheckedChange={(checked) =>
                  handleAgreementChange("serviceTerms", checked as boolean)
                }
              />
              <label
                htmlFor="service-terms"
                className="text-sm cursor-pointer text-gray-900 dark:text-white"
              >
                [필수] 이용약관 동의
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400"
            >
              보기
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="privacy-policy"
                checked={agreements.privacyPolicy}
                onCheckedChange={(checked) =>
                  handleAgreementChange("privacyPolicy", checked as boolean)
                }
              />
              <label
                htmlFor="privacy-policy"
                className="text-sm cursor-pointer text-gray-900 dark:text-white"
              >
                [필수] 개인정보 수집 및 이용 동의
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400"
            >
              보기
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="shopping-info"
                checked={agreements.shoppingInfo}
                onCheckedChange={(checked) =>
                  handleAgreementChange("shoppingInfo", checked as boolean)
                }
              />
              <label
                htmlFor="shopping-info"
                className="text-sm cursor-pointer text-gray-900 dark:text-white"
              >
                [선택] 쇼핑정보 수신 동의
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400"
            >
              보기
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="sms-marketing"
              checked={agreements.smsMarketing}
              onCheckedChange={(checked) =>
                handleAgreementChange("smsMarketing", checked as boolean)
              }
            />
            <label htmlFor="sms-marketing" className="text-sm cursor-pointer">
              [선택] SMS 마케팅 수신 동의
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="email-marketing"
              checked={agreements.emailMarketing}
              onCheckedChange={(checked) =>
                handleAgreementChange("emailMarketing", checked as boolean)
              }
            />
            <label htmlFor="email-marketing" className="text-sm cursor-pointer">
              [선택] 이메일 마케팅 수신 동의
            </label>
          </div>
        </div>
      </div>

      <Button
        onClick={handleStep1Next}
        className="w-full h-12 bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700"
        disabled={!canProceedFromStep1}
      >
        다음 단계
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          정보 입력
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          회원가입을 위한 정보를 입력해주세요
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="username" className="text-gray-900 dark:text-white">
            아이디
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="아이디를 입력하세요"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
            className="mt-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-gray-900 dark:text-white">
            비밀번호
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={userData.password}
              onChange={(e) =>
                setUserData({ ...userData, password: e.target.value })
              }
              className="pr-10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            영문 대소문자, 숫자, 특수문자 포함 8~16자
          </p>
        </div>

        <div>
          <Label
            htmlFor="confirmPassword"
            className="text-gray-900 dark:text-white"
          >
            비밀번호 확인
          </Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={userData.confirmPassword}
              onChange={(e) =>
                setUserData({ ...userData, confirmPassword: e.target.value })
              }
              className="pr-10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="name" className="text-gray-900 dark:text-white">
            이름
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력하세요"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="mt-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="nickname" className="text-gray-900 dark:text-white">
            닉네임 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nickname"
            type="text"
            placeholder="닉네임을 입력하세요 (2-10자)"
            value={userData.nickname}
            onChange={(e) => setUserData({ ...userData, nickname: e.target.value })}
            className={`mt-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${
              nicknameStatus.available === false ? 'border-red-500' : 
              nicknameStatus.available === true ? 'border-green-500' : ''
            }`}
            maxLength={10}
          />
          <div className="mt-1 min-h-[20px]">
            {nicknameStatus.checking && (
              <p className="text-sm text-blue-500">확인 중...</p>
            )}
            {nicknameStatus.available === true && (
              <p className="text-sm text-green-600">✓ 사용 가능한 닉네임입니다</p>
            )}
            {nicknameStatus.available === false && nicknameStatus.message && (
              <p className="text-sm text-red-500">✗ {nicknameStatus.message}</p>
            )}
            {!nicknameStatus.checking && nicknameStatus.available === null && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                댓글 작성 시 표시될 닉네임입니다 (필수)
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-900 dark:text-white">
            휴대전화
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="휴대전화 번호를 입력하세요"
            value={userData.phone}
            onChange={(e) =>
              setUserData({ ...userData, phone: e.target.value })
            }
            className="mt-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-900 dark:text-white">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={userData.email}
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
            className="mt-1 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <Label className="text-gray-900 dark:text-white">회원유형</Label>
          <RadioGroup
            value={userData.memberType}
            onValueChange={(value) =>
              setUserData({
                ...userData,
                memberType: value as "lifetime" | "guest",
              })
            }
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lifetime" id="lifetime" />
              <Label
                htmlFor="lifetime"
                className="text-gray-900 dark:text-white"
              >
                평생회원 (탈퇴 시까지)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="guest" id="guest" />
              <Label htmlFor="guest" className="text-gray-900 dark:text-white">
                비회원
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={() => setCurrentStep(1)}
          variant="outline"
          className="flex-1 h-12 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          이전 단계
        </Button>
        <Button
          onClick={handleStep2Next}
          className="flex-1 h-12 bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700"
          disabled={!canProceedFromStep2}
        >
          다음 단계
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <BelugaMascot variant="login" className="mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 회원가입이 완료되었습니다!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          벨루가 굿즈의 다양한 혜택을 지금 바로 만나보세요.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">
          가입 정보
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">아이디:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userData.username}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">이름:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userData.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">휴대전화:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userData.phone}
            </span>
          </div>
          {userData.email && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">이메일:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {userData.email}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">회원유형:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {userData.memberType === "lifetime" ? "평생회원" : "비회원"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/login" className="w-full">
          <Button className="w-full h-12 bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700">
            로그인 하러 가기
          </Button>
        </Link>

        <div className="text-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
          >
            홈페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {step < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step
                      )}
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-2 ${
                          step < currentStep
                            ? "bg-blue-600"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t({ ko: "회원가입", en: "Sign Up" })}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {currentStep < 3 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  이미 계정이 있으신가요?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    로그인
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
