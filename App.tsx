import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import StoryDisplay from './components/StoryDisplay';
import UserInput from './components/UserInput';
import { generateStoryPart } from './services/geminiService';
import { Author } from './types';
import type { StoryPart, ImageData } from './types';

function App() {
  const [storyHistory, setStoryHistory] = useState<StoryPart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChoices, setCurrentChoices] = useState<[string, string] | null>(null);
  const [lastRequest, setLastRequest] = useState<{ text: string, image?: ImageData } | null>(null);

  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window.speechSynthesis !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!text || typeof window.speechSynthesis === 'undefined') {
      return;
    }
    window.speechSynthesis.cancel(); // Stop any currently playing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set language for better pronunciation
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleUserInput = useCallback(async (text: string, image?: ImageData) => {
    setIsLoading(true);
    setError(null);
    setCurrentChoices(null);
    if (typeof window.speechSynthesis !== 'undefined') {
      window.speechSynthesis.cancel();
    }

    const newUserPart: StoryPart = {
      author: Author.USER,
      text: image ? undefined : text, // Don't show "uploaded image..." text
      imageUrl: image ? URL.createObjectURL(new Blob([Buffer.from(image.base64, 'base64')], { type: image.mimeType })) : undefined,
    };

    const promptHistory = [...storyHistory];
    const updatedHistoryWithUserPart = [...promptHistory, newUserPart];
    setStoryHistory(updatedHistoryWithUserPart);
    setLastRequest({ text, image }); // Store for potential retry

    try {
      const aiResponse = await generateStoryPart(promptHistory, text, image);
      
      const newAiPart: StoryPart = {
        author: Author.AI,
        text: aiResponse.story,
        choices: [aiResponse.choice1, aiResponse.choice2],
      };

      setStoryHistory(prev => [...prev, newAiPart]);
      setCurrentChoices([aiResponse.choice1, aiResponse.choice2]);
      speak(aiResponse.story);
      setLastRequest(null); // Clear last request on success
    } catch (err: any) {
      const errorMessage = "Failed to generate story. Please check your API key and try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [storyHistory, speak]);
  
  const handleRetry = useCallback(async () => {
    if (!lastRequest) return;

    setIsLoading(true);
    setError(null);
    setCurrentChoices(null);

    // The user's part is already the last element in storyHistory.
    // The history for the prompt should be everything *before* that last user part.
    const promptHistory = storyHistory.slice(0, -1);

    try {
        const aiResponse = await generateStoryPart(promptHistory, lastRequest.text, lastRequest.image);
      
        const newAiPart: StoryPart = {
          author: Author.AI,
          text: aiResponse.story,
          choices: [aiResponse.choice1, aiResponse.choice2],
        };

        // Append the AI response to the history that already contains the user part.
        setStoryHistory(prev => [...prev, newAiPart]);
        setCurrentChoices([aiResponse.choice1, aiResponse.choice2]);
        speak(aiResponse.story);
        setLastRequest(null); // Clear on success
    } catch (err: any) {
        // Set error again if retry fails.
        const errorMessage = "Retry failed. Please check your API key and network connection.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [lastRequest, storyHistory, speak]);

  const handleNewStory = useCallback(() => {
    if (typeof window.speechSynthesis !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setStoryHistory([]);
    setIsLoading(false);
    setError(null);
    setCurrentChoices(null);
    setLastRequest(null);
  }, []);
  
  return (
    <div className="h-screen w-screen flex flex-col font-sans">
      <Header onNewStory={handleNewStory} />
      <main className="flex-1 flex flex-col min-h-0 bg-slate-900">
        <StoryDisplay history={storyHistory} isLoading={isLoading} onSpeak={speak} />
        {error && (
          <div className="text-center p-4 bg-slate-800 border-t border-slate-700 flex flex-col items-center gap-3">
            <p className="font-medium text-red-400">{error}</p>
            {lastRequest && (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <UserInput 
            onSend={handleUserInput}
            onChoice={(choice) => handleUserInput(choice)}
            isLoading={isLoading} 
            choices={currentChoices}
        />
      </main>
    </div>
  );
}

export default App;