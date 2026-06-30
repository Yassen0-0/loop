export function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getRecentDateCards(count = 7, selectedDate = getDateKey()) {
  const today = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - index - 1));
    const dateKey = getDateKey(date);

    return {
      dateKey,
      day: date.getDate().toString(),
      isSelected: dateKey === selectedDate,
      label: new Intl.DateTimeFormat('en', { weekday: 'short' })
        .format(date)
        .slice(0, 1),
    };
  });
}

export function getDateRange(filter: 'week' | 'month' | 'year' | 'all') {
  const today = new Date();
  const start = new Date(today);

  if (filter === 'week') {
    start.setDate(today.getDate() - 6);
  } else if (filter === 'month') {
    start.setMonth(today.getMonth() - 1);
  } else if (filter === 'year') {
    start.setFullYear(today.getFullYear() - 1);
  } else {
    start.setFullYear(2020);
  }

  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= today) {
    dates.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function formatShortDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}
