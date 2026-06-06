import { Badge } from "./Badge";

type Conf = "high" | "medium" | "low";

const META: Record<Conf, { label: string; color: string; bg: string }> = {
  high: { label: "sigur", color: "#34D399", bg: "rgba(52,211,153,0.14)" },
  medium: { label: "verifică", color: "#FBBF24", bg: "rgba(251,191,36,0.14)" },
  low: { label: "necesită verificare", color: "#F87171", bg: "rgba(248,113,113,0.14)" },
};

export function ConfidenceBadge({ level }: { level: Conf }) {
  const m = META[level];
  return <Badge label={m.label} color={m.color} bg={m.bg} />;
}
