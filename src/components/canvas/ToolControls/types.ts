export type ToolMode = "pencil" | "pen" | "eraser";

export interface ToolControlsProps {
  mode: ToolMode;
  onModeChange: (mode: ToolMode) => void;
  onClear: () => void;
}
