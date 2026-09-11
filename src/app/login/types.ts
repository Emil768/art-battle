import type { CSSProperties } from "react";

export interface LoginStep {
  n: number;
  title: string;
  text: string;
  tile: string;
  tileText: string;
  card: CSSProperties;
}

export interface LoginViewProps {
  steps: LoginStep[];
}
