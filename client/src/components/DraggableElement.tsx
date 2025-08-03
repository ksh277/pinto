import { useState, useRef, useCallback, useEffect } from "react";
import { Move, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

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

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  canvasBounds: { width: number; height: number };
}

export function DraggableElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasBounds,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<Position>({ x: 0, y: 0 });
  const [sizeStart, setSizeStart] = useState<Size>({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === elementRef.current || e.currentTarget === elementRef.current) {
      e.preventDefault();
      e.stopPropagation();
      
      onSelect(element.id);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setElementStart({ x: element.x, y: element.y });
    }
  }, [element.id, element.x, element.y, onSelect]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSizeStart({ width: element.width, height: element.height });
    setElementStart({ x: element.x, y: element.y });
  }, [element.width, element.height, element.x, element.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      const newX = Math.max(0, Math.min(canvasBounds.width - element.width, elementStart.x + deltaX));
      const newY = Math.max(0, Math.min(canvasBounds.height - element.height, elementStart.y + deltaY));
      
      onUpdate(element.id, { x: newX, y: newY });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = sizeStart.width;
      let newHeight = sizeStart.height;
      let newX = elementStart.x;
      let newY = elementStart.y;

      if (resizeHandle.includes("right")) {
        newWidth = Math.max(20, Math.min(canvasBounds.width - element.x, sizeStart.width + deltaX));
      }
      if (resizeHandle.includes("left")) {
        const widthChange = Math.max(20 - sizeStart.width, -elementStart.x, -deltaX);
        newWidth = sizeStart.width - widthChange;
        newX = elementStart.x + widthChange;
      }
      if (resizeHandle.includes("bottom")) {
        newHeight = Math.max(20, Math.min(canvasBounds.height - element.y, sizeStart.height + deltaY));
      }
      if (resizeHandle.includes("top")) {
        const heightChange = Math.max(20 - sizeStart.height, -elementStart.y, -deltaY);
        newHeight = sizeStart.height - heightChange;
        newY = elementStart.y + heightChange;
      }

      onUpdate(element.id, { 
        width: newWidth, 
        height: newHeight,
        x: newX,
        y: newY
      });
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, elementStart, sizeStart, element, canvasBounds, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      onSelect(element.id);
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setElementStart({ x: element.x, y: element.y });
    }
  }, [element.id, element.x, element.y, onSelect]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      const newX = Math.max(0, Math.min(canvasBounds.width - element.width, elementStart.x + deltaX));
      const newY = Math.max(0, Math.min(canvasBounds.height - element.height, elementStart.y + deltaY));
      
      onUpdate(element.id, { x: newX, y: newY });
    }
  }, [isDragging, dragStart, elementStart, element, canvasBounds, onUpdate]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderElement = () => {
    const commonStyle = {
      width: "100%",
      height: "100%",
      cursor: isDragging ? "grabbing" : "grab",
      touchAction: "none",
    };

    if (element.type === "image" && element.src) {
      return (
        <img
          src={element.src}
          alt="Canvas element"
          style={commonStyle}
          className="object-contain select-none w-full h-full"
          draggable={false}
        />
      );
    }

    if (element.type === "text") {
      return (
        <div
          style={{
            ...commonStyle,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textAlign: element.textAlign,
            color: element.color,
            display: "flex",
            alignItems: "center",
            justifyContent: element.textAlign === "left" ? "flex-start" : 
                           element.textAlign === "right" ? "flex-end" : "center",
            padding: "4px",
            userSelect: "none",
            wordBreak: "break-word",
            lineHeight: "1.2",
          }}
          className="select-none"
        >
          {element.text}
        </div>
      );
    }

    if (element.type === "shape") {
      if (element.shapeType === "circle") {
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: element.fill,
              border: `2px solid ${element.stroke || "#000000"}`,
              borderRadius: "50%",
            }}
            className="select-none"
          />
        );
      } else {
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: element.fill,
              border: `2px solid ${element.stroke || "#000000"}`,
              borderRadius: "4px",
            }}
            className="select-none"
          />
        );
      }
    }

    return null;
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "absolute select-none group",
        isSelected && "ring-2 ring-[#00C19D] ring-opacity-50"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: "center center",
        zIndex: element.zIndex + 10,
      }}
    >
      {/* Element Content */}
      <div className="relative w-full h-full">
        {renderElement()}
      </div>

      {/* Selection Handles - Only visible when selected */}
      {isSelected && (
        <>
          {/* Selection outline */}
          <div className="absolute inset-0 border-2 border-[#00C19D] border-dashed pointer-events-none opacity-50" />
          
          {/* Corner resize handles */}
          <div
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-nw-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "top-left")}
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-ne-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "top-right")}
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-sw-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-se-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
          />

          {/* Side resize handles */}
          <div
            className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-n-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "top")}
          />
          <div
            className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-s-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "bottom")}
          />
          <div
            className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-w-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "left")}
          />
          <div
            className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#00C19D] border-2 border-white rounded-full cursor-e-resize shadow-sm"
            onMouseDown={(e) => handleResizeStart(e, "right")}
          />

          {/* Action buttons - positioned relative to the container */}
          <div className="absolute -top-10 left-0 flex space-x-1 z-50">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(element.id, { rotation: (element.rotation + 90) % 360 });
              }}
              className="h-6 w-6 p-0 bg-white hover:bg-gray-100 border border-gray-300 shadow-sm"
            >
              <RotateCw className="w-3 h-3" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="h-6 w-6 p-0 bg-white hover:bg-red-50 border border-gray-300 text-red-500 shadow-sm"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}