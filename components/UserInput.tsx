import React, { useState, useRef } from 'react';
import type { ImageData } from '../types';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface UserInputProps {
  onSend: (text: string, image?: ImageData) => void;
  onChoice: (choice: string) => void;
  isLoading: boolean;
  choices: [string, string] | null;
}

const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const UserInput: React.FC<UserInputProps> = ({ onSend, onChoice, isLoading, choices }) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageData = await fileToImageData(file);
        onSend(`Uploaded an image to continue the story.`, imageData);
      } catch (error) {
        console.error("Error converting file:", error);
        alert("There was an error processing your image. Please try again.");
      }
    }
    // Reset file input value to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const handleChoiceClick = (choice: string) => {
    if(!isLoading){
        onChoice(choice);
    }
  };
  
  return (
    <div className="bg-slate-800 p-4 border-t border-slate-700">
      <div className="max-w-4xl mx-auto">
        {choices && !isLoading && (
          <div className="mb-4 space-y-2 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button 
                  onClick={() => handleChoiceClick(choices[0])}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-semibold text-sky-400">Choice 1:</span> {choices[0]}
                </button>
                <button 
                  onClick={() => handleChoiceClick(choices[1])}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-semibold text-fuchsia-400">Choice 2:</span> {choices[1]}
                </button>
            </div>
            <button
              onClick={() => handleChoiceClick('Surprise me!')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="sparkles" className="w-5 h-5" />
              Surprise Me!
            </button>
          </div>
        )}
        
        <div className="flex items-center bg-slate-700 rounded-full p-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Upload image"
          >
            <Icon name="upload" className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isLoading ? "Weaving the next part of the story..." : "Type your own idea or choose an option..."}
            className="flex-1 bg-transparent px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !text.trim()}
            className="p-2 rounded-full bg-sky-600 text-white hover:bg-sky-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Icon name="send" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInput;