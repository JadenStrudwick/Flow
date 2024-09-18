import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TransactionForm, TransactionFormProps } from "./TransactionForm";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Transaction } from "@/lib/transaction";

interface AddTransactionDialogProps {
  updateData: (transaction: Transaction) => void;
}

export function AddTransactionDialog(props: AddTransactionDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Transaction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            {`Add a new transaction here. Click save when you're done.`}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm updateData={props.updateData} setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  )
}
