'use server';

/**
 * @fileOverview This file defines a Genkit flow for prioritizing tasks based on urgency and importance.
 *
 * - prioritizeTasks - A function that prioritizes a list of tasks based on content analysis.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The output type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the task.'),
    description: z.string().describe('A detailed description of the task.'),
  })
);
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the task.'),
    description: z.string().describe('A detailed description of the task.'),
    priority: z
      .string()
      .describe(
        'The priority of the task, can be High, Medium, or Low. Prioritize based on urgency and importance.'
      ),
  })
);
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are a task prioritization expert. You will receive a list of tasks with titles and descriptions.
Your job is to prioritize each task as High, Medium, or Low based on the task's urgency and importance.

Here are the tasks:

{{#each this}}
- Title: {{{title}}}, Description: {{{description}}}
{{/each}}

Return a list of tasks with their original title and description, and a new "priority" field set to either "High", "Medium", or "Low".
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
