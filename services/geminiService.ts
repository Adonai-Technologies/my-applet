import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { StoryPart, ImageData, GeminiStoryResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "The next part of the story, 2-3 sentences long.",
    },
    choice1: {
      type: Type.STRING,
      description: "The first distinct choice for the user to continue the story.",
    },
    choice2: {
      type: Type.STRING,
      description: "The second distinct choice for the user to continue the story.",
    },
  },
  required: ["story", "choice1", "choice2"],
};

function buildPrompt(history: StoryPart[], userInput: string, newImage: boolean): string {
  const storySoFar = history
    .map(part => `${part.author === 'user' ? 'You' : 'I'} said: "${part.text || '[Image provided]'}"`)
    .join('\n');

  if (history.length === 0 && newImage) {
    return `You are an imaginative storyteller. Analyze this image. Based on what you see (objects, mood, environment, people, style), start a short, engaging story of 2-3 sentences. End your response by providing two distinct, branching choices for me to continue the adventure. Respond in the required JSON format.`;
  }
  
  if (newImage) {
    return `You are an imaginative storyteller continuing a story we are writing together. Here is the story so far:\n${storySoFar}\n\nNow, I'm adding this new scene from the image provided. Weave this image into the narrative in 2-3 sentences, continuing from where we left off. Then, give me two new, distinct choices to continue. Respond in the required JSON format.`;
  }
  
  if (userInput.toLowerCase().includes('surprise me')) {
     return `You are an imaginative storyteller continuing a story we are writing together. Here is the story so far:\n${storySoFar}\n\nMy choice is to be surprised! Continue the story in 2-3 sentences with a completely unexpected and creative twist that I wouldn't see coming. Then, give me two new, distinct choices to continue. Respond in the required JSON format.`;
  }

  return `You are an imaginative storyteller continuing a story we are writing together. Here is the story so far:\n${storySoFar}\n\nMy choice or addition is: "${userInput}". Continue the story in 2-3 sentences based on my input. Then, give me two new, distinct choices to continue. Respond in the required JSON format.`;
}

export const generateStoryPart = async (
  history: StoryPart[],
  userInput: string,
  image?: ImageData
): Promise<GeminiStoryResponse> => {
  const prompt = buildPrompt(history, userInput, !!image);
  
  const contentParts: any[] = [{ text: prompt }];

  if (image) {
    contentParts.unshift({
      inlineData: {
        data: image.base64,
        mimeType: image.mimeType,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // FIX: The 'contents' field should be an object with a 'parts' array for a single-turn request, not an array of content objects.
      contents: { parts: contentParts },
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.8,
      },
    });
    
    const jsonText = response.text.trim();
    // Sometimes the response might be wrapped in markdown
    const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    const parsedResponse = JSON.parse(cleanedJsonText) as GeminiStoryResponse;

    if (!parsedResponse.story || !parsedResponse.choice1 || !parsedResponse.choice2) {
      throw new Error("Invalid response structure from AI.");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate story. Please check your API key and try again.");
  }
};