export interface FireCursorOptions {
  tiltDeg?: number;
  zIndex?: number;
}

export interface FireCursorHandle {
  getContactPoint: () => { x: number; y: number };
  destroy: () => void;
}

export declare function createFireCursor(
  targetEl: HTMLElement,
  opts?: FireCursorOptions,
): FireCursorHandle;
