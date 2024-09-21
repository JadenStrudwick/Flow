"use client"

import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { CashFlowChart } from "@/components/CashFlowChart";
import { TransactionTable } from "@/components/TransactionTable";
import { Transaction } from "@/lib/transaction";
import { useEffect, useState } from "react";
import { DollarSign, Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingScreen from "@/components/LoadingScreen";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FormControl,
} from '@/components/ui/form';

export default function Home() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate() ) );

  useEffect(() => {
    const savedData = localStorage.getItem("transactions");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("transactions", JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateData = (transaction: Transaction) => {
    const newData = [...data, transaction];
    setData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(newData));
    }
  };

  const onUpdate = (updatedTransaction: Transaction) => {
    const newData = data.map(t => 
      t.name === updatedTransaction.name && t.baseDate === updatedTransaction.baseDate
        ? updatedTransaction
        : t
    );
    setData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(newData));
    }
  };

  const onDelete = (transactionToDelete: Transaction) => {
    const newData = data.filter(t => 
      !(t.name === transactionToDelete.name && t.baseDate === transactionToDelete.baseDate)
    );
    setData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(newData));
    }
  };

  const totalBalance = data.reduce((sum, transaction) => sum + transaction.amount, 0);
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(totalBalance);

  if (!isLoaded) {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Flow</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formattedBalance}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forecast End Date</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
              <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="text-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1">
                        {endDate.toLocaleDateString()}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode='single'
                        selected={endDate}
                        onSelect={newDate => newDate && setEndDate(newDate)} 
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cash Flow Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={data} endDate={endDate} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <AddTransactionDialog updateData={updateData}/>
          </CardHeader>
          <CardContent>
            <TransactionTable data={data} onUpdate={onUpdate} onDelete={onDelete} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}