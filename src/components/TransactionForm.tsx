import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction } from '@/lib/transaction';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  name: z.string().min(1),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num !== 0;
    },
    {
      message: 'Amount must be a non-zero number',
    }
  ),
  baseDate: z.date(),
  transactionType: z.enum(['ONE_TIME', 'RECURRING']),
  intervalNumber: z.number().min(1).max(100).optional(),
  intervalUnit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR']).optional(),
});

export interface TransactionFormProps {
  initialData?: Transaction;
  updateData: (transaction: Transaction) => void;
  setDialogOpen: (open: boolean) => void;
}

export function TransactionForm({ initialData, updateData, setDialogOpen }: TransactionFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          amount: initialData.amount.toString(),
          baseDate: new Date(initialData.baseDate),
          transactionType: initialData.recurrence.type === 'ONE_TIME' ? 'ONE_TIME' : 'RECURRING',
          intervalNumber: initialData.recurrence.type === 'RECURRING' ? initialData.recurrence.interval : 1,
          intervalUnit: initialData.recurrence.type === 'RECURRING' ? initialData.recurrence.unit : 'MONTH',
        }
      : {
          transactionType: 'RECURRING',
          intervalNumber: 1,
          intervalUnit: 'MONTH',
        },
  });

  const transactionType = form.watch('transactionType');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          const transaction: Transaction = {
            name: data.name,
            amount: parseFloat(data.amount),
            baseDate: data.baseDate.toISOString(),
            recurrence: data.transactionType === 'ONE_TIME'
              ? { type: 'ONE_TIME' }
              : { 
                  type: 'RECURRING', 
                  interval: data.intervalNumber!, 
                  unit: data.intervalUnit!
                }
          };
          updateData(transaction);
          form.reset();
          setDialogOpen(false);
        })}
        className="flex flex-col gap-4"
        autoComplete="off"
      >

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormDescription>Enter the name of the transaction</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter amount (e.g., 100 or -50)"
                  autoComplete="off"
                />
              </FormControl>
              <FormDescription>
                Enter the amount (positive for income, negative for expense)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="baseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Transaction</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(value) => {
                      field.onChange(value);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>Enter the date of the transaction</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="ONE_TIME" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      One-time
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="RECURRING" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Recurring
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {transactionType === 'RECURRING' && (
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="intervalNumber"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Interval</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="100"
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="intervalUnit"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAY">Day(s)</SelectItem>
                      <SelectItem value="WEEK">Week(s)</SelectItem>
                      <SelectItem value="MONTH">Month(s)</SelectItem>
                      <SelectItem value="YEAR">Year(s)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {transactionType === 'RECURRING' && (
          <FormDescription>Set the recurrence interval (e.g., every 2 weeks)</FormDescription>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}