import { View, Text } from "react-native";
import Svg, { Path, Circle, Line as SvgLine, Defs, LinearGradient, Stop } from "react-native-svg";
import { AppCard } from "@/components/ui/AppCard";
import { colors } from "@/constants/theme";

export type TrendPoint = { label: string; value: number };

/**
 * Grafic liniar pentru evoluția unei valori (ex: consum L/100km între plinuri).
 * SVG pur. Afișează linie + arie + puncte, cu min/max în antet.
 */
export function TrendLineChart({
  data,
  title = "Evoluție",
  unit = "",
  color = colors.ok,
  height = 170,
  decimals = 1,
}: {
  data: TrendPoint[];
  title?: string;
  unit?: string;
  color?: string;
  height?: number;
  decimals?: number;
}) {
  const W = 320;
  const padX = 6;
  const padTop = 10;
  const padBottom = 22;
  const chartH = height - padBottom - padTop;

  if (data.length < 2) {
    return (
      <AppCard>
        <Text className="text-ink font-semibold mb-1">{title}</Text>
        <Text className="text-ink-faint text-sm">
          Mai sunt necesare cel puțin 2 alimentări „plin complet" pentru a calcula tendința.
        </Text>
      </AppCard>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (W - padX * 2) / (data.length - 1);

  const coords = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padTop + (1 - (d.value - min) / range) * chartH;
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(padTop + chartH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <AppCard>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-ink font-semibold">{title}</Text>
        <Text className="text-ink-faint text-xs">
          medie {avg.toFixed(decimals)} {unit}
        </Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}>
        <Defs>
          <LinearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.30" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {/* grilă orizontală */}
        {[0, 0.5, 1].map((t) => (
          <SvgLine key={t} x1={padX} y1={padTop + t * chartH} x2={W - padX} y2={padTop + t * chartH} stroke={colors.line} strokeWidth="1" strokeDasharray="3 5" />
        ))}
        <Path d={areaPath} fill="url(#trendArea)" />
        <Path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r="3.5" fill={colors.bg} stroke={color} strokeWidth="2" />
        ))}
      </Svg>
      <View className="flex-row justify-between mt-1">
        <Text className="text-ink-faint text-[10px]">{data[0].label}</Text>
        <Text className="text-ink-faint text-[10px]">{data[data.length - 1].label}</Text>
      </View>
    </AppCard>
  );
}
