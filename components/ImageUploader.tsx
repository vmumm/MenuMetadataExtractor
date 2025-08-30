import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 flex flex-col items-center justify-center">
      {imageUrl ? (
        <div className="w-full">
          <img 
            src={imageUrl} 
            alt="Menu item preview" 
            className="w-full h-auto max-h-80 object-contain rounded-lg"
          />
        </div>
      ) : (
        <div className="text-center text-gray-400">
          <CameraIcon className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2">Upload an image for best results.</p>
          <p className="text-xs mt-1">PNG, JPG, or WEBP supported.</p>
        </div>
      )}
      <button
        onClick={handleUploadClick}
        className="mt-6 w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        {imageUrl ? 'Change Image' : 'Select Image'}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
    </div>
  );
};
