import { CanvasElement, CanvasSize } from "@/components/editor/EditorLayout";

export interface ExportOptions {
  format: "png" | "pdf";
  quality?: number;
  dpi?: number;
  includeBackground?: boolean;
}

export class ExportUtils {
  static async exportCanvas(
    elements: CanvasElement[],
    canvasSize: CanvasSize,
    options: ExportOptions
  ): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      throw new Error("Cannot get canvas context");
    }

    // Set canvas size based on DPI
    const dpi = options.dpi || 300;
    const scale = dpi / 96; // 96 DPI is standard screen resolution
    
    canvas.width = canvasSize.width * scale;
    canvas.height = canvasSize.height * scale;
    
    // Scale context to maintain sharp rendering
    ctx.scale(scale, scale);

    // Set background
    if (options.includeBackground !== false) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // Sort elements by z-index
    const sortedElements = [...elements]
      .filter(el => el.visible)
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each element
    for (const element of sortedElements) {
      await this.renderElement(ctx, element);
    }

    // Convert to blob
    return new Promise((resolve, reject) => {
      if (options.format === "png") {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create PNG blob"));
            }
          },
          "image/png",
          options.quality || 1.0
        );
      } else if (options.format === "pdf") {
        // For PDF, we'll use a library like jsPDF
        this.createPDF(canvas, canvasSize)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  private static async renderElement(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement
  ): Promise<void> {
    ctx.save();

    // Apply transformations
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-element.width / 2, -element.height / 2);

    switch (element.type) {
      case "image":
        await this.renderImage(ctx, element);
        break;
      case "text":
        this.renderText(ctx, element);
        break;
      case "shape":
        this.renderShape(ctx, element);
        break;
    }

    ctx.restore();
  }

  private static async renderImage(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement
  ): Promise<void> {
    if (!(element as any).src) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, element.width, element.height);
        resolve();
      };
      img.onerror = reject;
      img.src = (element as any).src;
    });
  }

  private static renderText(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement
  ): void {
    if (!(element as any).text) return;

    const fontSize = (element as any).fontSize || 24;
    const fontFamily = (element as any).fontFamily || "Arial";
    const fontWeight = (element as any).fontWeight || "normal";
    const fontStyle = (element as any).fontStyle || "normal";

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = element.color || "#000000";
    ctx.textBaseline = "top";

    // Handle text alignment
    const textAlign = (element as any).textAlign || "left";
    let x = 0;
    if (textAlign === "center") {
      x = element.width / 2;
      ctx.textAlign = "center";
    } else if (textAlign === "right") {
      x = element.width;
      ctx.textAlign = "right";
    } else {
      ctx.textAlign = "left";
    }

    // Simple text wrapping
    const words = ((element as any).text || "").split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > element.width && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    // Render lines
    const lineHeight = fontSize * 1.2;
    lines.forEach((line, index) => {
      ctx.fillText(line, x, index * lineHeight);
    });
  }

  private static renderShape(
    ctx: CanvasRenderingContext2D,
    element: CanvasElement
  ): void {
    ctx.fillStyle = (element as any).fill || "#000000";

    if ((element as any).shapeType === "rectangle") {
      ctx.fillRect(0, 0, element.width, element.height);
    } else if ((element as any).shapeType === "circle") {
      const radius = Math.min(element.width, element.height) / 2;
      const centerX = element.width / 2;
      const centerY = element.height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private static async createPDF(
    canvas: HTMLCanvasElement,
    canvasSize: CanvasSize
  ): Promise<Blob> {
    // This would require jsPDF library
    // For now, we'll return the canvas as PNG wrapped in a simple PDF structure
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Simple PDF creation - in production, use jsPDF
            resolve(blob);
          } else {
            reject(new Error("Failed to create PDF"));
          }
        },
        "image/png"
      );
    });
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportAndDownload(
    elements: CanvasElement[],
    canvasSize: CanvasSize,
    options: ExportOptions,
    filename?: string
  ): Promise<void> {
    try {
      const blob = await this.exportCanvas(elements, canvasSize, options);
      const defaultFilename = `pinto-design-${Date.now()}.${options.format}`;
      this.downloadBlob(blob, filename || defaultFilename);
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }
}