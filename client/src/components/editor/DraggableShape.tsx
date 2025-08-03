import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface DraggableShapeProps {
  id: string;
  shapeType: "rectangle" | "circle";
  fill: string;
  position: Position;
  size: Size;
  rotation: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, deltaX: number, deltaY: number) => void;
  onResize: (id: string, newWidth: number, newHeight: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
  canvasBounds: { width: number; height: number };
}

export function DraggableShape({
  id,
  shapeType,
  fill,
  position,
  size,
  rotation,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onRotate,
  onDelete,
  canvasBounds,
}: DraggableShapeProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState<Size>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.target === containerRef.current || (e.target as Element).closest('.shape-content')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      onSelect(id);
    }
  }, [position, id, onSelect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging && !isResizing) {
      e.preventDefault();
      const newX = Math.max(0, Math.min(canvasBounds.width - size.width, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(canvasBounds.height - size.height, e.clientY - dragStart.y));
      onMove(id, newX - position.x, newY - position.y);
    }
  }, [isDragging, isResizing, dragStart, canvasBounds, size, position, id, onMove]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Handle resize handles
  const handleResizeStart = useCallback((e: React.PointerEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: size.width, height: size.height });
    onSelect(id);
  }, [size, id, onSelect]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!isResizing || !resizeHandle) return;

    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    let newWidth = initialSize.width;
    let newHeight = initialSize.height;

    switch (resizeHandle) {
      case 'nw':
        newWidth = Math.max(20, initialSize.width - deltaX);
        newHeight = Math.max(20, initialSize.height - deltaY);
        break;
      case 'ne':
        newWidth = Math.max(20, initialSize.width + deltaX);
        newHeight = Math.max(20, initialSize.height - deltaY);
        break;
      case 'sw':
        newWidth = Math.max(20, initialSize.width - deltaX);
        newHeight = Math.max(20, initialSize.height + deltaY);
        break;
      case 'se':
        newWidth = Math.max(20, initialSize.width + deltaX);
        newHeight = Math.max(20, initialSize.height + deltaY);
        break;
      case 'n':
        newHeight = Math.max(20, initialSize.height - deltaY);
        break;
      case 's':
        newHeight = Math.max(20, initialSize.height + deltaY);
        break;
      case 'w':
        newWidth = Math.max(20, initialSize.width - deltaX);
        break;
      case 'e':
        newWidth = Math.max(20, initialSize.width + deltaX);
        break;
    }

    // Constrain to canvas bounds
    newWidth = Math.min(newWidth, canvasBounds.width - position.x);
    newHeight = Math.min(newHeight, canvasBounds.height - position.y);

    onResize(id, newWidth, newHeight);
  }, [isResizing, resizeHandle, dragStart, initialSize, canvasBounds, position, id, onResize]);

  // Add event listeners for pointer move and up
  React.useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalPointerMove = (e: PointerEvent) => {
        if (isDragging) {
          const newX = Math.max(0, Math.min(canvasBounds.width - size.width, e.clientX - dragStart.x));
          const newY = Math.max(0, Math.min(canvasBounds.height - size.height, e.clientY - dragStart.y));
          onMove(id, newX - position.x, newY - position.y);
        } else if (isResizing && resizeHandle) {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;

          let newWidth = initialSize.width;
          let newHeight = initialSize.height;

          switch (resizeHandle) {
            case 'nw':
              newWidth = Math.max(20, initialSize.width - deltaX);
              newHeight = Math.max(20, initialSize.height - deltaY);
              break;
            case 'ne':
              newWidth = Math.max(20, initialSize.width + deltaX);
              newHeight = Math.max(20, initialSize.height - deltaY);
              break;
            case 'sw':
              newWidth = Math.max(20, initialSize.width - deltaX);
              newHeight = Math.max(20, initialSize.height + deltaY);
              break;
            case 'se':
              newWidth = Math.max(20, initialSize.width + deltaX);
              newHeight = Math.max(20, initialSize.height + deltaY);
              break;
            case 'n':
              newHeight = Math.max(20, initialSize.height - deltaY);
              break;
            case 's':
              newHeight = Math.max(20, initialSize.height + deltaY);
              break;
            case 'w':
              newWidth = Math.max(20, initialSize.width - deltaX);
              break;
            case 'e':
              newWidth = Math.max(20, initialSize.width + deltaX);
              break;
          }

          newWidth = Math.min(newWidth, canvasBounds.width - position.x);
          newHeight = Math.min(newHeight, canvasBounds.height - position.y);

          onResize(id, newWidth, newHeight);
        }
      };

      const handleGlobalPointerUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
      };

      document.addEventListener('pointermove', handleGlobalPointerMove);
      document.addEventListener('pointerup', handleGlobalPointerUp);

      return () => {
        document.removeEventListener('pointermove', handleGlobalPointerMove);
        document.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, initialSize, canvasBounds, size, position, id, onMove, onResize]);

  const resizeHandles = [
    { id: 'nw', className: 'cursor-nw-resize', style: { top: -6, left: -6 } },
    { id: 'ne', className: 'cursor-ne-resize', style: { top: -6, right: -6 } },
    { id: 'sw', className: 'cursor-sw-resize', style: { bottom: -6, left: -6 } },
    { id: 'se', className: 'cursor-se-resize', style: { bottom: -6, right: -6 } },
    { id: 'n', className: 'cursor-n-resize', style: { top: -6, left: '50%', transform: 'translateX(-50%)' } },
    { id: 's', className: 'cursor-s-resize', style: { bottom: -6, left: '50%', transform: 'translateX(-50%)' } },
    { id: 'w', className: 'cursor-w-resize', style: { top: '50%', left: -6, transform: 'translateY(-50%)' } },
    { id: 'e', className: 'cursor-e-resize', style: { top: '50%', right: -6, transform: 'translateY(-50%)' } },
  ];

  return (
    <div
      ref={containerRef}
      className={`absolute select-none touch-none ${isSelected ? 'z-10' : 'z-0'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center'
      }}
    >
      {/* Shape Content */}
      <div
        className={cn(
          "shape-content w-full h-full border-2",
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          isSelected ? 'border-blue-500' : 'border-transparent',
          shapeType === 'circle' ? 'rounded-full' : ''
        )}
        style={{ 
          backgroundColor: fill,
          userSelect: 'none'
        }}
        onPointerDown={handlePointerDown}
      />

      {/* Selection Outline */}
      {isSelected && (
        <div
          className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none"
          style={{
            borderRadius: shapeType === 'circle' ? '50%' : '0'
          }}
        />
      )}

      {/* Resize Handles */}
      {isSelected && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle.id}
              className={cn(
                "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full hover:bg-blue-600 transition-colors",
                handle.className
              )}
              style={handle.style}
              onPointerDown={(e) => handleResizeStart(e, handle.id)}
            />
          ))}

          {/* Control Buttons */}
          <div className="absolute -top-12 left-0 flex items-center space-x-1 bg-white rounded-lg shadow-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRotate(id, rotation + 90)}
              className="h-8 w-8 p-0"
              title={t({ ko: '회전', en: 'Rotate', ja: '回転', zh: '旋转' })}
            >
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title={t({ ko: '삭제', en: 'Delete', ja: '削除', zh: '删除' })}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}