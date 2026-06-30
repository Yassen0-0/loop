import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
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
import type { PrayerName } from '../../features/daily/dailyTypes';
import { useAppPreferences } from '../../shared/preferences/AppPreferencesProvider';
import { DateStrip } from '../../shared/components/DateStrip';
import { getDateKey } from '../../shared/date/dateUtils';
import { useAppTheme } from '../../shared/theme/ThemeProvider';

const prayerLabels: Record<PrayerName, string> = {
  asr: 'Asr',
  dhuhr: 'Dhuhr',
  fajr: 'Fajr',
  isha: 'Isha',
  maghrib: 'Maghrib',
};

export function ReligionScreen() {
  const { theme } = useAppTheme();
  const daily = useDailyStore();
  const { region } = useAppPreferences();
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [bookTitle, setBookTitle] = useState('');
  const [yearGoalTitle, setYearGoalTitle] = useState('');
  const day = daily.getReligionDay(selectedDate);
  // Prayer times resolve from the saved region (Settings). Defaults to Cairo.
  const prayerTimes =
    daily.prayerTimesByCity[region.city] ?? daily.prayerTimesByCity.Cairo;
  const isDark = theme.mode === 'dark';
  const progress = useMemo(() => getReligionProgress(day), [day]);

  function addBook() {
    if (!bookTitle.trim()) {
      return;
    }

    daily.addBook(bookTitle);
    setBookTitle('');
  }

  function addYearGoal() {
    if (!yearGoalTitle.trim()) {
      return;
    }

    daily.addYearGoal(yearGoalTitle);
    setYearGoalTitle('');
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
            Daily faith
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Religion
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            {region.city} · {region.country}
          </Text>

          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <Panel title="Daily progress">
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: theme.colors.primarySoft },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.muted }]}>
              {progress}% complete
            </Text>
          </Panel>

          <Panel title="Prayers">
            <View style={styles.list}>
              {daily.prayerNames.map((prayer) => (
                <CheckRow
                  key={prayer}
                  label={prayerLabels[prayer]}
                  meta={prayerTimes[prayer]}
                  checked={day.prayers[prayer]}
                  onPress={() =>
                    daily.updateReligionDay(selectedDate, {
                      prayers: { [prayer]: !day.prayers[prayer] } as never,
                    })
                  }
                />
              ))}
            </View>
          </Panel>

          <Panel title="Religious books">
            <AddLine
              value={bookTitle}
              placeholder="Add book"
              onChangeText={setBookTitle}
              onAdd={addBook}
            />
            {daily.state.religion.books.map((book) => (
              <ProgressRow
                key={book.id}
                title={book.title}
                progress={book.progress}
                isDone={book.isDone}
                onTitleChange={(title) => daily.updateBook(book.id, { title })}
                onProgress={(value) =>
                  daily.updateBook(book.id, { progress: value })
                }
                onToggle={() =>
                  daily.updateBook(book.id, { isDone: !book.isDone })
                }
                onDelete={() => daily.deleteBook(book.id)}
              />
            ))}
          </Panel>

          <Panel title="Yearly religious goals">
            <AddLine
              value={yearGoalTitle}
              placeholder="Add yearly goal"
              onChangeText={setYearGoalTitle}
              onAdd={addYearGoal}
            />
            {daily.state.religion.yearlyGoals.map((goal) => (
              <ProgressRow
                key={goal.id}
                title={goal.title}
                progress={goal.progress}
                isDone={goal.progress >= 100}
                onTitleChange={(title) =>
                  daily.updateYearGoal(goal.id, { title })
                }
                onProgress={(value) =>
                  daily.updateYearGoal(goal.id, { progress: value })
                }
                onToggle={() =>
                  daily.updateYearGoal(goal.id, {
                    progress: goal.progress >= 100 ? 0 : 100,
                  })
                }
                onDelete={() => daily.deleteYearGoal(goal.id)}
              />
            ))}
          </Panel>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { theme } = useAppTheme();

  return (
    <BlurView
      intensity={theme.mode === 'dark' ? 20 : 42}
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
        {title}
      </Text>
      {children}
    </BlurView>
  );
}

function CheckRow({
  checked,
  label,
  meta,
  onPress,
}: {
  checked: boolean;
  label: string;
  meta?: string;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      style={[
        styles.checkRow,
        {
          backgroundColor: checked
            ? theme.colors.primarySoft
            : theme.colors.glassStrong,
          borderColor: checked
            ? theme.colors.borderStrong
            : theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={checked ? theme.colors.primary : theme.colors.muted}
      />
      <Text style={[styles.rowText, { color: theme.colors.text }]}>
        {label}
      </Text>
      {meta ? (
        <Text style={[styles.meta, { color: theme.colors.muted }]}>{meta}</Text>
      ) : null}
    </Pressable>
  );
}

function AddLine({
  onAdd,
  onChangeText,
  placeholder,
  value,
}: {
  onAdd: () => void;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.addLine}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, fieldColors(theme), styles.addInput]}
      />
      <Pressable
        style={[styles.addIcon, { backgroundColor: theme.colors.primary }]}
        onPress={onAdd}
      >
        <Ionicons name="add" size={18} color={theme.colors.surface} />
      </Pressable>
    </View>
  );
}

function ProgressRow({
  isDone,
  onProgress,
  onTitleChange,
  onToggle,
  onDelete,
  progress,
  title,
}: {
  isDone: boolean;
  onProgress: (value: number) => void;
  onTitleChange: (title: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  progress: number;
  title: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.compactRow,
        {
          backgroundColor: theme.colors.glassStrong,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.compactMain}>
        <TextInput
          value={title}
          onChangeText={onTitleChange}
          onEndEditing={(event) => onTitleChange(event.nativeEvent.text.trim())}
          style={[styles.compactTitle, { color: theme.colors.text }]}
        />
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.colors.primarySoft },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${Math.min(100, Math.max(0, progress))}%`,
              },
            ]}
          />
        </View>
      </View>
      <TextInput
        keyboardType="number-pad"
        value={String(progress)}
        onChangeText={(value) =>
          onProgress(Math.min(100, Math.max(0, Number(value) || 0)))
        }
        style={[
          styles.progressInput,
          {
            backgroundColor: theme.colors.glass,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
      <Pressable
        style={[
          styles.toggleButton,
          {
            backgroundColor: isDone
              ? theme.colors.success
              : theme.colors.primarySoft,
          },
        ]}
        onPress={onToggle}
      >
        <Ionicons
          name="checkmark"
          size={15}
          color={isDone ? theme.colors.surface : theme.colors.muted}
        />
      </Pressable>
      <Pressable style={styles.iconOnly} onPress={onDelete}>
        <Ionicons name="trash-outline" size={17} color={theme.colors.danger} />
      </Pressable>
    </View>
  );
}

function getReligionProgress(day: { prayers: Record<PrayerName, boolean> }) {
  const prayerDone = Object.values(day.prayers).filter(Boolean).length;
  const total = 5;

  return Math.round((prayerDone / total) * 100);
}

function fieldColors(theme: ReturnType<typeof useAppTheme>['theme']) {
  return {
    backgroundColor: theme.colors.glassStrong,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  };
}

const styles = StyleSheet.create({
  addIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  addInput: {
    flex: 1,
  },
  addLine: {
    flexDirection: 'row',
    gap: 8,
  },
  checkRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 11,
  },
  compactMain: {
    flex: 1,
    gap: 4,
  },
  compactRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 10,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '800',
    minHeight: 32,
    paddingVertical: 4,
  },
  content: {
    gap: 11,
    paddingBottom: 132,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  gradient: {
    flex: 1,
  },
  iconOnly: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 26,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 8,
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 13,
  },
  progressFill: {
    borderRadius: 999,
    height: 6,
  },
  progressInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    fontWeight: '800',
    minHeight: 34,
    textAlign: 'center',
    width: 46,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
  },
  screen: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0,
  },
  toggleButton: {
    alignItems: 'center',
    borderRadius: 11,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});
