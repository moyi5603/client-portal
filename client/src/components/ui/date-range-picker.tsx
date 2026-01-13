import React, { useState } from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar as CalendarComponent } from './calendar';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface DateRangePickerProps {
  dateRange?: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date } | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  placeholder = "选择日期范围",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = () => {
    if (!dateRange?.from) return placeholder;
    
    if (dateRange.from && !dateRange.to) {
      return format(dateRange.from, 'yyyy-MM-dd');
    }
    
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'yyyy-MM-dd')} - ${format(dateRange.to, 'yyyy-MM-dd')}`;
    }
    
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            onDateRangeChange(range);
            if (range?.from && range?.to) {
              setIsOpen(false);
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};