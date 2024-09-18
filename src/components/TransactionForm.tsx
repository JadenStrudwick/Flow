'use client';

import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction } from '@/lib/transaction';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), {
      message: 'Amount must be a number',
    }),
  baseDate: z.date(),
  interval: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
});

export interface TransactionFormProps {
  updateData: (transaction: Transaction) => void;
  setDialogOpen: (open: boolean) => void;
}

export function TransactionForm(props: TransactionFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          // Convert the baseDate to ISO string before updating
          const transaction: Transaction = {
            ...data,
            baseDate: data.baseDate.toISOString(),
          };
          props.updateData(transaction);
          form.reset();
          props.setDialogOpen(false);
        })}
        className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transation Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} type='number' />
              </FormControl>
              <FormDescription>
                Enter the amount of the transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='baseDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date of Transaction</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}>
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={(value) => {
                      field.onChange(value);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Enter the date of the transaction
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='interval'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select the recurrance interval' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='ONCE'>Once</SelectItem>
                  <SelectItem value='DAILY'>Daily</SelectItem>
                  <SelectItem value='WEEKLY'>Weekly</SelectItem>
                  <SelectItem value='MONTHLY'>Monthly</SelectItem>
                  <SelectItem value='YEARLY'>Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  );
}
