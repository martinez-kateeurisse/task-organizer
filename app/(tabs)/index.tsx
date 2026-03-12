import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import EditTaskModal from "../../components/EditTaskModal";
import TaskRow from "../../components/TaskRow";
import { fmt, Task, TODAY } from "../../constants/data";
import { FONTS, P } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── DASHBOARD SCREEN ─────────────────────────────────────────────────────────
// Home tab: greeting, circular progress ring, stat chips, today's task list.
// useTasks() pulls tasks and toggleTask from TaskContext — no props needed.

export default function DashboardScreen() {
  const { tasks, toggleTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = fmt(TODAY);
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const done = todayTasks.filter((t) => t.done).length;
  const total = todayTasks.length;
  const pct = total === 0 ? 0 : done / total;

  // SVG ring math — r=38, circumference = 2π × 38 ≈ 238.76
  const R = 38;
  const circ = 2 * Math.PI * R;
  const cx = R + 10; // center x/y within the SVG viewport
  const cy = R + 10;

  const dateStr = TODAY.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hr = TODAY.getHours();
  const greeting =
    hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  const statChips = [
    {
      label: "Pending",
      value: tasks.filter((t) => !t.done).length,
      color: P.plum,
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.done).length,
      color: P.sage,
    },
    { label: "Total", value: tasks.length, color: P.lavender },
  ];

  return (
    // SafeAreaView respects the notch and home indicator so content isn't clipped
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.greeting}>{greeting} 🌿</Text>
        </View>

        {/* Progress card — LinearGradient replaces CSS radial-gradient */}
        <LinearGradient
          colors={[P.plum, "#3D2855"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.progressCard}
        >
          {/* SVG circular progress ring */}
          <Svg width={cx * 2} height={cy * 2}>
            {/* Grey track — the full circle in the background */}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={7}
            />
            {/* Sage arc — only draws pct fraction of the circle.
                rotation={-90} makes the arc start at 12 o'clock instead of 3 o'clock */}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={P.sage}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${circ * pct} ${circ}`}
              rotation={-90}
              originX={cx}
              originY={cy}
            />
            {/* Done count centered in the ring */}
            <SvgText
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="white"
              fontFamily={FONTS.sansBold}
              fontSize="15"
            >
              {done}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontFamily={FONTS.sans}
              fontSize="11"
            >
              of {total}
            </SvgText>
          </Svg>

          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressValue}>
              {done === total && total > 0
                ? "All done! 🎉"
                : `${total - done} remaining`}
            </Text>
            {/* Slim progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
            </View>
            <Text style={styles.progressPct}>
              {Math.round(pct * 100)}% complete
            </Text>
          </View>
        </LinearGradient>

        {/* Stat chips row */}
        <View style={styles.chipsRow}>
          {statChips.map((s) => (
            <View key={s.label} style={styles.chip}>
              <Text style={[styles.chipValue, { color: s.color }]}>
                {s.value}
              </Text>
              <Text style={styles.chipLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today task list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.sectionCount}>{total} tasks</Text>
        </View>
        {todayTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            onToggle={toggleTask}
            onEdit={setEditingTask}
          />
        ))}
      </ScrollView>

      {/* EditTaskModal sits outside ScrollView so it overlays the whole screen */}
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.lilac,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 28,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    color: P.textSoft,
    fontFamily: FONTS.sansBold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: 30,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginTop: 4,
    lineHeight: 36,
  },
  progressCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    // iOS shadow
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    // Android shadow
    elevation: 10,
  },
  progressText: {
    flex: 1,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  progressValue: {
    color: "white",
    fontSize: 20,
    fontFamily: FONTS.serif,
    lineHeight: 26,
  },
  progressTrack: {
    height: 4,
    width: 140,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden", // clips the fill bar to the track's rounded corners
  },
  progressFill: {
    height: "100%",
    backgroundColor: P.sage,
    borderRadius: 4,
  },
  progressPct: {
    color: P.sage,
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    marginTop: 5,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    flex: 1,
    backgroundColor: P.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: P.border,
  },
  chipValue: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
  },
  chipLabel: {
    fontSize: 10,
    color: P.textSoft,
    fontFamily: FONTS.sansBold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: P.textDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 12,
    color: P.textSoft,
    fontFamily: FONTS.sans,
  },
});
