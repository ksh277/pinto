import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SizeSelectorProps {
  productType: string;
  onSizeSet: (size: {
    width: number;
    height: number;
    widthMM: number;
    heightMM: number;
  }) => void;
}

const PRODUCT_PRESETS = {
  keyring: [
    { name: "스퀘어 키링", width: 50, height: 50 },
    { name: "원형 키링", width: 60, height: 60 },
    { name: "하트 키링", width: 55, height: 50 },
  ],
  stand: [
    { name: "스마트톡 원형", width: 40, height: 40 },
    { name: "스마트톡 사각", width: 45, height: 45 },
    { name: "스마트톡 하트", width: 50, height: 45 },
  ],
  photocard: [
    { name: "포토카드 홀더", width: 65, height: 100 },
    { name: "미니 포토카드", width: 54, height: 86 },
    { name: "대형 포토카드", width: 70, height: 105 },
  ],
  sticker: [
    { name: "원형 스티커", width: 50, height: 50 },
    { name: "사각 스티커", width: 60, height: 40 },
    { name: "대형 스티커", width: 80, height: 60 },
  ],
  phonecase: [
    { name: "아이폰 케이스", width: 80, height: 160 },
    { name: "갤럭시 케이스", width: 85, height: 165 },
    { name: "태블릿 케이스", width: 200, height: 280 },
  ],
  tshirt: [
    { name: "티셔츠 앞면", width: 200, height: 250 },
    { name: "티셔츠 뒷면", width: 200, height: 250 },
    { name: "후드티 앞면", width: 220, height: 280 },
  ],
};

const MM_TO_PX_RATIO = 10; // 1mm = 10px for screen display

export function SizeSelector({ productType, onSizeSet }: SizeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customWidth, setCustomWidth] = useState<number>(50);
  const [customHeight, setCustomHeight] = useState<number>(50);
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const presets = PRODUCT_PRESETS[productType as keyof typeof PRODUCT_PRESETS] || PRODUCT_PRESETS.keyring;

  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      onSizeSet({
        width: preset.width * MM_TO_PX_RATIO,
        height: preset.height * MM_TO_PX_RATIO,
        widthMM: preset.width,
        heightMM: preset.height,
      });
    }
  };

  const handleCustomSize = () => {
    if (customWidth > 0 && customHeight > 0) {
      onSizeSet({
        width: customWidth * MM_TO_PX_RATIO,
        height: customHeight * MM_TO_PX_RATIO,
        widthMM: customWidth,
        heightMM: customHeight,
      });
    }
  };

  const handleModeChange = (newMode: "preset" | "custom") => {
    setMode(newMode);
    setSelectedPreset(""); // Clear preset selection when switching modes
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-gray-300">크기 설정 방식</Label>
        <div className="flex space-x-2">
          <Button
            variant={mode === "preset" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("preset")}
            className="flex-1 text-xs"
          >
            프리셋
          </Button>
          <Button
            variant={mode === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("custom")}
            className="flex-1 text-xs"
          >
            직접입력
          </Button>
        </div>
      </div>

      {mode === "preset" ? (
        <div className="space-y-3">
          <Label className="text-xs text-gray-300">제품 크기 선택</Label>
          <Select 
            value={selectedPreset} 
            onValueChange={handlePresetSelect}
            disabled={mode !== "preset"}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs">
              <SelectValue placeholder="크기를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name} ({preset.width}×{preset.height}mm)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-xs text-gray-300">사용자 정의 크기 (mm)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-400">가로</Label>
              <Input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value) || 0)}
                min="10"
                max="500"
                disabled={mode !== "custom"}
                className="bg-gray-700 border-gray-600 text-white text-xs disabled:opacity-50"
                placeholder="가로 (mm)"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">세로</Label>
              <Input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value) || 0)}
                min="10"
                max="500"
                disabled={mode !== "custom"}
                className="bg-gray-700 border-gray-600 text-white text-xs disabled:opacity-50"
                placeholder="세로 (mm)"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomSize}
            disabled={mode !== "custom" || customWidth <= 0 || customHeight <= 0}
            className="w-full text-xs disabled:opacity-50"
          >
            크기 적용
          </Button>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        {mode === "preset" && selectedPreset && (
          <div>
            선택된 크기: {presets.find(p => p.name === selectedPreset)?.width}×{presets.find(p => p.name === selectedPreset)?.height}mm
          </div>
        )}
        {mode === "custom" && customWidth > 0 && customHeight > 0 && (
          <div>
            설정될 크기: {customWidth}×{customHeight}mm
          </div>
        )}
        {mode === "custom" && (customWidth <= 0 || customHeight <= 0) && (
          <div className="text-yellow-400">
            가로와 세로 크기를 입력하세요 (10-500mm)
          </div>
        )}
      </div>
    </div>
  );
}