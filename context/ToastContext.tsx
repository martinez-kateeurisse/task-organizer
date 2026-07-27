import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS, Palette } from "../constants/theme";
import { useStyles } from "./ThemeContext";

// ─── TOAST CONTEXT ────────────────────────────────────────────────────────────
// A single transient message bar with an optional action, used for undoable
// destructive actions. Only one toast exists at a time: a second call replaces
// the first, so a burst of deletes leaves the user with the most recent undo
// rather than a stack to dig through.

const VISIBLE_MS = 5000;

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastState {
  message: string;
  action?: ToastAction;
}

interface ToastContextType {
  showToast: (message: string, action?: ToastAction) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    progress.value = withTiming(0, { duration: 180 }, (finished) => {
      if (finished) runOnJS(setToast)(null);
    });
  }, [clearTimer, progress]);

  const showToast = useCallback(
    (message: string, action?: ToastAction) => {
      clearTimer();
      setToast({ message, action });
      progress.value = withTiming(1, { duration: 220 });
      timer.current = setTimeout(hideToast, VISIBLE_MS);
    },
    [clearTimer, hideToast, progress],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <ToastBar
          toast={toast}
          progress={progress}
          onAction={() => {
            toast.action?.onPress();
            hideToast();
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

function ToastBar({
  toast,
  progress,
  onAction,
}: {
  toast: ToastState;
  progress: { value: number };
  onAction: () => void;
}) {
  const { styles } = useStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 20 }],
  }));

  return (
    // box-none lets taps fall through to the screen everywhere except the bar.
    <View
      style={[styles.wrap, { bottom: insets.bottom + 86 }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.bar, animated]}>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.action && (
          <TouchableOpacity
            onPress={onAction}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.action}>{toast.action.label}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const makeStyles = (P: Palette) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 18,
      right: 18,
      alignItems: "stretch",
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      backgroundColor: P.plum,
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 14,
      shadowColor: P.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    message: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.sans,
      color: P.onAccent,
    },
    action: {
      fontSize: 13,
      fontFamily: FONTS.sansBold,
      color: P.onAccent,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });
