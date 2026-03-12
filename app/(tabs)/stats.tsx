import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { TODAY, WEEKLY_STATS } from "../../constants/data";
import { CATEGORY, FONTS, P } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
// Three sections:
//   1. Streak card (gradient) + completion rate mini-ring
//   2. Weekly bar chart
//   3. Per-category progress bars

export default function StatsScreen() {
  const { tasks } = useTasks();

  const totalDone = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const rate =
    totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100);

  // The tallest bar gets full height; others scale relative to it
  const maxTotal = Math.max(...WEEKLY_STATS.map((d) => d.total));

  // Per-category stats computed from the live task list
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

  // Mini completion-rate SVG ring
  const ringR = 20;
  const ringCirc = 2 * Math.PI * ringR;
  const ringCx = 26;
  const ringCy = 26;

  // Today's 3-letter day label for highlighting in the bar chart
  const todayLabel = TODAY.toLocaleDateString("en-US", {
    weekday: "short",
  }).slice(0, 3);

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
          {/* Streak card — gradient for a reward feel */}
          <LinearGradient
            colors={[P.plum, "#7B52AB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNum}>7</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </LinearGradient>

          {/* Completion rate card */}
          <View style={styles.rateCard}>
            <Svg width={52} height={52}>
              {/* Background track */}
              <Circle
                cx={ringCx}
                cy={ringCy}
                r={ringR}
                fill="none"
                stroke={P.border}
                strokeWidth={5}
              />
              {/* Filled arc */}
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

        {/* ── Row 2: Weekly bar chart ──────────────────────────────
            Each day has a background bar (total) and a fill bar (completed).
            BAR_HEIGHT = fixed container height; each bar scales within it. */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.barChart}>
            {WEEKLY_STATS.map((d) => {
              const isToday = d.day === todayLabel;
              // barH: how tall the total-tasks bar is as a % of the container
              const barH = Math.round((d.total / maxTotal) * 100);
              // fillH: what fraction of the bar is completed
              const fillH =
                d.total === 0 ? 0 : Math.round((d.done / d.total) * 100);

              return (
                <View key={d.day} style={styles.barCol}>
                  {/* The bar lives in a fixed-height container; height is a % string */}
                  <View style={styles.barContainer}>
                    <View
                      style={[styles.barTrack, { height: `${barH}%` as any }]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${fillH}%` as any,
                            backgroundColor: isToday ? P.plum : P.lavender,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text
                    style={[styles.barLabel, isToday && styles.barLabelToday]}
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

        {/* ── Row 3: Category breakdown bars ──────────────────── */}
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
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barContainer: {
    width: "100%",
    height: 80,
    justifyContent: "flex-end", // bars grow upward from the bottom
  },
  barTrack: {
    width: "100%",
    backgroundColor: P.plumLight,
    borderRadius: 5,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 5,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: FONTS.sansMed,
    color: P.textSoft,
  },
  barLabelToday: {
    fontFamily: FONTS.sansBold,
    color: P.plum,
  },
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
  catFill: {
    height: "100%",
    borderRadius: 4,
  },
});
