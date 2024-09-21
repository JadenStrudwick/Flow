"use client"

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/lib/transaction"
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface DataTableProps {
  data: Transaction[]
  onUpdate: (updatedTransaction: Transaction) => void
  onDelete: (transactionToDelete: Transaction) => void
}

export const TransactionTable: React.FC<DataTableProps> = ({ data, onUpdate, onDelete }) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className={amount < 0 ? "text-red-500" : "text-green-500"}>{formatted}</div>;
      },
    },
    {
      accessorKey: "baseDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("baseDate"));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "recurrence",
      header: "Recurrence",
      cell: ({ row }) => {
        const recurrence = row.getValue("recurrence") as Transaction["recurrence"];
        if (recurrence.type === "ONE_TIME") {
          return "One-time";
        } else {
          return `Every ${recurrence.interval} ${recurrence.unit.toLowerCase()}${recurrence.interval > 1 ? "s" : ""}`;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(transaction)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          onUpdate={(updatedTransaction: Transaction) => {
            onUpdate(updatedTransaction);
            setEditingTransaction(null);
          }}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
};