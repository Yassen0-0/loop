import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getRecentDateCards } from '../date/dateUtils';
import { useAppTheme } from '../theme/ThemeProvider';

export function DateStrip({
  onSelectDate,
  selectedDate,
}: {
  onSelectDate: (date: string) => void;
  selectedDate: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      {getRecentDateCards(7, selectedDate).map((date) => (
        <Pressable
          key={date.dateKey}
          style={[
            styles.cell,
            {
              backgroundColor: date.isSelected
                ? theme.colors.glassStrong
                : theme.colors.glass,
              borderColor: date.isSelected
                ? theme.colors.borderStrong
                : theme.colors.border,
            },
          ]}
          onPress={() => onSelectDate(date.dateKey)}
        >
          <Text style={[styles.label, { color: theme.colors.muted }]}>
            {date.label}
          </Text>
          <Text style={[styles.day, { color: theme.colors.text }]}>
            {date.day}
          </Text>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: date.isSelected
                  ? theme.colors.primary
                  : theme.colors.mutedLight,
              },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 64,
    paddingVertical: 8,
  },
  day: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
    marginTop: 2,
  },
  dot: {
    borderRadius: 3,
    height: 6,
    marginTop: 4,
    width: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
});
