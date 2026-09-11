import type { ToolMode } from "@/components/canvas/ToolControls/types";

export interface DrawingToolbarProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  onClear: () => void;
}
