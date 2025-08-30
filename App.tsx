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
  const [manualItemName, setManualItemName] = useState<string>('');
  const [manualDescription, setManualDescription] = useState<string>('');
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

  const handleImageUpload = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        return;
    }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setMetadata(null);
    setError(null);
    setIsCopied(false);
  }, []);

  const handleGenerateMetadata = useCallback(async () => {
    if (!imageFile && !manualItemName.trim() && !manualDescription.trim()) return;

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const base64Image = imageFile ? await fileToBase64(imageFile) : null;
      const mimeType = imageFile ? imageFile.type : null;
      
      const result = await extractMenuMetadata(
        base64Image,
        mimeType,
        manualItemName,
        manualDescription
      );
      setMetadata(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(err);
      setError(`Failed to extract metadata: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, manualItemName, manualDescription]);

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setManualItemName('');
    setManualDescription('');
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

  const canGenerate = (imageFile || manualItemName.trim() || manualDescription.trim()) && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <Header onReset={resetState}/>
        <main className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-6">
              <h2 className="text-2xl font-bold text-gray-300">1. Provide Item Details (Image and/or Text)</h2>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                imageUrl={imageUrl}
              />

              <div className="space-y-4 animate-fade-in">
                <div>
                  <label htmlFor="itemName" className="block text-sm font-medium text-gray-400 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={manualItemName}
                    onChange={(e) => setManualItemName(e.target.value)}
                    placeholder="e.g., Spicy Chicken Sandwich"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="e.g., A crispy fried chicken breast with spicy mayo, pickles, and a toasted brioche bun."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                  <button
                  onClick={handleGenerateMetadata}
                  disabled={!canGenerate}
                  className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  {isLoading ? 'Generating...' : 'Generate Metadata'}
                </button>
              </div>
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
                    <p>Metadata will appear here once generated.</p>
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
