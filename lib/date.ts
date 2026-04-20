export function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'No analyses yet';
  }

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatRelativeDay(value: string) {
  const date = new Date(value);
  const now = new Date();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffInDays = Math.round(
    (startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays === 1) {
    return 'Yesterday';
  }

  return formatDate(value);
}
