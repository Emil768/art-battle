export interface TimerBadgeProps {
  endsAt: string;
  onExpire?: () => void;
  tone?: "auto" | "pink";
}
