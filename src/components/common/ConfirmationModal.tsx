import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';
import { AlertTriangle, Trash2, LogOut } from 'lucide-react-native';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  confirmVariant?: 'danger' | 'warning' | 'primary' | string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant,
  confirmVariant,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const effectiveVariant = variant || (confirmVariant as 'danger' | 'warning' | 'primary') || 'danger';

  let icon = <AlertTriangle size={32} color={colors.warning} />;
  let iconBg = colors.warningLight;

  if (effectiveVariant === 'danger') {
    icon = <Trash2 size={32} color={colors.error} />;
    iconBg = colors.errorLight;
  } else if (effectiveVariant === 'primary') {
    icon = <LogOut size={32} color={colors.primary} />;
    iconBg = colors.primaryLight;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                {
                  backgroundColor: colors.card,
                  borderRadius: radius['2xl'],
                  borderColor: colors.border,
                  padding: spacing.xl,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: iconBg,
                    borderRadius: radius.full,
                  },
                ]}
              >
                {icon}
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                    marginTop: spacing.md,
                  },
                ]}
              >
                {title}
              </Text>

              <Text
                style={[
                  styles.message,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.sm,
                    marginTop: spacing.xs,
                    lineHeight: 20,
                  },
                ]}
              >
                {message}
              </Text>

              <View style={[styles.buttonRow, { marginTop: spacing.xl }]}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Button
                    title={cancelText}
                    onPress={onCancel}
                    variant="secondary"
                    size="sm"
                    disabled={loading}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={confirmText}
                    onPress={onConfirm}
                    variant={effectiveVariant === 'danger' ? 'danger' : 'primary'}
                    size="sm"
                    loading={loading}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});
