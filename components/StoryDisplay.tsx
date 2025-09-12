
import React, { useRef, useEffect } from 'react';
import { Author } from '../types';
import type { StoryPart } from '../types';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface StoryDisplayProps {
  history: StoryPart[];
  isLoading: boolean;
  onSpeak: (text: string) => void;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ history, isLoading, onSpeak }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);
  
  const WelcomeMessage: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-slate-800/50 my-4">
      <Icon name="upload" className="w-16 h-16 text-slate-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-300">Welcome to Story Weaver!</h2>
      <p className="mt-2 text-slate-400 max-w-md">
        Your adventure begins with an image. Upload a picture to spark a new story, and let's create a unique tale together.
      </p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {history.length === 0 && !isLoading && <WelcomeMessage />}
      {history.map((part, index) => (
        <div key={index} className={`flex items-start gap-4 ${part.author === Author.USER ? 'justify-end' : 'justify-start'}`}>
          {part.author === Author.AI && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Icon name="sparkles" className="w-5 h-5 text-white" />
            </div>
          )}
          <div className={`group max-w-lg rounded-xl p-4 relative ${part.author === Author.USER ? 'bg-sky-700 text-white rounded-br-none' : 'bg-slate-700 text-slate-300 rounded-bl-none'}`}>
            {part.imageUrl && (
              <img src={part.imageUrl} alt="User upload" className="rounded-lg mb-3 max-h-60 w-auto" />
            )}
            {part.text && <p className="whitespace-pre-wrap">{part.text}</p>}
            {part.author === Author.AI && part.text && (
              <button 
                onClick={() => onSpeak(part.text as string)}
                className="absolute bottom-2 right-2 p-1 rounded-full bg-slate-800/50 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                aria-label="Read story part aloud"
              >
                <Icon name="volumeUp" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
         <div className="flex items-start gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
              <Icon name="sparkles" className="w-5 h-5 text-white" />
            </div>
            <div className="max-w-lg rounded-xl p-4 bg-slate-700 text-slate-300 rounded-bl-none">
                <LoadingSpinner />
            </div>
         </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default StoryDisplay;
