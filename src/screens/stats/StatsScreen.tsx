import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyStore } from '../../features/daily/dailyStore';
import { useLoops } from '../../features/loops/useLoops';
import {
  formatShortDate,
  getDateKey,
  getDateRange,
} from '../../shared/date/dateUtils';
import { useAppTheme } from '../../shared/theme/ThemeProvider';

type Filter = 'all' | 'month' | 'week' | 'year';

const filters: Filter[] = ['week', 'month', 'year', 'all'];

export function StatsScreen() {
  const { theme } = useAppTheme();
  const daily = useDailyStore();
  const { loops } = useLoops();
  const [filter, setFilter] = useState<Filter>('week');
  const isDark = theme.mode === 'dark';
  const stats = useMemo(() => {
    const dates = getDateRange(filter);
    const dailyCards = dates
      .map((date) => getDayScore(date, loops, daily.state))
      .filter((day) => day.hasData);
    const best = [...dailyCards].sort((a, b) => b.score - a.score)[0];
    const worst = [...dailyCards].sort((a, b) => a.score - b.score)[0];

    return {
      best,
      cards: dailyCards.reverse(),
      streak: getStreak(dailyCards),
      worst,
    };
  }, [daily.state, filter, loops]);

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
            Overview
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Statistics
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            Daily commitment across habits, goals, and religion.
          </Text>

          <View style={styles.filterRow}>
            {filters.map((item) => {
              const isSelected = filter === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.filter,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.primarySoft,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => setFilter(item)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color: isSelected
                          ? theme.colors.surface
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Best day"
              value={stats.best ? `${stats.best.score}%` : '-'}
            />
            <SummaryCard
              label="Worst day"
              value={stats.worst ? `${stats.worst.score}%` : '-'}
            />
            <SummaryCard label="Streak" value={`${stats.streak} days`} />
          </View>

          {stats.cards.length === 0 ? (
            <BlurView
              intensity={isDark ? 20 : 42}
              tint={theme.mode}
              style={[
                styles.emptyPanel,
                {
                  backgroundColor: theme.colors.glass,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
                No tracked days yet. Add habits, goals, or religion tasks first.
              </Text>
            </BlurView>
          ) : (
            <View style={styles.dayList}>
              {stats.cards.map((day) => (
                <BlurView
                  key={day.date}
                  intensity={isDark ? 16 : 34}
                  tint={theme.mode}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: theme.colors.glass,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.dayTop}>
                    <Text
                      style={[styles.dayTitle, { color: theme.colors.text }]}
                    >
                      {formatShortDate(day.date)}
                    </Text>
                    <Text
                      style={[styles.dayScore, { color: theme.colors.text }]}
                    >
                      {day.score}%
                    </Text>
                  </View>
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
                          width: `${day.score}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayMeta, { color: theme.colors.muted }]}>
                    {day.done} done · {day.failed} failed · journal{' '}
                    {day.hasJournal ? 'written' : 'empty'}
                  </Text>
                </BlurView>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: theme.colors.muted }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
        {value}
      </Text>
    </View>
  );
}

function getDayScore(
  date: string,
  loops: ReturnType<typeof useLoops>['loops'],
  dailyState: ReturnType<typeof useDailyStore>['state'],
) {
  const habitStatuses = loops
    .map((loop) => loop.history.find((entry) => entry.date === date)?.status)
    .filter(Boolean);
  const journal = dailyState.journal[date];
  const religion = dailyState.religion.days[date];
  const goalStatuses = journal?.goals.map((goal) => goal.status) ?? [];
  const prayerStatuses = religion
    ? Object.values(religion.prayers).map((done) => (done ? 'done' : 'pending'))
    : [];
  const religionStatuses = religion
    ? [
        ...prayerStatuses,
        ...religion.sunnah.map((item) => item.status),
        religion.quranDone ? 'done' : 'pending',
        religion.lessonStatus,
      ]
    : [];
  const statuses = [...habitStatuses, ...goalStatuses, ...religionStatuses];
  const done = statuses.filter((status) => status === 'done').length;
  const failed = statuses.filter((status) => status === 'failed').length;
  const decided = done + failed;
  const hasJournal = Boolean(journal?.note.trim());
  const hasData = statuses.length > 0 || hasJournal;

  return {
    date,
    done,
    failed,
    hasData,
    hasJournal,
    score:
      decided === 0
        ? hasJournal
          ? 100
          : 0
        : Math.round((done / decided) * 100),
  };
}

function getStreak(days: ReturnType<typeof getDayScore>[]) {
  const sortedDays = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const day of sortedDays) {
    if (day.date > getDateKey()) {
      continue;
    }

    if (day.score < 70) {
      break;
    }

    streak += 1;
  }

  return streak;
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 132,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  dayCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 14,
  },
  dayList: {
    gap: 9,
  },
  dayMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayScore: {
    fontSize: 22,
    fontWeight: '800',
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  dayTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyPanel: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
    padding: 18,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  filter: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  gradient: {
    flex: 1,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  screen: {
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -6,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 78,
    padding: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
