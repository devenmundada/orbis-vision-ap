'use server';

/**
 * @fileOverview An AI agent for determining optimal base detection parameters for the YOLOv8 model.
 *
 * - determineDetectionParameters - A function that handles the process of determining optimal base detection parameters.
 * - DetermineDetectionParametersInput - The input type for the determineDetectionParameters function.
 * - DetermineDetectionParametersOutput - The return type for the determineDetectionParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineDetectionParametersInputSchema = z.object({
  imageExamples: z
    .array(
      z.string().describe(
        "A list of data URIs of simulated test images, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      )
    )
    .describe('A list of example images of the objects to be detected.'),
  objectClasses: z
    .array(z.string())
    .describe('A list of object classes that the YOLOv8 model will detect (e.g., Toolbox, Oxygen Tank, Fire Extinguisher).'),
});
export type DetermineDetectionParametersInput = z.infer<typeof DetermineDetectionParametersInputSchema>;

const DetermineDetectionParametersOutputSchema = z.object({
  confidenceThreshold: z.number().describe('The optimal confidence threshold for the YOLOv8 model.'),
  iouThreshold: z.number().describe('The optimal IoU (Intersection over Union) threshold for the YOLOv8 model.'),
  description: z.string().describe('A description of why this threshold was chosen'),
});
export type DetermineDetectionParametersOutput = z.infer<typeof DetermineDetectionParametersOutputSchema>;

export async function determineDetectionParameters(input: DetermineDetectionParametersInput): Promise<DetermineDetectionParametersOutput> {
  return determineDetectionParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineDetectionParametersPrompt',
  input: {schema: DetermineDetectionParametersInputSchema},
  output: {schema: DetermineDetectionParametersOutputSchema},
  prompt: `You are an expert AI model configuration specialist. Your job is to analyze a set of test images and the object classes that a YOLOv8 model will detect, and then determine the optimal base detection parameters for the model.

Object Classes: {{objectClasses}}

Here are some example images:
{{#each imageExamples}}
  {{media url=this}}
{{/each}}

Based on these images and object classes, what should the confidence threshold and IoU threshold be set to? Describe the reasoning for your choice. Return a JSON object with the keys confidenceThreshold, iouThreshold, and description. Only return a valid JSON response.
`,
});

const determineDetectionParametersFlow = ai.defineFlow(
  {
    name: 'determineDetectionParametersFlow',
    inputSchema: DetermineDetectionParametersInputSchema,
    outputSchema: DetermineDetectionParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
