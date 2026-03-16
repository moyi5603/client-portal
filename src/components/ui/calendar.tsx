import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../lib/utils';
import { Button } from './button';
import './calendar.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('ui-calendar', className)}
      classNames={{
        months: 'ui-calendar-months',
        month: 'ui-calendar-month',
        caption: 'ui-calendar-caption',
        caption_label: 'ui-calendar-caption-label',
        nav: 'ui-calendar-nav',
        nav_button: 'ui-calendar-nav-button',
        nav_button_previous: 'ui-calendar-nav-button-previous',
        nav_button_next: 'ui-calendar-nav-button-next',
        table: 'ui-calendar-table',
        head_row: 'ui-calendar-head-row',
        head_cell: 'ui-calendar-head-cell',
        row: 'ui-calendar-row',
        cell: 'ui-calendar-cell',
        day: 'ui-calendar-day',
        day_range_end: 'ui-calendar-day-range-end',
        day_selected: 'ui-calendar-day-selected',
        day_today: 'ui-calendar-day-today',
        day_outside: 'ui-calendar-day-outside',
        day_disabled: 'ui-calendar-day-disabled',
        day_range_middle: 'ui-calendar-day-range-middle',
        day_hidden: 'ui-calendar-day-hidden',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft size={16} />,
        IconRight: () => <ChevronRight size={16} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };

