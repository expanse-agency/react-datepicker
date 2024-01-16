import React from 'react';

import { DatepickerConfig, DatepickerValue, DateRange } from '@types';
import { getNextMonthAndYear, getPreviousMonthAndYear } from '@utils';

import DatepickerCalendar from './DatepickerCalendar';
import DatepickerExpandedFooter from './DatepickerExpandedFooter';
import DatepickerExpandedShortcuts from './DatepickerExpandedShortcuts';

interface Props {
  value: DatepickerValue;
  onChange: (date: DatepickerValue) => void;
  config: DatepickerConfig;
}

export default function DatepickerExpanded({ value, onChange, config }: Props) {
  const [internalValue, setInternalValue] = React.useState(value);
  const [month, setMonth] = React.useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });

  const onApply = () => {
    if (config.type !== 'range') return;
    const r = internalValue as DateRange;
    if (!r.startDate || !r.endDate) return;

    onChange(internalValue);
  };

  const hasFooter = config.footer && config.type === 'range';
  const hasShortcuts = config.shortcuts && config.type === 'range';

  const props = {
    value: hasFooter ? internalValue : value,
    onChange: hasFooter ? setInternalValue : onChange,
    config
  };

  return (
    <div className="border-1 relative inline-flex w-min flex-col flex-wrap divide-y divide-inherit rounded-xl border-gray-100 px-0 shadow-sm md:w-auto md:flex-row md:divide-x md:divide-y-0">
      {hasShortcuts && <DatepickerExpandedShortcuts {...props} />}
      <div className="inline-flex flex-col divide-y divide-gray-100">
        <div className="inline-flex  divide-x divide-gray-100">
          <DatepickerCalendar {...props} month={month} onChangeMonth={setMonth} />
          <div className="hidden sm:inline-flex">
            <DatepickerCalendar {...props} month={getNextMonthAndYear(month)} onChangeMonth={(m) => setMonth(getPreviousMonthAndYear(m))} />
          </div>
        </div>
        {hasFooter && <DatepickerExpandedFooter onApply={onApply} {...props} />}
      </div>
    </div>
  );
}