export interface DrawingCanvasHandle {
  exportBlob: () => Promise<Blob | null>;
  clear: () => void;
  isDirty: () => boolean;
}

export interface DrawingCanvasProps {
  mode: "pencil" | "pen" | "eraser";
  color: string;
  lineWidth: number;
  onDirtyChange?: (dirty: boolean) => void;
  onStroke?: () => void;
}
