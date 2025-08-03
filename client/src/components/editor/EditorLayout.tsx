import React, { useState, useCallback, useRef } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Undo2,
  Redo2,
  Download,
  Save,
  X,
  Upload,
  Type,
  Square,
  Circle,
  Move,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductEditor } from "@/components/editor/ProductEditor";
import { SizeSelector } from "@/components/editor/SizeSelector";
import { useToast } from "@/hooks/use-toast";

interface EditorLayoutProps {
  productType?: string;
}

export interface CanvasElement {
  id: string;
  type: "image" | "text" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  zIndex: number;
  src?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  color?: string;
  shapeType?: "rectangle" | "circle";
  fill?: string;
}

export interface CanvasSize {
  width: number;
  height: number;
  widthMM: number;
  heightMM: number;
}

export function EditorLayout({ productType }: EditorLayoutProps) {
  const params = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas and size state
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Tool state
  const [activeUpload, setActiveUpload] = useState(false);
  const [newText, setNewText] = useState("텍스트");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Pretendard");
  const [textColor, setTextColor] = useState("#000000");
  const [shapeType, setShapeType] = useState<"rectangle" | "circle">("rectangle");
  const [shapeFill, setShapeFill] = useState("#FF0000");

  const isEditorEnabled = canvasSize !== null;

  const handleSizeSet = useCallback((size: CanvasSize) => {
    setCanvasSize(size);
    toast({
      title: "캔버스 크기 설정됨",
      description: `${size.widthMM}mm × ${size.heightMM}mm (${size.width}px × ${size.height}px)`,
    });
  }, [toast]);

  const saveToHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  const addElement = useCallback((element: CanvasElement) => {
    const newElements = [...elements, element];
    setElements(newElements);
    setSelectedElement(element.id);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    saveToHistory(newElements);
  }, [elements, selectedElement, saveToHistory]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasSize) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let width = Math.min(canvasSize.width * 0.3, 100);
        let height = width / aspectRatio;

        if (height > canvasSize.height * 0.3) {
          height = canvasSize.height * 0.3;
          width = height * aspectRatio;
        }

        const element: CanvasElement = {
          id: `img-${Date.now()}`,
          type: "image",
          x: (canvasSize.width - width) / 2,
          y: (canvasSize.height - height) / 2,
          width,
          height,
          rotation: 0,
          visible: true,
          zIndex: elements.length,
          src: event.target?.result as string,
        };

        addElement(element);
        toast({
          title: "이미지 추가됨",
          description: "이미지가 캔버스에 추가되었습니다.",
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [canvasSize, elements, addElement, toast]);

  const handleAddText = useCallback(() => {
    if (!newText.trim() || !canvasSize) return;

    const element: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: canvasSize.width * 0.1,
      y: canvasSize.height * 0.1,
      width: canvasSize.width * 0.8,
      height: fontSize * 1.5,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      text: newText,
      fontSize,
      fontFamily,
      color: textColor,
    };

    addElement(element);
    setNewText("텍스트");
    toast({
      title: "텍스트 추가됨",
      description: "텍스트가 캔버스에 추가되었습니다.",
    });
  }, [newText, canvasSize, fontSize, fontFamily, textColor, elements, addElement, toast]);

  const handleAddShape = useCallback(() => {
    if (!canvasSize) return;

    const size = Math.min(canvasSize.width, canvasSize.height) * 0.2;
    const element: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: (canvasSize.width - size) / 2,
      y: (canvasSize.height - size) / 2,
      width: size,
      height: size,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      shapeType,
      fill: shapeFill,
    };

    addElement(element);
    toast({
      title: "도형 추가됨",
      description: "도형이 캔버스에 추가되었습니다.",
    });
  }, [canvasSize, shapeType, shapeFill, elements, addElement, toast]);

  const handleSave = useCallback(() => {
    const designData = {
      elements,
      canvasSize,
      timestamp: Date.now(),
      productType: productType || params.type,
    };

    localStorage.setItem("pinto-design", JSON.stringify(designData));
    toast({
      title: "디자인 저장됨",
      description: "디자인이 성공적으로 저장되었습니다.",
    });
  }, [elements, canvasSize, productType, params.type, toast]);

  const handleExport = useCallback(async (format: "png" | "pdf") => {
    if (!canvasSize) return;

    // This would be implemented with actual export functionality
    toast({
      title: `${format.toUpperCase()} 내보내기`,
      description: `${format.toUpperCase()} 파일로 내보내기를 시작합니다.`,
    });
  }, [canvasSize, toast]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">ALL THAT PRINTING</span>
          <span className="text-sm text-gray-500">EDITOR</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="text-gray-600"
          >
            <Undo2 className="w-4 h-4" />
            되돌리기
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="text-gray-600"
          >
            <Redo2 className="w-4 h-4" />
            다시실행
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedElement && deleteElement(selectedElement)}
            disabled={!selectedElement}
            className="text-gray-600"
          >
            <Trash2 className="w-4 h-4" />
            삭제
          </Button>
          <div className="w-px h-6 bg-gray-300" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-gray-600"
          >
            <Save className="w-4 h-4" />
            저장
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport("png")}
            disabled={!isEditorEnabled}
            className="text-gray-600"
          >
            <Download className="w-4 h-4" />
            PNG 다운로드
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleExport("pdf")}
            disabled={!isEditorEnabled}
            className="bg-black text-white hover:bg-gray-800"
          >
            PDF 다운로드
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
          >
            <X className="w-4 h-4" />
            닫기
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-800 text-white flex flex-col">
          {/* Size Selector */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium mb-3">자료 설정</h3>
            {!canvasSize ? (
              <SizeSelector
                productType={productType || params.type || "keyring"}
                onSizeSet={handleSizeSet}
              />
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">
                  크기: {canvasSize.widthMM}mm × {canvasSize.heightMM}mm
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanvasSize(null)}
                  className="w-full text-xs"
                >
                  크기 변경
                </Button>
              </div>
            )}
          </div>

          {/* Tools */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Upload */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">이미지</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isEditorEnabled}
                className="w-full text-xs"
              >
                이미지 업로드
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Text Tool */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Type className="w-4 h-4" />
                <span className="text-sm font-medium">텍스트</span>
              </div>
              <div className="space-y-3">
                <Input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="텍스트 입력"
                  disabled={!isEditorEnabled}
                  className="bg-gray-700 border-gray-600 text-white text-xs"
                />
                <Select value={fontFamily} onValueChange={setFontFamily} disabled={!isEditorEnabled}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pretendard">Pretendard</SelectItem>
                    <SelectItem value="Noto Sans KR">Noto Sans KR</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min="8"
                    max="72"
                    disabled={!isEditorEnabled}
                    className="bg-gray-700 border-gray-600 text-white text-xs"
                  />
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    disabled={!isEditorEnabled}
                    className="bg-gray-700 border-gray-600 w-12"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddText}
                  disabled={!isEditorEnabled || !newText.trim()}
                  className="w-full text-xs"
                >
                  텍스트 추가
                </Button>
              </div>
            </div>

            {/* Shape Tool */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Square className="w-4 h-4" />
                <span className="text-sm font-medium">도형</span>
              </div>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    variant={shapeType === "rectangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShapeType("rectangle")}
                    disabled={!isEditorEnabled}
                    className="flex-1 text-xs"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={shapeType === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShapeType("circle")}
                    disabled={!isEditorEnabled}
                    className="flex-1 text-xs"
                  >
                    <Circle className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  type="color"
                  value={shapeFill}
                  onChange={(e) => setShapeFill(e.target.value)}
                  disabled={!isEditorEnabled}
                  className="bg-gray-700 border-gray-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddShape}
                  disabled={!isEditorEnabled}
                  className="w-full text-xs"
                >
                  도형 추가
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          {canvasSize ? (
            <ProductEditor
              canvasSize={canvasSize}
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">캔버스 크기를 설정해주세요</div>
                <div className="text-sm">왼쪽 사이드바에서 제품 크기를 입력하세요</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}