import { Link } from "wouter";
import { Mail, Phone, MapPin, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                PIXEL<span className="text-primary">GOODS</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              나만의 개성을 담은 커스텀 굿즈를 제작하는 전문 플랫폼입니다.
              고품질의 프린팅 서비스로 여러분의 창작물을 현실로 만들어드립니다.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">뉴스레터</h4>
              <p className="text-gray-400 mb-4">
                최신 제품과 할인 정보를 받아보세요
              </p>
              <div className="flex max-w-md">
                <Input
                  type="email"
                  placeholder="이메일 주소"
                  className="rounded-r-none border-gray-700 bg-gray-800 text-white"
                />
                <Button className="rounded-l-none bg-primary hover:bg-primary/90">
                  구독
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <div className="h-5 w-5 bg-green-500 rounded text-xs flex items-center justify-center text-white font-bold">
                  L
                </div>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">메뉴</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  제품
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  커뮤니티
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  로그인
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  회원가입
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">고객센터</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  배송 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  반품/교환
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  이용약관
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>

            <div className="mt-6 space-y-2">
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">1588-0000</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">info@allthatprinting.co.kr</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">서울시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 AllThatPrinting. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">
              사업자등록번호: 123-45-67890
            </span>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-400">
              통신판매업신고: 2024-서울강남-1234
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
