import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Heart } from "lucide-react";

// 굿즈 타입 정의
const GOODS_TYPES = [
  {
    id: "keyring",
    name: "아크릴 키링",
    nameEn: "Acrylic Keyring",
    price: "3,500원~",
    image: "/api/placeholder/200/200",
    popular: true,
    description: "투명한 아크릴 소재로 제작되는 키링",
    specs: ["크기: 5cm x 5cm", "두께: 3mm", "투명 아크릴"],
    tags: ["인기", "투명"]
  },
  {
    id: "photocard",
    name: "포토카드 홀더",
    nameEn: "Photocard Holder",
    price: "2,800원~",
    image: "/api/placeholder/200/200",
    popular: false,
    description: "포토카드를 보호하고 꾸밀 수 있는 홀더",
    specs: ["크기: 6cm x 9cm", "두께: 2mm", "매트 아크릴"],
    tags: ["보호", "매트"]
  },
  {
    id: "stand",
    name: "아크릴 스탠드",
    nameEn: "Acrylic Stand",
    price: "4,200원~",
    image: "/api/placeholder/200/200",
    popular: true,
    description: "캐릭터나 디자인을 세워둘 수 있는 스탠드",
    specs: ["크기: 8cm x 10cm", "두께: 5mm", "투명 아크릴"],
    tags: ["인기", "스탠드"]
  },
  {
    id: "badge",
    name: "뱃지",
    nameEn: "Badge",
    price: "2,200원~",
    image: "/api/placeholder/200/200",
    popular: false,
    description: "옷이나 가방에 붙일 수 있는 뱃지",
    specs: ["크기: 4cm x 4cm", "핀 타입", "메탈"],
    tags: ["메탈", "핀"]
  },
  {
    id: "sticker",
    name: "스티커",
    nameEn: "Sticker",
    price: "1,800원~",
    image: "/api/placeholder/200/200",
    popular: false,
    description: "다양한 크기의 맞춤 스티커",
    specs: ["크기: 자유", "방수", "비닐"],
    tags: ["방수", "자유크기"]
  },
  {
    id: "phonecase",
    name: "폰케이스",
    nameEn: "Phone Case",
    price: "8,900원~",
    image: "/api/placeholder/200/200",
    popular: true,
    description: "개인 디자인으로 제작하는 폰케이스",
    specs: ["기종별 제작", "하드케이스", "UV 인쇄"],
    tags: ["인기", "맞춤제작"]
  }
];

export default function EditorSelect() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelectGoods = (goodsId: string) => {
    setSelectedType(goodsId);
    // 짧은 선택 피드백 후 에디터로 이동
    setTimeout(() => {
      setLocation(`/editor/${goodsId}`);
    }, 200);
  };

  const goBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">굿즈 종류 선택</h1>
              <p className="text-sm text-gray-600">원하는 굿즈를 선택하고 디자인을 시작하세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">어떤 굿즈를 만들까요?</h2>
          <p className="text-gray-600">
            다양한 굿즈 중에서 원하는 것을 선택하면 바로 에디터로 이동됩니다
          </p>
        </div>

        {/* Goods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GOODS_TYPES.map((goods) => (
            <Card
              key={goods.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedType === goods.id ? "ring-2 ring-[#00C19D] shadow-lg" : ""
              }`}
              onClick={() => handleSelectGoods(goods.id)}
            >
              <CardContent className="p-0">
                {/* Image Section */}
                <div className="relative">
                  <img
                    src={goods.image}
                    alt={goods.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {goods.popular && (
                    <Badge className="absolute top-2 left-2 bg-[#00C19D] text-white">
                      <Star className="w-3 h-3 mr-1" />
                      인기
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{goods.name}</h3>
                      <p className="text-sm text-gray-500">{goods.nameEn}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#00C19D]">{goods.price}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{goods.description}</p>

                  {/* Specifications */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {goods.specs.slice(0, 2).map((spec, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {goods.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-[#00C19D] text-[#00C19D]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full bg-[#00C19D] hover:bg-[#00C19D]/90 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectGoods(goods.id);
                    }}
                  >
                    선택하고 디자인 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            원하는 굿즈가 없나요?
          </h3>
          <p className="text-gray-600 mb-4">
            다른 굿즈 종류나 맞춤 제작에 대해서는 고객센터로 문의해주세요
          </p>
          <Button variant="outline" className="border-[#00C19D] text-[#00C19D]">
            고객센터 문의
          </Button>
        </div>
      </div>
    </div>
  );
}