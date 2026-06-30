import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { getLoopStats } from '../../features/loops/loopStats';
import type {
  LoopCadence,
  LoopImpact,
  Loop,
  LoopTodayStatus,
} from '../../features/loops/loopTypes';
import { useLoops } from '../../features/loops/useLoops';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { DateStrip } from '../../shared/components/DateStrip';
import { getDateKey } from '../../shared/date/dateUtils';
import { useAppTheme } from '../../shared/theme/ThemeProvider';
import type { AppTheme } from '../../shared/theme/theme';
import type { RootTabParamList } from '../../navigation/AppNavigator';

const impactIcon: Record<LoopImpact, keyof typeof Ionicons.glyphMap> = {
  high: 'flash',
  low: 'leaf',
  medium: 'radio-button-on',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { isRTL } = useLanguage();
  const { theme } = useAppTheme();
  const {
    createLoop,
    deleteExistingLoop,
    error,
    isLoading,
    loops,
    setTodayStatus,
    updateExistingLoop,
  } = useLoops();
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [detailLoop, setDetailLoop] = useState<Loop | null>(null);
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [selectedLoop, setSelectedLoop] = useState<Loop | null>(null);
  const visibleLoops = loops.map((loop) => {
    const dateStatus =
      loop.history.find((entry) => entry.date === selectedDate)?.status ??
      'pending';

    return {
      ...loop,
      isDone: dateStatus === 'done',
      todayStatus: dateStatus,
    };
  });
  const stats = getLoopStats(visibleLoops);
  const progressPercent = Math.round(stats.progress * 100);
  const isDark = theme.mode === 'dark';

  function openAddComposer() {
    setSelectedLoop(null);
    setComposerOpen(true);
  }

  function openEditComposer(loop: Loop) {
    setSelectedLoop(loop);
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setSelectedLoop(null);
  }

  function closeDetails() {
    setDetailLoop(null);
  }

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#070A10', '#0B1018', '#070A10']
          : ['#F3F7FC', '#FBFDFF', '#F3F7FC']
      }
      style={styles.gradient}
    >
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, isRTL && styles.rowReverse]}>
            <View style={isRTL && styles.alignEnd}>
              <Text style={[styles.kicker, { color: theme.colors.muted }]}>
                {t('habits.today')}
              </Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {t('habits.title')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
                {t('habits.focusLine')}
              </Text>
            </View>

            <Pressable
              style={[
                styles.settingsButton,
                {
                  backgroundColor: theme.colors.glassStrong,
                  borderColor: theme.colors.border,
                },
              ]}
              accessibilityLabel={t('common.settings')}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.duration(220)}>
            <BlurView
              intensity={isDark ? 22 : 42}
              tint={theme.mode}
              style={[
                styles.scorePanel,
                {
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.shadow,
                },
              ]}
            >
              <View style={[styles.scoreTop, isRTL && styles.rowReverse]}>
                <View style={isRTL && styles.alignEnd}>
                  <Text
                    style={[styles.panelLabel, { color: theme.colors.muted }]}
                  >
                    {t('habits.dailyProgress')}
                  </Text>
                  <Text
                    style={[styles.scoreValue, { color: theme.colors.text }]}
                  >
                    {progressPercent}%
                  </Text>
                  <Text
                    style={[styles.scoreMeta, { color: theme.colors.muted }]}
                  >
                    {stats.completed} of {stats.total}
                  </Text>
                </View>

                <View style={styles.scoreSpacer} />
              </View>

              <View style={[styles.metrics, isRTL && styles.rowReverse]}>
                <MetricPill
                  label={t('habits.todayDone', { count: stats.completed })}
                  tone="done"
                />
                <MetricPill
                  label={t('habits.pendingToday', { count: stats.pending })}
                  tone="pending"
                />
                <MetricPill
                  label={t('habits.missedToday', { count: stats.failed })}
                  tone="failed"
                />
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(45).duration(220)}>
            <DateStrip
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </Animated.View>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.muted }]}>
                {t('habits.loading')}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View
              style={[
                styles.errorState,
                {
                  backgroundColor: theme.colors.glassStrong,
                  borderColor: theme.colors.border,
                },
                isRTL && styles.rowReverse,
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={22}
                color={theme.colors.warning}
              />
              <Text
                style={[
                  styles.errorText,
                  { color: theme.colors.text },
                  isRTL && styles.alignEnd,
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {!isLoading && !error ? (
            <View style={styles.list}>
              {visibleLoops.map((loop, index) => (
                <HabitRow
                  key={loop.id}
                  index={index}
                  loop={loop}
                  onEdit={openEditComposer}
                  onOpenDetails={setDetailLoop}
                  onSetStatus={(habit, status) =>
                    setTodayStatus(habit, status, selectedDate)
                  }
                />
              ))}
            </View>
          ) : null}
        </ScrollView>

        <AnimatedPressable
          entering={FadeInUp.delay(140).duration(220)}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.shadow,
            },
            isRTL && styles.rowReverse,
          ]}
          onPress={openAddComposer}
        >
          <Ionicons name="add" size={21} color={theme.colors.surface} />
          <Text style={[styles.addButtonText, { color: theme.colors.surface }]}>
            {t('habits.add')}
          </Text>
        </AnimatedPressable>

        {isComposerOpen ? (
          <AddHabitSheet
            isVisible={isComposerOpen}
            loop={selectedLoop}
            onClose={closeComposer}
            onDelete={async (loopId) => {
              await deleteExistingLoop(loopId);
              closeComposer();
            }}
            onSubmit={async (input) => {
              if (selectedLoop) {
                await updateExistingLoop(selectedLoop.id, input);
              } else {
                await createLoop(input);
              }

              closeComposer();
            }}
          />
        ) : null}

        {detailLoop ? (
          <HabitDetailSheet loop={detailLoop} onClose={closeDetails} />
        ) : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

function AddHabitSheet({
  isVisible,
  loop,
  onClose,
  onDelete,
  onSubmit,
}: {
  isVisible: boolean;
  loop: Loop | null;
  onClose: () => void;
  onDelete: (loopId: string) => Promise<void>;
  onSubmit: (input: {
    cadence: LoopCadence;
    impact: LoopImpact;
    title: string;
  }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { theme } = useAppTheme();
  const [title, setTitle] = useState(loop?.title ?? '');
  const [impact, setImpact] = useState<LoopImpact>(loop?.impact ?? 'medium');
  const [cadence, setCadence] = useState<LoopCadence>(loop?.cadence ?? 'daily');
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const canSave = title.trim().length > 0;
  const isDark = theme.mode === 'dark';
  const isEditing = Boolean(loop);

  async function handleSave() {
    if (!canSave) {
      return;
    }

    await onSubmit({
      cadence,
      impact,
      title,
    });
  }

  async function handleDelete() {
    if (!loop) {
      return;
    }

    await onDelete(loop.id);
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <AnimatedPressable
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={styles.modalBackdrop}
          onPress={onClose}
        />
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(160)}
        >
          <BlurView
            intensity={isDark ? 24 : 44}
            tint={theme.mode}
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View style={[styles.sheetHeader, isRTL && styles.rowReverse]}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                {isEditing ? t('habits.editTitle') : t('habits.addTitle')}
              </Text>
              <Pressable
                accessibilityLabel={t('common.cancel')}
                style={[
                  styles.sheetClose,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onClose}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('habits.namePlaceholder')}
              placeholderTextColor={theme.colors.muted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            />

            <OptionGroup
              label={t('habits.impact')}
              options={[
                { label: t('habits.highImpact'), value: 'high' },
                { label: t('habits.mediumImpact'), value: 'medium' },
                { label: t('habits.lowImpact'), value: 'low' },
              ]}
              value={impact}
              onChange={(value) => setImpact(value as LoopImpact)}
            />

            <OptionGroup
              label={t('habits.cadence')}
              options={[
                { label: t('habits.daily'), value: 'daily' },
                { label: t('habits.weekly'), value: 'weekly' },
              ]}
              value={cadence}
              onChange={(value) => setCadence(value as LoopCadence)}
            />

            {isEditing ? (
              <Animated.View
                layout={LinearTransition.duration(180)}
                style={[
                  styles.deletePanel,
                  {
                    backgroundColor: theme.colors.glass,
                    borderColor: isConfirmingDelete
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}
              >
                {isConfirmingDelete ? (
                  <Animated.View entering={FadeInUp.duration(160)}>
                    <Text
                      style={[
                        styles.deleteConfirmTitle,
                        { color: theme.colors.text },
                        isRTL && styles.alignEnd,
                      ]}
                    >
                      {t('habits.deleteConfirmTitle')}
                    </Text>
                    <Text
                      style={[
                        styles.deleteConfirmBody,
                        { color: theme.colors.muted },
                        isRTL && styles.alignEnd,
                      ]}
                    >
                      {t('habits.deleteConfirmBody')}
                    </Text>
                    <View
                      style={[
                        styles.deleteConfirmActions,
                        isRTL && styles.rowReverse,
                      ]}
                    >
                      <Pressable
                        style={[
                          styles.secondaryButton,
                          {
                            backgroundColor: theme.colors.primarySoft,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => setConfirmingDelete(false)}
                      >
                        <Text
                          style={[
                            styles.secondaryButtonText,
                            { color: theme.colors.text },
                          ]}
                        >
                          {t('common.cancel')}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.dangerButton,
                          { backgroundColor: theme.colors.danger },
                        ]}
                        onPress={() => void handleDelete()}
                      >
                        <Text
                          style={[
                            styles.dangerButtonText,
                            { color: theme.colors.surface },
                          ]}
                        >
                          {t('common.confirm')}
                        </Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                ) : (
                  <AnimatedPressable
                    entering={FadeIn.duration(140)}
                    style={[styles.deleteTrigger, isRTL && styles.rowReverse]}
                    onPress={() => setConfirmingDelete(true)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.colors.danger}
                    />
                    <Text
                      style={[
                        styles.deleteTriggerText,
                        { color: theme.colors.danger },
                      ]}
                    >
                      {t('habits.delete')}
                    </Text>
                  </AnimatedPressable>
                )}
              </Animated.View>
            ) : null}

            <View style={[styles.sheetActions, isRTL && styles.rowReverse]}>
              <Pressable
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  {t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                disabled={!canSave}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: canSave
                      ? theme.colors.primary
                      : theme.colors.primarySoft,
                  },
                ]}
                onPress={() => void handleSave()}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    {
                      color: canSave
                        ? theme.colors.surface
                        : theme.colors.muted,
                    },
                  ]}
                >
                  {t('common.save')}
                </Text>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function HabitDetailSheet({
  loop,
  onClose,
}: {
  loop: Loop;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { isRTL, language } = useLanguage();
  const { theme } = useAppTheme();
  const isDark = theme.mode === 'dark';
  const insight = getHabitInsight(loop, language);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <AnimatedPressable
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={styles.modalBackdrop}
          onPress={onClose}
        />
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(160)}
        >
          <BlurView
            intensity={isDark ? 24 : 44}
            tint={theme.mode}
            style={[
              styles.sheet,
              styles.detailSheet,
              {
                backgroundColor: theme.colors.glassStrong,
                borderColor: theme.colors.border,
                shadowColor: theme.colors.shadow,
              },
            ]}
          >
            <View style={[styles.sheetHeader, isRTL && styles.rowReverse]}>
              <View style={[styles.detailTitleWrap, isRTL && styles.alignEnd]}>
                <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                  {loop.title}
                </Text>
                <Text
                  style={[styles.detailSubtitle, { color: theme.colors.muted }]}
                >
                  {getImpactLabel(loop.impact, t)} · {t('habits.detailsTitle')}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={t('common.close')}
                style={[
                  styles.sheetClose,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={onClose}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={[styles.detailHero, isRTL && styles.rowReverse]}>
              <View style={[styles.detailHeroText, isRTL && styles.alignEnd]}>
                <Text
                  style={[styles.detailLabel, { color: theme.colors.muted }]}
                >
                  {t('habits.commitment')}
                </Text>
                <Text
                  style={[styles.detailPercent, { color: theme.colors.text }]}
                >
                  {insight.commitment}%
                </Text>
                <Text
                  style={[styles.detailMeta, { color: theme.colors.muted }]}
                >
                  {t('habits.trackedDays', { count: insight.trackedDays })}
                </Text>
              </View>
              <View
                style={[
                  styles.detailBadge,
                  {
                    backgroundColor: theme.colors.primarySoft,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="flame" size={18} color={theme.colors.primary} />
                <Text
                  style={[styles.detailBadgeText, { color: theme.colors.text }]}
                >
                  {t('habits.streak', { count: loop.streak })}
                </Text>
              </View>
            </View>

            <Animated.View
              entering={FadeInUp.delay(80).duration(220)}
              style={[styles.detailStats, isRTL && styles.rowReverse]}
            >
              <DetailStat
                label={t('habits.done')}
                value={insight.done}
                tone="done"
              />
              <DetailStat
                label={t('habits.failed')}
                value={insight.failed}
                tone="failed"
              />
              <DetailStat
                label={t('habits.pending')}
                value={insight.pending}
                tone="pending"
              />
            </Animated.View>

            <View style={styles.detailSection}>
              <Text
                style={[
                  styles.detailSectionTitle,
                  { color: theme.colors.text },
                  isRTL && styles.alignEnd,
                ]}
              >
                {t('habits.lastDays')}
              </Text>
              <View style={[styles.historyStrip, isRTL && styles.rowReverse]}>
                {insight.recentDays.map((day) => (
                  <View key={day.date} style={styles.historyDay}>
                    <Text
                      style={[
                        styles.historyWeekday,
                        { color: theme.colors.muted },
                      ]}
                    >
                      {day.weekday}
                    </Text>
                    <View
                      style={[
                        styles.historyMarker,
                        {
                          backgroundColor: getStatusColor(day.status, theme),
                          opacity: day.status === 'pending' ? 0.62 : 1,
                        },
                      ]}
                    />
                    <Text
                      style={[styles.historyDate, { color: theme.colors.text }]}
                    >
                      {day.dayNumber}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text
                style={[
                  styles.detailSectionTitle,
                  { color: theme.colors.text },
                  isRTL && styles.alignEnd,
                ]}
              >
                {t('habits.monthView')}
              </Text>
              <View style={styles.monthRows}>
                {insight.weeks.map((week) => (
                  <View key={week.label} style={styles.monthRow}>
                    <Text
                      style={[styles.monthLabel, { color: theme.colors.muted }]}
                    >
                      {week.label}
                    </Text>
                    <View
                      style={[
                        styles.monthTrack,
                        { backgroundColor: theme.colors.primarySoft },
                        isRTL && styles.rowReverse,
                      ]}
                    >
                      {week.days.map((day) => (
                        <View
                          key={day.date}
                          style={[
                            styles.monthDot,
                            {
                              backgroundColor: getStatusColor(
                                day.status,
                                theme,
                              ),
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DetailStat({
  label,
  tone,
  value,
}: {
  label: string;
  tone: 'done' | 'failed' | 'pending';
  value: number;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.detailStat,
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.metricDot,
          { backgroundColor: getToneColor(tone, theme) },
        ]}
      />
      <Text style={[styles.detailStatValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.detailStatLabel, { color: theme.colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

function OptionGroup({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  const { isRTL } = useLanguage();
  const { theme } = useAppTheme();

  return (
    <View style={styles.optionGroup}>
      <Text
        style={[
          styles.optionLabel,
          { color: theme.colors.muted },
          isRTL && styles.alignEnd,
        ]}
      >
        {label}
      </Text>
      <View style={[styles.optionRow, isRTL && styles.rowReverse]}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <Pressable
              key={option.value}
              style={[
                styles.optionChip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.primarySoft,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
              onPress={() => onChange(option.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected
                      ? theme.colors.surface
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function HabitRow({
  index,
  loop,
  onEdit,
  onOpenDetails,
  onSetStatus,
}: {
  index: number;
  loop: Loop;
  onEdit: (loop: Loop) => void;
  onOpenDetails: (loop: Loop) => void;
  onSetStatus: (loop: Loop, status: LoopTodayStatus) => Promise<void>;
}) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { theme } = useAppTheme();
  const isDark = theme.mode === 'dark';

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 38).duration(220)}
      exiting={FadeOutDown.duration(160)}
      layout={LinearTransition.duration(180)}
    >
      <BlurView
        intensity={isDark ? 14 : 30}
        tint={theme.mode}
        style={[
          styles.habitRow,
          {
            backgroundColor: theme.colors.glassStrong,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
          isRTL && styles.rowReverse,
        ]}
      >
        <Pressable
          accessibilityLabel={t('habits.edit')}
          accessibilityHint={t('habits.detailsHint')}
          delayLongPress={360}
          style={[styles.habitEditTarget, isRTL && styles.rowReverse]}
          onLongPress={() => onOpenDetails(loop)}
          onPress={() => onEdit(loop)}
        >
          <View
            style={[
              styles.impactMark,
              { backgroundColor: theme.colors.primarySoft },
            ]}
          >
            <Ionicons
              name={impactIcon[loop.impact]}
              size={16}
              color={theme.colors.primary}
            />
          </View>

          <View style={[styles.habitText, isRTL && styles.alignEnd]}>
            <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
              {loop.title}
            </Text>
            <Text style={[styles.habitMeta, { color: theme.colors.muted }]}>
              {getImpactLabel(loop.impact, t)} ·{' '}
              {t('habits.streak', { count: loop.streak })}
            </Text>
          </View>
        </Pressable>

        <View style={[styles.sideActions, isRTL && styles.rowReverse]}>
          <StatusButton
            icon="checkmark"
            accessibilityLabel={t('habits.done')}
            isActive={loop.todayStatus === 'done'}
            status="done"
            onPress={() => void onSetStatus(loop, 'done')}
          />
          <StatusButton
            icon="close"
            accessibilityLabel={t('habits.failed')}
            isActive={loop.todayStatus === 'failed'}
            status="failed"
            onPress={() => void onSetStatus(loop, 'failed')}
          />
        </View>
      </BlurView>
    </Animated.View>
  );
}

type StatusButtonProps = {
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  status: Exclude<LoopTodayStatus, 'pending'>;
};

function StatusButton({
  accessibilityLabel,
  icon,
  isActive,
  onPress,
  status,
}: StatusButtonProps) {
  const { theme } = useAppTheme();
  const pressScale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const activeColor =
    status === 'done' ? theme.colors.success : theme.colors.danger;

  function handlePress() {
    pressScale.set(
      withSequence(
        withTiming(0.88, { duration: 70 }),
        withTiming(1.08, { duration: 105 }),
        withTiming(1, { duration: 120 }),
      ),
    );
    onPress();
  }

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.statusButton,
        {
          backgroundColor: isActive ? activeColor : theme.colors.primarySoft,
          borderColor: isActive ? activeColor : theme.colors.border,
        },
        animatedStyle,
      ]}
      onPress={handlePress}
    >
      <Ionicons
        name={icon}
        size={17}
        color={isActive ? theme.colors.surface : theme.colors.text}
      />
    </AnimatedPressable>
  );
}

function MetricPill({
  label,
  tone,
}: {
  label: string;
  tone: 'done' | 'failed' | 'pending';
}) {
  const { theme } = useAppTheme();
  const color =
    tone === 'done'
      ? theme.colors.success
      : tone === 'failed'
        ? theme.colors.danger
        : theme.colors.primary;

  return (
    <View
      style={[
        styles.metricPill,
        {
          backgroundColor: theme.colors.primarySoft,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.metricDot, { backgroundColor: color }]} />
      <Text style={[styles.metricText, { color: theme.colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

function getHabitInsight(loop: Loop, language: 'ar' | 'en') {
  const historyByDate = loop.history.reduce<Record<string, LoopTodayStatus>>(
    (history, entry) => {
      history[entry.date] = entry.status;
      return history;
    },
    {},
  );
  const recentDays = getRecentDays(14, historyByDate, language);
  const monthDays = getRecentDays(28, historyByDate, language);
  const done = loop.history.filter((entry) => entry.status === 'done').length;
  const failed = loop.history.filter(
    (entry) => entry.status === 'failed',
  ).length;
  const pending = loop.history.filter(
    (entry) => entry.status === 'pending',
  ).length;
  const decidedDays = done + failed;

  return {
    commitment: decidedDays === 0 ? 0 : Math.round((done / decidedDays) * 100),
    done,
    failed,
    pending,
    recentDays,
    trackedDays: loop.history.length,
    weeks: [0, 1, 2, 3].map((weekIndex) => ({
      days: monthDays.slice(weekIndex * 7, weekIndex * 7 + 7),
      label: `${weekIndex + 1}`,
    })),
  };
}

function getRecentDays(
  count: number,
  historyByDate: Record<string, LoopTodayStatus>,
  language: 'ar' | 'en',
) {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat(language, { weekday: 'short' });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - index - 1));
    const dateKey = getDateKey(date);

    return {
      date: dateKey,
      dayNumber: date.getDate().toString(),
      status: historyByDate[dateKey] ?? 'pending',
      weekday: formatter.format(date).slice(0, 2),
    };
  });
}

function getStatusColor(status: LoopTodayStatus, theme: AppTheme) {
  if (status === 'done') {
    return theme.colors.success;
  }

  if (status === 'failed') {
    return theme.colors.danger;
  }

  return theme.colors.mutedLight;
}

function getToneColor(tone: 'done' | 'failed' | 'pending', theme: AppTheme) {
  if (tone === 'done') {
    return theme.colors.success;
  }

  if (tone === 'failed') {
    return theme.colors.danger;
  }

  return theme.colors.primary;
}

function getImpactLabel(
  impact: LoopImpact,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  if (impact === 'high') {
    return t('habits.highImpact');
  }

  if (impact === 'low') {
    return t('habits.lowImpact');
  }

  return t('habits.mediumImpact');
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 18,
    bottom: 104,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 17,
    position: 'absolute',
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  centerState: {
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    minHeight: 120,
  },
  content: {
    paddingBottom: 188,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 64,
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 2,
  },
  daysStrip: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  dayStatus: {
    borderRadius: 3,
    height: 6,
    marginTop: 4,
    width: 18,
  },
  dangerButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  deleteConfirmBody: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 4,
  },
  deleteConfirmTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  deletePanel: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  deleteTrigger: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 34,
  },
  deleteTriggerText: {
    fontSize: 14,
    fontWeight: '800',
  },
  detailBadge: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 11,
  },
  detailBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailHero: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  detailHeroText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailMeta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  detailPercent: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 39,
    marginTop: 2,
  },
  detailSection: {
    marginTop: 17,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  detailSheet: {
    maxHeight: '84%',
  },
  detailStat: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 82,
    padding: 11,
  },
  detailStatLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  detailStatValue: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  detailSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  detailTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  errorState: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  gradient: {
    flex: 1,
  },
  habitMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  habitEditTarget: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 54,
  },
  habitRow: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 78,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 11,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  habitText: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  historyDay: {
    alignItems: 'center',
    flex: 1,
    minWidth: 20,
  },
  historyMarker: {
    borderRadius: 5,
    height: 22,
    marginTop: 5,
    width: 10,
  },
  historyStrip: {
    flexDirection: 'row',
    gap: 5,
  },
  historyWeekday: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  impactMark: {
    alignItems: 'center',
    borderRadius: 14,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  list: {
    gap: 8,
    marginTop: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  metricDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  metricPill: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  panelLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  monthDot: {
    borderRadius: 4,
    flex: 1,
    height: 8,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '800',
    width: 18,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  monthRows: {
    gap: 8,
  },
  monthTrack: {
    borderRadius: 999,
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    padding: 6,
  },
  optionChip: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionGroup: {
    gap: 9,
    marginTop: 14,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  scorePanel: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 15,
    shadowOpacity: 0.09,
    shadowRadius: 16,
  },
  scoreMeta: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreSpacer: {
    width: 24,
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 39,
    marginTop: 3,
  },
  screen: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  settingsButton: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sideActions: {
    flexDirection: 'row',
    gap: 7,
  },
  statusButton: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 2,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  sheetClose: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
});
