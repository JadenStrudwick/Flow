"use client"

import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { CashFlowChart } from "@/components/CashFlowChart";
import { TransactionTable } from "@/components/TransactionTable";
import { Transaction } from "@/lib/transaction";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { MoreHorizontal, Plus, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingScreen from "@/components/LoadingScreen";

const START_DATE = new Date();
const END_DATE = new Date(START_DATE.getFullYear() + 1, START_DATE.getMonth(), START_DATE.getDate());

export default function Home() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const deleteData = (transaction: Transaction) => {
    const newData = data.filter((t) => t !== transaction);
    setData(newData);
    if (typeof window !== 'undefined') {
      localStorage.setItem("transactions", JSON.stringify(newData));
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
        return <span className={amount < 0 ? 'text-red-500' : 'text-green-500'}>{formatted}</span>;
      }
    },
    {
      accessorKey: "baseDate",
      header: "Base Date",
      cell: ({ row }) => {
        let date = new Date(row.getValue("baseDate"));
        return <span>{date.toLocaleDateString()}</span>;
      }
    },
    {
      accessorKey: "interval",
      header: "Interval",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => deleteData(row.original)}
                className="text-red-500"
              >
                Delete transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

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
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{END_DATE.toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cash Flow Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={data} endDate={END_DATE} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <AddTransactionDialog updateData={updateData}/>
          </CardHeader>
          <CardContent>
            <TransactionTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}