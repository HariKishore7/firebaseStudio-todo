'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...values,
        completed: false,
        createdAt: serverTimestamp(),
      });
      
      form.reset();
      toast({
        title: 'Success!',
        description: 'Your new task has been added.',
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding task: ', error);
      toast({
        title: 'Error',
        description: 'Failed to add task. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // This will run even if the dialog is closed, ensuring the state is always reset for the next time it opens.
      setIsSubmitting(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (isSubmitting) {
      return;
    }
    if (!isOpen) {
        form.reset();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
          <DialogDescription>
            What do you need to get done? Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about your task..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
