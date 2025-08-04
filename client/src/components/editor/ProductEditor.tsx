import React, { useRef, useEffect, useCallback } from "react";
import { CanvasElement, CanvasSize } from "./EditorLayout";
import { DraggableElement } from "@/components/DraggableElement";
import { DraggableShape } from "./DraggableShape";

interface ProductEditorProps {
  canvasSize: CanvasSize;
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export function ProductEditor({
  canvasSize,
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  canvasRef: externalRef,
}: ProductEditorProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalRef ?? internalRef;

  // Click outside to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelectElement(null);
      }
    },
    [onSelectElement, canvasRef],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElement) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          onDeleteElement(selectedElement);
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onSelectElement(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement, onDeleteElement, onSelectElement]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="relative">
        {/* Canvas Container */}
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg border-2 border-dashed border-gray-300 overflow-visible"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            minWidth: canvasSize.width,
            minHeight: canvasSize.height,
          }}
          onClick={handleCanvasClick}
        >
          {/* Canvas Grid Background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Template Outline */}
          <div className="absolute inset-0 border-2 border-dashed border-gray-400 pointer-events-none" />

          {/* Canvas Elements */}
          {elements
            .filter((el) => el.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => {
              if (element.type === "shape") {
                return (
                  <DraggableShape
                    key={element.id}
                    id={element.id}
                    shapeType={element.shapeType || "rectangle"}
                    fill={element.fill || "#FF0000"}
                    position={{ x: element.x, y: element.y }}
                    size={{ width: element.width, height: element.height }}
                    rotation={element.rotation}
                    isSelected={selectedElement === element.id}
                    onSelect={onSelectElement}
                    onMove={(id, deltaX, deltaY) => {
                      onUpdateElement(id, {
                        x: element.x + deltaX,
                        y: element.y + deltaY,
                      });
                    }}
                    onResize={(id, newWidth, newHeight) => {
                      onUpdateElement(id, {
                        width: newWidth,
                        height: newHeight,
                      });
                    }}
                    onRotate={(id, rotation) => {
                      onUpdateElement(id, { rotation });
                    }}
                    onDelete={onDeleteElement}
                    canvasBounds={canvasSize}
                  />
                );
              } else {
                return (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElement === element.id}
                    onSelect={onSelectElement}
                    onUpdate={onUpdateElement}
                    onDelete={onDeleteElement}
                    canvasBounds={canvasSize}
                  />
                );
              }
            })}

          {/* Empty State */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-center">
                <div className="text-sm font-medium mb-1">
                  여기에 이미지나 텍스트를 추가해보세요
                </div>
                <div className="text-xs text-gray-400">
                  {canvasSize.widthMM}mm × {canvasSize.heightMM}mm
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Info */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <div className="text-xs text-gray-500">
            캔버스: {canvasSize.widthMM}mm × {canvasSize.heightMM}mm (
            {canvasSize.width}px × {canvasSize.height}px)
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute -bottom-8 right-0 flex items-center space-x-2 text-xs text-gray-500">
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
