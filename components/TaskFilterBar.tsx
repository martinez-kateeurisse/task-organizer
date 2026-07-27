import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONTS, Palette } from "../constants/theme";
import { useStyles } from "../context/ThemeContext";
import {
  PriorityFilter,
  SORT_LABELS,
  SortBy,
  StatusFilter,
} from "../hooks/useTaskFilters";

// ─── TASK FILTER BAR ──────────────────────────────────────────────────────────
// The priority row plus the status/sort row, shared by Dashboard and Calendar.
// Stateless — the caller owns the values via useTaskFilters().

interface Props {
  priorityFilter: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: SortBy;
  onCycleSort: () => void;
}

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "All",
  pending: "Pending",
  done: "Done",
};

export default function TaskFilterBar({
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onCycleSort,
}: Props) {
  const { P, PRIORITY, styles } = useStyles(makeStyles);
  return (
    <>
      {/* Priority filter badges */}
      <View style={styles.filterRow}>
        {(["all", "high", "medium", "low"] as const).map((f) => {
          const active = priorityFilter === f;
          const color = f === "all" ? P.plum : PRIORITY[f].dot;
          const bg = f === "all" ? P.plumLight : PRIORITY[f].bg;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => onPriorityChange(f)}
              activeOpacity={0.7}
              style={[
                styles.filterBadge,
                active && { backgroundColor: bg, borderColor: color },
              ]}
            >
              {f !== "all" && (
                <View
                  style={[
                    styles.filterDot,
                    { backgroundColor: active ? color : P.border },
                  ]}
                />
              )}
              <Text style={[styles.filterText, active && { color }]}>
                {f === "all" ? "All" : PRIORITY[f].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Status filter + Sort row */}
      <View style={styles.filterRow}>
        {(["all", "pending", "done"] as const).map((s) => {
          const active = statusFilter === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => onStatusChange(s)}
              activeOpacity={0.7}
              style={[
                styles.filterBadge,
                active && {
                  backgroundColor: P.plumLight,
                  borderColor: P.plum,
                },
              ]}
            >
              <Text style={[styles.filterText, active && { color: P.plum }]}>
                {STATUS_LABELS[s]}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={onCycleSort}
          activeOpacity={0.7}
          style={[
            styles.filterBadge,
            { borderColor: P.lavender, backgroundColor: P.lavenderLight },
          ]}
        >
          <Ionicons name="swap-vertical-outline" size={12} color={P.lavender} />
          <Text style={[styles.filterText, { color: P.lavender }]}>
            {SORT_LABELS[sortBy]}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
  },
});
