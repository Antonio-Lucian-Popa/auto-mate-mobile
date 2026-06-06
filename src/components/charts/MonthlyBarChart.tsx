import { View, Text } from "react-native";
import Svg, { Rect, Line as SvgLine, Defs, LinearGradient, Stop } from "react-native-svg";
import { AppCard } from "@/components/ui/AppCard";
import { colors } from "@/constants/theme";
import { formatRON } from "@/lib/format";

export type BarDatum = { label: string; value: number };

/**
 * Grafic cu bare pentru evoluția lunară (ex: costuri RON / lună).
 * SVG pur, fără dependențe externe. Înălțime fixă, lățime responsivă.
 */
export function MonthlyBarChart({
  data,
  title = "Evoluție lunară",
  color = colors.brand,
  height = 160,
}: {
  data: BarDatum[];
  title?: string;
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 320;
  const padBottom = 22;
  const chartH = height - padBottom;
  const gap = 10;
  const barW = data.length > 0 ? (W - gap * (data.length - 1)) / data.length : 0;
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);

  return (
    <AppCard>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-ink font-semibold">{title}</Text>
        {peak && peak.value > 0 ? (
          <Text className="text-ink-faint text-xs">max {formatRON(peak.value)}</Text>
        ) : null}
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.35" />
          </LinearGradient>
        </Defs>
        {/* linie de bază */}
        <SvgLine x1="0" y1={chartH} x2={W} y2={chartH} stroke={colors.line} strokeWidth="1" />
        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max(3, (d.value / max) * (chartH - 6)) : 2;
          const x = i * (barW + gap);
          const y = chartH - h;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={Math.min(6, barW / 3)}
              fill={d.value > 0 ? "url(#barGrad)" : colors.line}
            />
          );
        })}
      </Svg>
      <View className="flex-row mt-1" style={{ gap }}>
        {data.map((d, i) => (
          <Text key={i} className="text-ink-faint text-[10px] text-center" style={{ width: barW }} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </AppCard>
  );
}
