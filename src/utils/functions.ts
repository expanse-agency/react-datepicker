import type { DatepickerConfig, DatepickerMonth, DatepickerValue, DateRange, DateRangeType } from '@types';

import { dateEndDay, dateIsEq, dateStartDay } from './date';

export function generate42CalendarDates(month: DatepickerMonth, config: DatepickerConfig) {
  const weeks: Date[][] = [];
  let currentDate = new Date(month.year, month.month, 1);
  currentDate.setDate(currentDate.getDate() - ((currentDate.getDay() + (config.weeksStartOnMonday ? 6 : 0)) % 7)); // Adjust to Monday as the first day

  for (let i = 0; i < 6; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (config.dir === 'rtl') {
      week.reverse(); // Reverse the week array if config.dir is 'ltr'
    }
    weeks.push(week);
  }

  return weeks;
}

export function getNextMonthAndYear(m: DatepickerMonth) {
  const newMonth = m.month + 1;
  const year = newMonth > 11 ? m.year + 1 : m.year;

  const month = newMonth > 11 ? 0 : newMonth;

  return { month, year };
}

export function getPreviousMonthAndYear(m: DatepickerMonth) {
  const newMonth = m.month - 1;
  const year = newMonth < 0 ? m.year - 1 : m.year;

  const month = newMonth < 0 ? 11 : newMonth;

  return { month, year };
}

export function formatDateString(d: Date, config: DatepickerConfig, short = false) {
  return d.toLocaleDateString(config.locale, {
    dateStyle: short ? 'short' : 'medium'
  });
}

export function displayPlaceholder(config: DatepickerConfig) {
  return config.placeholder || 'Pick a date';
}

export function displayDateRange(d: DatepickerValue, config: DatepickerConfig) {
  if (!d) return { start: undefined, end: undefined };
  if (config.type !== 'range') return { start: undefined, end: undefined };

  const dr = d as DateRange;

  if (dr.startDate && dr.endDate) {
    return {
      start: formatDateString(dr.startDate, config, true),
      end: formatDateString(dr.endDate, config, true)
    };
  }
  if (dr.startDate) {
    return {
      start: formatDateString(dr.startDate, config, true),
      end: undefined
    };
  }
  if (dr.endDate) {
    return {
      start: undefined,
      end: formatDateString(dr.endDate, config, true)
    };
  }
  return {
    start: undefined,
    end: undefined
  };
}

export function displayDateValue(d: DatepickerValue, config: DatepickerConfig) {
  if (!d) return { label: displayPlaceholder(config), value: undefined };
  const type = dateValueType(d, config);

  if (type === 'single') {
    return {
      label: formatDateString(d as Date, config),
      value: d as Date
    };
  }

  if (type === 'multiple' && Array.isArray(d) && (d as Date[]).length > 0) {
    return {
      label: (d as Date[]).map((date) => formatDateString(date, config)).join(', '),
      value: d as Date[]
    };
  }

  if (type === 'range') {
    const range = d as DateRange;
    if (range.startDate && range.endDate) {
      return {
        label: `${formatDateString(range.startDate, config)} - ${formatDateString(range.endDate, config)}`,
        value: d as DateRange
      };
    }
    if (range.startDate) {
      return {
        label: `${formatDateString(range.startDate, config)} -`,
        value: d as DateRange
      };
    }
    if (range.endDate) {
      return {
        label: `${formatDateString(range.endDate, config)} -`,
        value: d as DateRange
      };
    }
  }

  return {
    label: displayPlaceholder(config),
    value: undefined
  };
}

export function getDateRange(r: DateRangeType): DateRange | undefined {
  switch (r) {
    case 'all_time':
      return undefined;
    case 'today':
      return {
        startDate: dateStartDay(new Date()),
        endDate: dateEndDay(new Date())
      };
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: dateStartDay(yesterday),
        endDate: dateEndDay(yesterday)
      };
    case 'last_7_days':
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 6);
      return {
        startDate: dateStartDay(last7Days),
        endDate: dateEndDay(new Date())
      };
    case 'last_30_days':
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 29);
      return {
        startDate: dateStartDay(last30Days),
        endDate: dateEndDay(new Date())
      };
    case 'this_month':
      const thisMonth = new Date();
      thisMonth.setDate(1);

      const lastDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);

      return {
        startDate: dateStartDay(thisMonth),
        endDate: dateEndDay(lastDayOfMonth)
      };
    case 'last_month':
      const lastMonthStart = new Date();
      lastMonthStart.setDate(1);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

      const lastMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0);

      return {
        startDate: dateStartDay(lastMonthStart),
        endDate: dateEndDay(lastMonthEnd)
      };
  }
}

export function isEqualToRange(d: DatepickerValue, r: DateRangeType) {
  if (r === 'all_time' && !d) return true;
  if (!d) return false;

  const range = d as DateRange;
  if (!range.startDate || !range.endDate) {
    return false;
  }

  const dr = getDateRange(r);
  if (!dr || !dr.startDate || !dr.endDate) {
    return false;
  }

  return dateIsEq(range.startDate, dr.startDate) && dateIsEq(range.endDate, dr.endDate);
}

export function displayDateRangeType(r: DateRangeType, config: DatepickerConfig) {
  if (typeof config.shortcuts === 'object' && config.shortcuts?.[r] !== undefined) {
    return config.shortcuts[r] as string;
  }

  const s = r.replaceAll('_', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function dateValueType(d: DatepickerValue, config: DatepickerConfig) {
  if (!d) return config.type;
  if (!Array.isArray(d) && config.type === 'single') return 'single';
  if (Array.isArray(d) && config.type === 'multiple') return 'multiple';
  if (typeof d === 'object' && !Array.isArray(d) && config.type === 'range') return 'range';
}
