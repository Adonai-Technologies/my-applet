import React from 'react';
import type { StoryPart } from '../types';

interface ImageGalleryProps {
  history: StoryPart[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ history }) => {
  const images = history.filter(part => part.imageUrl);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 p-3 border-t border-slate-700">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-semibold text-slate-400 mb-2 px-1">Image Gallery</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((part, index) => (
            <div key={index} className="flex-shrink-0">
              <img
                src={part.imageUrl}
                alt={`Story image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
