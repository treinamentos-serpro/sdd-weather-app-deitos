const EMPTY_VALUE = '—';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
  weekday: 'short',
});

export function formatIsoDatePtBr(isoDate: string | null): string {
  if (isoDate === null) {
    return EMPTY_VALUE;
  }

  const date = new Date(`${isoDate}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return dateFormatter.format(date);
}
