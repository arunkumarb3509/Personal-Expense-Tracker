import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon,
  Check,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface DatePickerModalProps {
  visible: boolean;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onClose: () => void;
  title?: string;
}

/**
 * Safely parses a YYYY-MM-DD string into a local Date set to 12:00:00 (noon).
 * This completely prevents timezone and daylight savings boundary shifts.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d, 12, 0, 0);
    }
  }
  return new Date();
}

/**
 * Formats a Date object strictly into YYYY-MM-DD using local calendar components.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = 'Select Date',
}: DatePickerModalProps) {
  const { colors, typography, radius, spacing } = useTheme();

  const [viewDate, setViewDate] = useState<Date>(() => parseLocalDate(selectedDate));
  const [currentSelected, setCurrentSelected] = useState<Date>(() => parseLocalDate(selectedDate));
  const [mode, setMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  // Synchronize internal state whenever modal opens or selectedDate changes
  useEffect(() => {
    if (visible) {
      const parsed = parseLocalDate(selectedDate);
      setViewDate(parsed);
      setCurrentSelected(parsed);
      setMode('calendar');
    }
  }, [visible, selectedDate]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  // Week starts on Monday (weekStartsOn: 1)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const handlePrevMonth = () => {
    try { Haptics.selectionAsync(); } catch {}
    setViewDate(subMonths(viewDate, 1));
  };

  const handleNextMonth = () => {
    try { Haptics.selectionAsync(); } catch {}
    setViewDate(addMonths(viewDate, 1));
  };

  const handlePrevYear = () => {
    try { Haptics.selectionAsync(); } catch {}
    setViewDate(subYears(viewDate, 1));
  };

  const handleNextYear = () => {
    try { Haptics.selectionAsync(); } catch {}
    setViewDate(addYears(viewDate, 1));
  };

  const handleSelectDay = (day: Date) => {
    try { Haptics.selectionAsync(); } catch {}
    setCurrentSelected(day);
    // If selecting a day in another month, update viewDate too
    if (day.getMonth() !== viewDate.getMonth()) {
      setViewDate(day);
    }
  };

  const handleConfirm = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    onSelectDate(formatLocalDate(currentSelected));
    onClose();
  };

  const handleSetToday = () => {
    try { Haptics.selectionAsync(); } catch {}
    const today = new Date();
    setViewDate(today);
    setCurrentSelected(today);
  };

  const handleSetYesterday = () => {
    try { Haptics.selectionAsync(); } catch {}
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    setViewDate(yest);
    setCurrentSelected(yest);
  };

  const currentYear = viewDate.getFullYear();
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius['2xl'],
                  borderColor: colors.border,
                  padding: spacing.lg,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.primaryLight, borderRadius: radius.md },
                    ]}
                  >
                    <CalendarIcon size={18} color={colors.primary} />
                  </View>
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.title,
                        {
                          color: colors.text,
                          fontSize: typography.sizes.md,
                          fontWeight: '800',
                        },
                      ]}
                    >
                      {title}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: typography.sizes.xxs,
                        marginTop: 1,
                      }}
                    >
                      Selected: {format(currentSelected, 'dd MMM yyyy')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={[styles.closeBtn, { borderColor: colors.border }]}
                >
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View style={[styles.quickRow, { marginVertical: spacing.sm }]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSetToday}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: isToday(currentSelected)
                        ? colors.lime
                        : colors.surfaceSecondary,
                      borderColor: isToday(currentSelected) ? colors.lime : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isToday(currentSelected) ? '#0B291F' : colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: isToday(currentSelected) ? '800' : '600',
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
                      fontWeight: '600',
                    }}
                  >
                    Yesterday
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const first = startOfMonth(viewDate);
                    setViewDate(first);
                    setCurrentSelected(first);
                  }}
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
                      fontWeight: '600',
                    }}
                  >
                    1st of Month
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Month & Year Navigation Row */}
              <View
                style={[
                  styles.navContainer,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    borderRadius: radius.xl,
                  },
                ]}
              >
                {/* Previous Buttons */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePrevYear}
                    accessibilityLabel="Previous Year"
                    style={styles.navBtn}
                  >
                    <ChevronsLeft size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePrevMonth}
                    accessibilityLabel="Previous Month"
                    style={styles.navBtn}
                  >
                    <ChevronLeft size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Month/Year Title - Tappable to toggle year picker */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setMode(mode === 'calendar' ? 'year' : 'calendar')}
                  style={styles.monthYearBtn}
                >
                  <Text
                    style={[
                      styles.monthText,
                      {
                        color: colors.text,
                        fontSize: typography.sizes.sm,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {format(viewDate, 'MMMM yyyy')}
                  </Text>
                </TouchableOpacity>

                {/* Next Buttons */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleNextMonth}
                    accessibilityLabel="Next Month"
                    style={styles.navBtn}
                  >
                    <ChevronRight size={18} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleNextYear}
                    accessibilityLabel="Next Year"
                    style={styles.navBtn}
                  >
                    <ChevronsRight size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Year / Month Quick Picker View */}
              {mode === 'year' ? (
                <View style={styles.yearPickerWrap}>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: '600',
                      marginBottom: 8,
                      textAlign: 'center',
                    }}
                  >
                    Jump to Year or Month
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 12 }}
                  >
                    {availableYears.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => {
                          const newD = new Date(viewDate);
                          newD.setFullYear(y);
                          setViewDate(newD);
                        }}
                        style={[
                          styles.yearPill,
                          {
                            backgroundColor:
                              viewDate.getFullYear() === y
                                ? colors.primary
                                : colors.surfaceSecondary,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              viewDate.getFullYear() === y
                                ? colors.primaryForeground
                                : colors.text,
                            fontWeight: '700',
                            fontSize: typography.sizes.xs,
                          }}
                        >
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.monthsGrid}>
                    {monthNames.map((mName, mIdx) => (
                      <TouchableOpacity
                        key={mIdx}
                        onPress={() => {
                          const newD = new Date(viewDate);
                          newD.setMonth(mIdx);
                          setViewDate(newD);
                          setMode('calendar');
                        }}
                        style={[
                          styles.monthGridCell,
                          {
                            backgroundColor:
                              viewDate.getMonth() === mIdx
                                ? colors.lime
                                : colors.surfaceSecondary,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: viewDate.getMonth() === mIdx ? '#0B291F' : colors.text,
                            fontSize: typography.sizes.xs,
                            fontWeight: '700',
                          }}
                        >
                          {mName.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <>
                  {/* Week Day Labels (Mo Tu We Th Fr Sa Su) */}
                  <View style={styles.weekDaysRow}>
                    {weekDays.map((wd, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.weekDayText,
                          {
                            color: colors.textTertiary,
                            fontSize: typography.sizes.xxs,
                            fontWeight: '700',
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
                                ? colors.lime
                                : isTodaysDate
                                ? colors.primaryLight
                                : 'transparent',
                              borderRadius: radius.md,
                              borderColor: isTodaysDate && !isSelected ? colors.primary : 'transparent',
                              borderWidth: isTodaysDate && !isSelected ? 1 : 0,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: isSelected
                                ? '#0B291F'
                                : !isCurrentMonth
                                ? colors.textTertiary
                                : isTodaysDate
                                ? colors.primary
                                : colors.text,
                              fontSize: typography.sizes.sm,
                              fontWeight:
                                isSelected || isTodaysDate
                                  ? '800'
                                  : isCurrentMonth
                                  ? '600'
                                  : '400',
                            }}
                          >
                            {day.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Action Buttons */}
              <View style={[styles.buttonRow, { marginTop: spacing.md }]}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Button title="Cancel" onPress={onClose} variant="secondary" size="sm" />
                </View>
                <View style={{ flex: 1.2 }}>
                  <Button
                    title="Confirm Date"
                    onPress={handleConfirm}
                    variant="primary"
                    size="sm"
                    icon={<Check size={16} color="#FFFFFF" />}
                    iconPosition="right"
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
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    marginBottom: 10,
  },
  navBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  monthText: {
    letterSpacing: -0.2,
  },
  yearPickerWrap: {
    paddingVertical: 8,
  },
  yearPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  monthGridCell: {
    width: '31%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
