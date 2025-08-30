
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MetadataDisplay } from './components/MetadataDisplay';
import { Loader } from './components/Loader';
import { extractMenuMetadata } from './services/geminiService';
import type { MenuItemMetadata } from './types';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MenuItemMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:image/jpeg;base64, prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = useCallback(async (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setMetadata(null);
    setError(null);
    setIsLoading(true);
    setIsCopied(false);

    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      }

      const base64Image = await fileToBase64(file);
      const result = await extractMenuMetadata(base64Image, file.type);
      setMetadata(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(err);
      setError(`Failed to extract metadata: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setMetadata(null);
    setError(null);
    setIsLoading(false);
    setIsCopied(false);
  };

  const handleCopyJson = useCallback(() => {
    if (!metadata) return;

    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2))
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
      });
  }, [metadata]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <Header onReset={resetState}/>
        <main className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold text-gray-300">1. Upload Menu Item Photo</h2>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                imageUrl={imageUrl} 
                isLoading={isLoading} 
              />
            </div>

            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold text-gray-300">2. Extracted Metadata</h2>
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 min-h-[300px] flex items-center justify-center border border-gray-700">
                {isLoading && <Loader />}
                {error && <div className="text-center text-red-400">
                  <h3 className="text-lg font-semibold">Error</h3>
                  <p className="mt-2">{error}</p>
                </div>}
                {!isLoading && !error && metadata && (
                  <MetadataDisplay 
                    metadata={metadata}
                    onCopy={handleCopyJson}
                    isCopied={isCopied}
                  />
                )}
                {!isLoading && !error && !metadata && (
                  <div className="text-center text-gray-400">
                    <p>Metadata will appear here once an image is processed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;