
export enum Author {
  USER = 'user',
  AI = 'ai',
}

export interface StoryPart {
  author: Author;
  text?: string;
  imageUrl?: string;
  choices?: [string, string];
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface GeminiStoryResponse {
  story: string;
  choice1: string;
  choice2: string;
}
