import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { TODAY, addDays, fmt } from "../../constants/data";
import { CATEGORY, FONTS, P } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
// All numbers are computed live from the real task list.
// No hardcoded data — weekly chart and streak both reflect actual history.

export default function StatsScreen() {
  const { tasks } = useTasks();

  // ── Overall completion rate ───────────────────────────────────────────────
  const totalDone = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const rate =
    totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100);

  // ── Streak ────────────────────────────────────────────────────────────────
  // Walk backwards day by day from today.
  // A day "counts" if it has at least one completed task.
  // Stop as soon as we hit a day with no completed tasks.
  let streak = 0;
  let checkDate = new Date(TODAY);
  while (true) {
    const dateStr = fmt(checkDate);
    const daysDone = tasks.filter((t) => t.date === dateStr && t.done).length;
    if (daysDone === 0) break;
    streak++;
    checkDate = addDays(checkDate, -1); // step back one day
    if (streak > 365) break; // safety cap
  }

  // ── Weekly chart data ─────────────────────────────────────────────────────
  // Build stats for the last 7 days (today + 6 days back).
  // Each entry has: day label, done count, total count.
  const weeklyStats = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(TODAY, -(6 - i)); // oldest day first
    const dateStr = fmt(date);
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3),
      done: dayTasks.filter((t) => t.done).length,
      total: dayTasks.length,
      isToday: dateStr === fmt(TODAY),
    };
  });

  const maxTotal = Math.max(...weeklyStats.map((d) => d.total), 1); // min 1 avoids divide-by-zero

  // ── Per-category stats ────────────────────────────────────────────────────
  const catStats = (["Work", "Personal", "Health"] as const).map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const catDone = catTasks.filter((t) => t.done).length;
    return {
      cat,
      done: catDone,
      total: catTasks.length,
      pct:
        catTasks.length === 0
          ? 0
          : Math.round((catDone / catTasks.length) * 100),
    };
  });

  // ── SVG mini-ring ─────────────────────────────────────────────────────────
  const ringR = 20;
  const ringCirc = 2 * Math.PI * ringR;
  const ringCx = 26;
  const ringCy = 26;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
          <Text style={styles.subtitle}>Your productivity at a glance</Text>
        </View>

        {/* ── Row 1: Streak card + Completion rate ─────────────── */}
        <View style={styles.topRow}>
          {/* Streak card — shows real consecutive-day streak */}
          <LinearGradient
            colors={[P.plum, "#7B52AB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            {/* Emoji changes based on streak length for a fun reward feel */}
            <Text style={styles.streakEmoji}>
              {streak === 0
                ? "🌱"
                : streak < 3
                  ? "✨"
                  : streak < 7
                    ? "🔥"
                    : "🏆"}
            </Text>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </LinearGradient>

          {/* Completion rate card */}
          <View style={styles.rateCard}>
            <Svg width={52} height={52}>
              <Circle
                cx={ringCx}
                cy={ringCy}
                r={ringR}
                fill="none"
                stroke={P.border}
                strokeWidth={5}
              />
              <Circle
                cx={ringCx}
                cy={ringCy}
                r={ringR}
                fill="none"
                stroke={P.sage}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`${ringCirc * (rate / 100)} ${ringCirc}`}
                rotation={-90}
                originX={ringCx}
                originY={ringCy}
              />
              <SvgText
                x={ringCx}
                y={ringCy + 5}
                textAnchor="middle"
                fill={P.textDark}
                fontSize="12"
                fontFamily={FONTS.sansBold}
              >
                {rate}%
              </SvgText>
            </Svg>
            <Text style={styles.rateLabel}>Completion</Text>
          </View>
        </View>

        {/* ── Row 2: Weekly bar chart (real data) ──────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last 7 Days</Text>
          <View style={styles.barChart}>
            {weeklyStats.map((d, i) => {
              // barH: height of the total-tasks bar as % of max
              const barH = Math.round((d.total / maxTotal) * 100);
              // fillH: completed portion within that bar
              const fillH =
                d.total === 0 ? 0 : Math.round((d.done / d.total) * 100);

              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barContainer}>
                    {d.total === 0 ? (
                      // No tasks that day — show a faint placeholder bar
                      <View style={styles.barEmpty} />
                    ) : (
                      <View
                        style={[styles.barTrack, { height: `${barH}%` as any }]}
                      >
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${fillH}%` as any,
                              backgroundColor: d.isToday ? P.plum : P.lavender,
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.barLabel, d.isToday && styles.barLabelToday]}
                  >
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: P.lavender }]}
              />
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: P.plumLight }]}
              />
              <Text style={styles.legendText}>Total</Text>
            </View>
          </View>
        </View>

        {/* ── Row 3: Category breakdown ────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>By Category</Text>
          {catStats.map((cs) => {
            const cc = CATEGORY[cs.cat];
            return (
              <View key={cs.cat} style={styles.catRow}>
                <View style={styles.catMeta}>
                  <Text style={styles.catName}>{cs.cat}</Text>
                  <Text style={styles.catCount}>
                    {cs.done}/{cs.total}
                  </Text>
                </View>
                <View style={styles.catTrack}>
                  <View
                    style={[
                      styles.catFill,
                      { width: `${cs.pct}%` as any, backgroundColor: cc.text },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.lilac },
  content: { paddingHorizontal: 18, paddingBottom: 20 },
  header: { paddingTop: 28, marginBottom: 20 },
  title: { fontSize: 30, fontFamily: FONTS.serif, color: P.textDark },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.sans,
    color: P.textSoft,
    marginTop: 4,
  },

  topRow: { flexDirection: "row", gap: 12, marginBottom: 16 },

  streakCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  streakEmoji: { fontSize: 32 },
  streakNum: {
    fontSize: 28,
    fontFamily: FONTS.sansBold,
    color: "white",
    marginTop: 6,
  },
  streakLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  rateCard: {
    flex: 1,
    backgroundColor: P.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: P.border,
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 10,
  },

  card: {
    backgroundColor: P.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: P.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 100,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barContainer: { width: "100%", height: 80, justifyContent: "flex-end" },
  barTrack: {
    width: "100%",
    backgroundColor: P.plumLight,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 5 },
  barEmpty: {
    width: "100%",
    height: 4,
    backgroundColor: P.border,
    borderRadius: 5,
  },
  barLabel: { fontSize: 10, fontFamily: FONTS.sansMed, color: P.textSoft },
  barLabelToday: { fontFamily: FONTS.sansBold, color: P.plum },

  legend: { flexDirection: "row", gap: 16, marginTop: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: P.textSoft, fontFamily: FONTS.sans },

  catRow: { marginBottom: 16 },
  catMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catName: { fontSize: 13, fontFamily: FONTS.sansSemi, color: P.textDark },
  catCount: { fontSize: 12, fontFamily: FONTS.sans, color: P.textSoft },
  catTrack: {
    height: 8,
    backgroundColor: P.lilac,
    borderRadius: 4,
    overflow: "hidden",
  },
  catFill: { height: "100%", borderRadius: 4 },
});
