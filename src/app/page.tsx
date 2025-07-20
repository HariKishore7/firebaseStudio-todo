'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Zap } from 'lucide-react';
import AddTaskDialog from '@/components/add-task-dialog';
import TaskList from '@/components/task-list';
import { useToast } from '@/hooks/use-toast';
import { prioritizeTasks } from '@/ai/flows/prioritize-tasks';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // A placeholder check to prevent Firebase errors if config is not set, this may need to be updated.
    if (!db.app.options.apiKey) {
        console.warn("Firebase config is not set. Please update src/lib/firebase.ts");
        setIsLoading(false);
        toast({
          title: "Firebase Not Configured",
          description: "Please configure your Firebase credentials in src/lib/firebase.ts to use the app.",
          variant: "destructive",
          duration: Infinity,
        });
        return;
    }

    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks: ', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch tasks. Please check your Firebase configuration and security rules.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const { activeTasks, completedTasks } = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (task.completed) {
          acc.completedTasks.push(task);
        } else {
          acc.activeTasks.push(task);
        }
        return acc;
      },
      { activeTasks: [] as Task[], completedTasks: [] as Task[] }
    );
  }, [tasks]);

  const handleAiPrioritize = async () => {
    if (activeTasks.length === 0) {
      toast({
        title: 'No Active Tasks',
        description: 'There are no active tasks to prioritize.',
      });
      return;
    }
    setIsAiLoading(true);
    try {
      const tasksToPrioritize = activeTasks.map(({ title, description }) => ({ title, description: description || '' }));
      const prioritizedResult = await prioritizeTasks(tasksToPrioritize);

      const batch = writeBatch(db);
      prioritizedResult.forEach((pTask) => {
        const originalTask = activeTasks.find(t => t.title === pTask.title && (t.description || '') === pTask.description);
        if (originalTask) {
          const taskRef = doc(db, 'tasks', originalTask.id);
          batch.update(taskRef, { priority: pTask.priority });
        }
      });
      await batch.commit();

      toast({
        title: 'Success!',
        description: 'Your tasks have been prioritized by AI.',
      });
    } catch (error) {
      console.error('Error prioritizing tasks:', error);
      toast({
        title: 'AI Prioritization Failed',
        description: 'Could not prioritize tasks. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary font-headline">Task Prioritizer</h1>
            <p className="text-muted-foreground">Your intelligent to-do list.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAiPrioritize} disabled={isAiLoading || activeTasks.length === 0}>
              {isAiLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Prioritize with AI
            </Button>
            <AddTaskDialog />
          </div>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>Manage your daily tasks efficiently.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-4">
                <TaskList tasks={activeTasks} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <TaskList tasks={completedTasks} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        Built with Next.js, TypeScript, Firebase, and Genkit AI.
      </footer>
    </div>
  );
}
