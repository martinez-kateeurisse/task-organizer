import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, Palette } from "../constants/theme";
import { usePreferences } from "../context/PreferencesContext";
import { useStyles } from "../context/ThemeContext";

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// Shown once, on first launch. The root layout redirects here while the
// `onboarded` preference is false; finishing or skipping sets it and replaces
// the route so the tour can't be reached with a back gesture.

const SLIDES = [
  {
    icon: "leaf-outline",
    title: "Welcome to Taskly",
    body: "A calm place for everything you need to do — no clutter, no noise.",
  },
  {
    icon: "albums-outline",
    title: "Organise your way",
    body: "Group tasks into your own categories, set priorities, and break the big ones into subtasks.",
  },
  {
    icon: "notifications-outline",
    title: "Never miss a thing",
    body: "Set a reminder on any task and Taskly will nudge you on the day it's due.",
  },
] as const;

export default function Onboarding() {
  const { P, styles } = useStyles(makeStyles);
  const { completeOnboarding } = usePreferences();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  function finish() {
    completeOnboarding();
    router.replace("/(tabs)");
  }

  function next() {
    if (isLast) return finish();
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity onPress={finish} style={styles.skip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.pager}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[P.gradientFrom, P.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={slide.icon} size={52} color={P.onGradient} />
            </LinearGradient>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.85} style={styles.cta}>
          <Text style={styles.ctaText}>
            {isLast ? "GET STARTED" : "NEXT"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (P: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: P.lilac },
    skip: { alignSelf: "flex-end", padding: 18 },
    skipText: {
      fontSize: 14,
      fontFamily: FONTS.sansMed,
      color: P.textSoft,
    },
    pager: { flexGrow: 0 },
    slide: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 36,
      paddingTop: 20,
    },
    iconCircle: {
      width: 132,
      height: 132,
      borderRadius: 66,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 40,
      shadowColor: P.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 10,
    },
    title: {
      fontSize: 30,
      fontFamily: FONTS.serif,
      color: P.textDark,
      textAlign: "center",
      marginBottom: 14,
    },
    body: {
      fontSize: 15,
      fontFamily: FONTS.sans,
      color: P.textMid,
      textAlign: "center",
      lineHeight: 23,
    },
    footer: {
      marginTop: "auto",
      paddingHorizontal: 28,
      paddingBottom: 20,
      gap: 26,
    },
    dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: P.border,
    },
    dotActive: { backgroundColor: P.plum, width: 22 },
    cta: {
      backgroundColor: P.plum,
      borderRadius: 18,
      paddingVertical: 17,
      alignItems: "center",
    },
    ctaText: {
      fontSize: 14,
      fontFamily: FONTS.sansBold,
      color: P.onAccent,
      letterSpacing: 1.2,
    },
  });
