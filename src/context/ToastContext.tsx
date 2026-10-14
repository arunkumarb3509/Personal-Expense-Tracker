import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type: ToastType;
  } | null>(null);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-24)).current;
  const timeoutRef = useRef<any>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -24,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacityAnim, translateYAnim]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', options?: ToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Haptics feedback based on toast type
      try {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (type === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else if (type === 'warning') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } else {
          Haptics.selectionAsync();
        }
      } catch {}

      setToast({ id: Date.now(), message, type });

      opacityAnim.setValue(0);
      translateYAnim.setValue(-24);

      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options?.duration || 2600;
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacityAnim, translateYAnim]
  );

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: '#11382B', // Forest green
          border: '#B4F06A', // Lime border
          icon: '#B4F06A',
          text: '#FFFFFF',
        };
      case 'error':
        return {
          bg: '#2C0B0E',
          border: '#EF4444',
          icon: '#F87171',
          text: '#FFFFFF',
        };
      case 'warning':
        return {
          bg: '#2B1A04',
          border: '#F59E0B',
          icon: '#FBBF24',
          text: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          bg: '#0C2029',
          border: '#0284C7',
          icon: '#38BDF8',
          text: '#FFFFFF',
        };
    }
  };

  const getIcon = (type: ToastType) => {
    const size = 18;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={size} color="#B4F06A" />;
      case 'error':
        return <XCircle size={size} color="#F87171" />;
      case 'warning':
        return <AlertTriangle size={size} color="#FBBF24" />;
      case 'info':
      default:
        return <Info size={size} color="#38BDF8" />;
    }
  };

  const colors = toast ? getToastColors(toast.type) : null;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && colors && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastContainer,
            {
              top: Math.max(insets.top + 8, 20),
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            style={[
              styles.toastBubble,
              {
                backgroundColor: colors.bg,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.iconWrapper}>{getIcon(toast.type)}</View>
            <Text style={[styles.toastText, { color: colors.text }]} numberOfLines={2}>
              {toast.message}
            </Text>
            <TouchableOpacity
              onPress={hideToast}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={14} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1.2,
    maxWidth: 440,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrapper: {
    marginRight: 10,
  },
  toastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  closeBtn: {
    marginLeft: 8,
    padding: 2,
  },
});
