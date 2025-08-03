import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  Type,
  Square,
  Circle,
  Layers,
  RotateCcw,
  ArrowLeft,
  Share2,
  Save,
  Trash2,
  Move,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCw,
  FlipHorizontal,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableElement } from "@/components/DraggableElement";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CanvasElement {
  id: string;
  type: "image" | "text" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  visible: boolean;
  zIndex: number;
  // Image specific
  src?: string;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  color?: string;
  // Shape specific
  shapeType?: "rectangle" | "circle";
  fill?: string;
  stroke?: string;
}

const CANVAS_SIZE = { width: 300, height: 300 };

const PRESET_COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF",
  "#00FFFF", "#FFA500", "#800080", "#FFC0CB", "#A52A2A", "#808080",
  "#FF69B4", "#32CD32", "#87CEEB", "#DDA0DD", "#F0E68C", "#FA8072",
  "#40E0D0", "#EE82EE", "#90EE90", "#FFB6C1", "#20B2AA", "#87CEFA",
  "#778899", "#B0C4DE", "#FFFFE0", "#00FF7F", "#4682B4", "#D2691E",
];

const FONT_FAMILIES = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Verdana", label: "Verdana" },
  { value: "Impact", label: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Lucida Grande", label: "Lucida Grande" },
  { value: "Pretendard", label: "Pretendard" },
  { value: "Noto Sans KR", label: "Noto Sans KR" },
];

const TOOL_TABS = [
  { id: "upload", label: "업로드", icon: Camera },
  { id: "text", label: "텍스트", icon: Type },
  { id: "shape", label: "도형", icon: Square },
  { id: "layers", label: "레이어", icon: Layers },
];

export default function Editor() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(isMobile ? null : "upload");

  // Text state
  const [newText, setNewText] = useState("텍스트");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("normal");
  const [fontStyle, setFontStyle] = useState<"normal" | "italic">("normal");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textColor, setTextColor] = useState("#000000");

  // Shape state
  const [shapeType, setShapeType] = useState<"rectangle" | "circle">("rectangle");
  const [shapeFill, setShapeFill] = useState("#FF0000");

  const selectedElementData = selectedElement 
    ? elements.find(el => el.id === selectedElement) 
    : null;

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let width = 100;
        let height = 100;

        if (aspectRatio > 1) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }

        const newElement: CanvasElement = {
          id: `img-${Date.now()}`,
          type: "image",
          x: (CANVAS_SIZE.width - width) / 2,
          y: (CANVAS_SIZE.height - height) / 2,
          width,
          height,
          rotation: 0,
          visible: true,
          zIndex: elements.length,
          src: event.target?.result as string,
        };

        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        toast({
          title: "이미지 추가됨",
          description: "이미지가 캔버스에 추가되었습니다.",
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [elements, toast]);

  const addTextElement = useCallback(() => {
    if (!newText.trim()) return;

    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      text: newText,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textAlign,
      color: textColor,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setNewText("텍스트");
    toast({
      title: "텍스트 추가됨",
      description: "텍스트가 캔버스에 추가되었습니다.",
    });
  }, [newText, fontSize, fontFamily, fontWeight, fontStyle, textAlign, textColor, elements, toast]);

  const addShapeElement = useCallback(() => {
    const newElement: CanvasElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: 75,
      y: 75,
      width: 80,
      height: 80,
      rotation: 0,
      visible: true,
      zIndex: elements.length,
      shapeType,
      fill: shapeFill,
      stroke: "#000000",
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast({
      title: "도형 추가됨",
      description: "도형이 캔버스에 추가되었습니다.",
    });
  }, [shapeType, shapeFill, elements, toast]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
    toast({
      title: "캔버스 초기화",
      description: "모든 요소가 삭제되었습니다.",
    });
  }, [toast]);

  const moveElementLayer = useCallback((id: string, direction: "up" | "down") => {
    setElements(prev => {
      const index = prev.findIndex(el => el.id === id);
      if (index === -1) return prev;

      const newElements = [...prev];
      if (direction === "up" && index > 0) {
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
      } else if (direction === "down" && index < newElements.length - 1) {
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
      }

      return newElements.map((el, i) => ({ ...el, zIndex: i }));
    });
  }, []);

  const saveDesign = useCallback(() => {
    const designData = {
      elements,
      canvas: CANVAS_SIZE,
      timestamp: Date.now(),
    };

    // Save to localStorage
    localStorage.setItem("pinto-design", JSON.stringify(designData));

    toast({
      title: "디자인 저장됨",
      description: "디자인이 성공적으로 저장되었습니다.",
    });
  }, [elements, toast]);

  // Load saved design on mount
  useEffect(() => {
    const saved = localStorage.getItem("pinto-design");
    if (saved) {
      try {
        const designData = JSON.parse(saved);
        if (designData.elements) {
          setElements(designData.elements);
        }
      } catch (error) {
        console.error("Failed to load saved design:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/editor/select">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  굿즈 선택
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Pinto 굿즈 에디터
                  {params.type && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({params.type})
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  원하는 디자인을 만들어보세요
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                공유
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <RotateCcw className="w-4 h-4 mr-1" />
                초기화
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className={cn(
          "flex",
          isMobile ? "flex-col" : "h-[calc(100vh-73px)]"
        )}>
          {/* Mobile Tool Tabs */}
          {isMobile && (
            <div className="bg-white border-b">
              <div className="flex space-x-0 overflow-x-auto p-2">
                {TOOL_TABS.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                    className={cn(
                      "flex-shrink-0 mx-1 min-w-0",
                      activeTab === tab.id ? "bg-[#0A84FF] text-white" : "text-gray-600"
                    )}
                  >
                    <tab.icon className="w-4 h-4 mr-1" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Left Sidebar */}
          {!isMobile && (
            <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
              <div className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">도구</h2>
                
                {/* Image Upload */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">이미지 업로드</h3>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#00C19D] hover:bg-[#00C19D]/90 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      이미지 선택
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Text Tools */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">텍스트</h3>
                    <div className="space-y-4">
                      <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="텍스트를 입력하세요"
                      />
                      <Button
                        onClick={addTextElement}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        텍스트 추가
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shape Tools */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">도형</h3>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Button
                          variant={shapeType === "rectangle" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShapeType("rectangle")}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={shapeType === "circle" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShapeType("circle")}
                        >
                          <Circle className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={addShapeElement}
                        className="w-full bg-[#00C19D] hover:bg-[#00C19D]/90 text-white"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        도형 추가
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
            {/* Canvas Container with perfect centering */}
            <div className="flex flex-col items-center justify-center w-full">
              {/* Canvas */}
              <div className="relative mb-6">
                {/* Canvas Container with proper positioning context */}
                <div
                  className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg mx-auto"
                  style={{ 
                    width: CANVAS_SIZE.width, 
                    height: CANVAS_SIZE.height,
                    position: "relative",
                    overflow: "visible"
                  }}
                >
                  {/* Canvas background pattern */}
                  <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px"
                    }}
                  />
                  
                  {/* Canvas Elements */}
                  {elements
                    .filter(el => el.visible)
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map((element) => (
                      <DraggableElement
                        key={element.id}
                        element={element}
                        isSelected={selectedElement === element.id}
                        onSelect={setSelectedElement}
                        onUpdate={updateElement}
                        onDelete={deleteElement}
                        canvasBounds={CANVAS_SIZE}
                      />
                    ))}
                  
                  {/* Empty state */}
                  {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                      <div className="text-center">
                        <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">요소를 추가해보세요</p>
                        <p className="text-xs mt-1">이미지, 텍스트, 도형을 드래그하여 디자인을 만들어보세요</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Canvas Info */}
                <div className="text-center mt-2 text-xs text-gray-500">
                  캔버스 크기: {CANVAS_SIZE.width} × {CANVAS_SIZE.height}px
                  {selectedElement && (
                    <span className="ml-2 text-[#00C19D]">
                      • 선택된 요소: {elements.find(el => el.id === selectedElement)?.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Save Button - Perfectly centered under canvas */}
              <div className="w-full max-w-md flex justify-center">
                <Button
                  onClick={saveDesign}
                  className="w-full max-w-xs bg-gradient-to-r from-[#00C19D] to-[#0A84FF] hover:from-[#00C19D]/90 hover:to-[#0A84FF]/90 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  <Save className="w-5 h-5 mr-2" />
                  디자인 저장
                </Button>
              </div>
            </div>

            {/* Mobile Tools */}
            {isMobile && activeTab && (
              <Card className="mt-4 w-full max-w-md">
                <CardContent className="p-4">
                  {activeTab === "upload" && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#00C19D] hover:bg-[#00C19D]/90 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
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
                  )}

                  {activeTab === "text" && (
                    <div className="space-y-3">
                      <Input
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="텍스트를 입력하세요"
                      />
                      <Button
                        onClick={addTextElement}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        텍스트 추가
                      </Button>
                    </div>
                  )}

                  {activeTab === "shape" && (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Button
                          variant={shapeType === "rectangle" ? "default" : "outline"}
                          onClick={() => setShapeType("rectangle")}
                          className="flex-1"
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={shapeType === "circle" ? "default" : "outline"}
                          onClick={() => setShapeType("circle")}
                          className="flex-1"
                        >
                          <Circle className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={addShapeElement}
                        className="w-full bg-[#00C19D] hover:bg-[#00C19D]/90 text-white"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        도형 추가
                      </Button>
                    </div>
                  )}

                  {activeTab === "layers" && (
                    <div className="space-y-2">
                      {elements.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          아직 추가된 요소가 없습니다
                        </p>
                      ) : (
                        [...elements].reverse().map((element) => (
                          <div
                            key={element.id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded border",
                              selectedElement === element.id ? "border-[#00C19D] bg-[#00C19D]/10" : "border-gray-200"
                            )}
                          >
                            <span className="text-sm font-medium truncate">
                              {element.type === "image" ? "이미지" : 
                               element.type === "text" ? `${element.text?.slice(0, 8)}...` : 
                               "도형"}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteElement(element.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}