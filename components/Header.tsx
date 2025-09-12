
import React from 'react';
import Icon from './Icon';

interface HeaderProps {
    onNewStory: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewStory }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-lg p-4 border-b border-slate-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <Icon name="sparkles" className="w-8 h-8 text-fuchsia-400 mr-3" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            Gemini Story Weaver
            </h1>
        </div>
        <button 
            onClick={onNewStory}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors duration-200 text-slate-300 hover:text-white"
            aria-label="Start new story"
        >
            <Icon name="refresh" className="w-5 h-5" />
            <span className="hidden sm:inline">New Story</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
