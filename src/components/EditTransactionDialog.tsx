import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm } from "./TransactionForm";
import { Transaction } from "@/lib/transaction";

interface EditTransactionDialogProps {
  transaction: Transaction;
  onUpdate: (updatedTransaction: Transaction) => void;
  onClose: () => void;
}

export function EditTransactionDialog({ transaction, onUpdate, onClose }: EditTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            {`Edit the transaction details here. Click submit when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          initialData={transaction}
          updateData={(updatedTransaction) => {
            onUpdate(updatedTransaction);
            setIsOpen(false);
          }}
          setDialogOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
}