import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';

export interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = 'Select Date',
}: DatePickerModalProps) {
  const { colors, typography, radius, spacing } = useTheme();

  let initialDate = new Date();
  try {
    if (selectedDate) {
      initialDate = parseISO(selectedDate);
    }
  } catch {
    initialDate = new Date();
  }

  const [viewDate, setViewDate] = useState<Date>(initialDate);
  const [currentSelected, setCurrentSelected] = useState<Date>(initialDate);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleSelectDay = (day: Date) => {
    setCurrentSelected(day);
  };

  const handleConfirm = () => {
    onSelectDate(format(currentSelected, 'yyyy-MM-dd'));
    onClose();
  };

  const handleSetToday = () => {
    const today = new Date();
    setViewDate(today);
    setCurrentSelected(today);
  };

  const handleSetYesterday = () => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    setViewDate(yest);
    setCurrentSelected(yest);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
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
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <CalendarIcon size={20} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text
                    style={[
                      styles.title,
                      {
                        color: colors.text,
                        fontSize: typography.sizes.md,
                        fontWeight: typography.weights.bold,
                      },
                    ]}
                  >
                    {title}
                  </Text>
                </View>
              </View>

              {/* Quick Preset Buttons */}
              <View style={[styles.quickRow, { marginVertical: spacing.md }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSetToday}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: isToday(currentSelected)
                        ? colors.primaryLight
                        : colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isToday(currentSelected) ? colors.primary : colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.semibold,
                    }}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSetYesterday}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      marginLeft: spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.semibold,
                    }}
                  >
                    Yesterday
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month Navigation */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePrevMonth}
                  style={[styles.navBtn, { borderColor: colors.border }]}
                >
                  <ChevronLeft size={18} color={colors.text} />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.monthText,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                >
                  {format(viewDate, 'MMMM yyyy')}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleNextMonth}
                  style={[styles.navBtn, { borderColor: colors.border }]}
                >
                  <ChevronRight size={18} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Week Day Labels */}
              <View style={styles.weekDaysRow}>
                {weekDays.map((wd, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.weekDayText,
                      {
                        color: colors.textTertiary,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.semibold,
                      },
                    ]}
                  >
                    {wd}
                  </Text>
                ))}
              </View>

              {/* Day Grid */}
              <View style={styles.grid}>
                {allDays.map((day, idx) => {
                  const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                  const isSelected = isSameDay(day, currentSelected);
                  const isTodaysDate = isToday(day);

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.7}
                      onPress={() => handleSelectDay(day)}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isTodaysDate
                            ? colors.primaryLight
                            : 'transparent',
                          borderRadius: radius.md,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? colors.primaryForeground
                            : !isCurrentMonth
                            ? colors.textTertiary
                            : isTodaysDate
                            ? colors.primary
                            : colors.text,
                          fontSize: typography.sizes.sm,
                          fontWeight:
                            isSelected || isTodaysDate
                              ? typography.weights.bold
                              : typography.weights.regular,
                        }}
                      >
                        {format(day, 'd')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={[styles.buttonRow, { marginTop: spacing.lg }]}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Button title="Cancel" onPress={onClose} variant="secondary" size="sm" />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Apply" onPress={handleConfirm} variant="primary" size="sm" />
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
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    letterSpacing: -0.2,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {},
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
