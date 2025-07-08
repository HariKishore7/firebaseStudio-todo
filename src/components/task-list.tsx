'use client';

import type { Task } from '@/lib/types';
import TaskItem from './task-item';
import { Skeleton } from './ui/skeleton';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

export default function TaskList({ tasks, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center space-x-4 p-3">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4 p-3">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4 p-3">
          <Skeleton className="h-5 w-5 rounded-sm" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-3 w-[180px]" />
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p className="mb-2 text-lg">You're all caught up!</p>
        <p className="text-sm">There are no tasks in this list.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
