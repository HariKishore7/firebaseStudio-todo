'use client';

import { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react';
import EditTaskDialog from './edit-task-dialog';
import { useToast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    const taskRef = doc(db, 'tasks', task.id);
    try {
      await updateDoc(taskRef, {
        completed: !task.completed,
      });
    } catch (error) {
      console.error('Error updating task: ', error);
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    setIsDeleting(true);
    const taskRef = doc(db, 'tasks', task.id);
    try {
      await deleteDoc(taskRef);
      toast({
        title: 'Task Deleted',
        description: `"${task.title}" has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting task: ', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const priorityVariant = {
    High: 'destructive',
    Medium: 'secondary',
    Low: 'outline',
  } as const;

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg transition-colors duration-200 hover:bg-card-foreground/5 data-[completed=true]:bg-card-foreground/5" data-completed={task.completed}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isUpdating}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            className="transition-all"
          />
          <div className="grid gap-1 flex-1 min-w-0">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium cursor-pointer truncate transition-colors',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>
            {task.description && (
              <p className={cn('text-sm text-muted-foreground truncate transition-colors', task.completed && 'line-through')}>
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && !task.completed && (
            <Badge variant={priorityVariant[task.priority] || 'secondary'} className="hidden sm:inline-flex">{task.priority}</Badge>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowEditDialog(true)} disabled={task.completed}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowDeleteConfirm(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task:
              <span className="font-semibold"> "{task.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
