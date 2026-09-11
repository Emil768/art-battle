import type { DrawingToolbarProps } from "@/components/room/DrawingToolbar/types";

export interface DrawingToolbarMobileProps extends DrawingToolbarProps {
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled: boolean;
}
