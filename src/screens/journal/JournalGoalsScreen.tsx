import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyStore } from '../../features/daily/dailyStore';
import type { DailyGoal } from '../../features/daily/dailyTypes';
import { DateStrip } from '../../shared/components/DateStrip';
import { getDateKey } from '../../shared/date/dateUtils';
import { useAppTheme } from '../../shared/theme/ThemeProvider';

export function JournalGoalsScreen() {
  const { theme } = useAppTheme();
  const daily = useDailyStore();
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [draftGoal, setDraftGoal] = useState('');
  const day = daily.getJournalDay(selectedDate);
  const isDark = theme.mode === 'dark';

  function addGoal() {
    if (!draftGoal.trim()) {
      return;
    }

    daily.addGoal(selectedDate, draftGoal);
    setDraftGoal('');
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
          <Text style={[styles.kicker, { color: theme.colors.muted }]}>
            Daily page
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Journal & Goals
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            Write the thought, then close the loop on today.
          </Text>

          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <BlurView
            intensity={isDark ? 20 : 42}
            tint={theme.mode}
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Thought
            </Text>
            <TextInput
              multiline
              value={day.note}
              onChangeText={(note) =>
                daily.updateJournalNote(selectedDate, note)
              }
              placeholder="Write a calm note for this day..."
              placeholderTextColor={theme.colors.muted}
              style={[
                styles.noteInput,
                {
                  backgroundColor: theme.colors.glassStrong,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
            />
          </BlurView>

          <BlurView
            intensity={isDark ? 20 : 42}
            tint={theme.mode}
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.glass,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Goals
              </Text>
              <Text style={[styles.counter, { color: theme.colors.muted }]}>
                {day.goals.filter((goal) => goal.status === 'done').length}/
                {day.goals.length}
              </Text>
            </View>

            <View style={styles.addRow}>
              <TextInput
                value={draftGoal}
                onChangeText={setDraftGoal}
                placeholder="Add a goal"
                placeholderTextColor={theme.colors.muted}
                style={[
                  styles.goalInput,
                  {
                    backgroundColor: theme.colors.glassStrong,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />
              <Pressable
                style={[
                  styles.addButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={addGoal}
              >
                <Ionicons name="add" size={20} color={theme.colors.surface} />
              </Pressable>
            </View>

            {day.goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
                  No goals for this date yet.
                </Text>
              </View>
            ) : (
              <View style={styles.goalList}>
                {day.goals.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    onDelete={() => daily.deleteGoal(selectedDate, goal.id)}
                    onUpdate={(patch) =>
                      daily.updateGoal(selectedDate, goal.id, patch)
                    }
                  />
                ))}
              </View>
            )}
          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function GoalRow({
  goal,
  onDelete,
  onUpdate,
}: {
  goal: DailyGoal;
  onDelete: () => void;
  onUpdate: (patch: Partial<DailyGoal>) => void;
}) {
  const { theme } = useAppTheme();
  const [isEditing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const isFailed = goal.status === 'failed';
  const isDone = goal.status === 'done';

  function saveTitle() {
    if (title.trim()) {
      onUpdate({ title: title.trim() });
    }
    setEditing(false);
  }

  return (
    <View
      style={[
        styles.goalRow,
        {
          backgroundColor: isDone
            ? theme.colors.primarySoft
            : theme.colors.glassStrong,
          borderColor: isDone
            ? theme.colors.borderStrong
            : isFailed
              ? theme.colors.danger
              : theme.colors.border,
        },
      ]}
    >
      {isEditing ? (
        <TextInput
          autoFocus
          value={title}
          onBlur={saveTitle}
          onChangeText={setTitle}
          onSubmitEditing={saveTitle}
          style={[
            styles.goalTitleInput,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
        />
      ) : (
        <Pressable
          style={styles.goalTitleWrap}
          onPress={() => setEditing(true)}
        >
          <Text
            style={[
              styles.goalTitle,
              {
                color: isDone
                  ? theme.colors.primary
                  : isFailed
                    ? theme.colors.danger
                    : theme.colors.text,
                textDecorationLine:
                  isDone || isFailed ? 'line-through' : 'none',
              },
            ]}
          >
            {goal.title}
          </Text>
        </Pressable>
      )}

      <View style={styles.goalActions}>
        <SmallIconButton
          icon="checkmark"
          tone="done"
          active={isDone}
          onPress={() => onUpdate({ status: isDone ? 'pending' : 'done' })}
        />
        <SmallIconButton
          icon="close"
          tone="failed"
          active={isFailed}
          onPress={() => onUpdate({ status: isFailed ? 'pending' : 'failed' })}
        />
        <SmallIconButton icon="trash-outline" tone="quiet" onPress={onDelete} />
      </View>
    </View>
  );
}

function SmallIconButton({
  active,
  icon,
  onPress,
  tone,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone: 'done' | 'failed' | 'quiet';
}) {
  const { theme } = useAppTheme();
  const color =
    tone === 'done'
      ? theme.colors.primary
      : tone === 'failed'
        ? theme.colors.danger
        : theme.colors.muted;

  return (
    <Pressable
      style={[
        styles.smallButton,
        {
          backgroundColor: active ? color : theme.colors.primarySoft,
          borderColor: active ? color : theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? theme.colors.surface : color}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 15,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  addRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },
  content: {
    gap: 12,
    paddingBottom: 132,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  counter: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    minHeight: 76,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 6,
  },
  goalInput: {
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 46,
    paddingHorizontal: 13,
  },
  goalList: {
    gap: 8,
    marginTop: 12,
  },
  goalRow: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 11,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  goalTitleInput: {
    borderBottomWidth: 1,
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    minHeight: 38,
  },
  goalTitleWrap: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
  },
  noteInput: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 132,
    padding: 13,
    textAlignVertical: 'top',
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 14,
  },
  screen: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  smallButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -6,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
