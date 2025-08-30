
import React from 'react';
import type { MenuItemMetadata } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface MetadataDisplayProps {
  metadata: MenuItemMetadata;
  onCopy: () => void;
  isCopied: boolean;
}

const MetadataSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-3">
    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    <div className="mt-2">{children}</div>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-gray-700 text-gray-200 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">
    {children}
  </span>
);

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ metadata, onCopy, isCopied }) => {
  return (
    <div className="w-full text-left space-y-4 animate-fade-in relative">
      <button
        onClick={onCopy}
        className="absolute top-0 right-0 flex items-center px-3 py-1.5 bg-gray-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled={isCopied}
        aria-label="Copy metadata as JSON"
      >
        <ClipboardIcon className="h-4 w-4 mr-2" />
        {isCopied ? 'Copied!' : 'Copy JSON'}
      </button>

      <div>
        <h2 className="text-2xl font-bold text-red-500">{metadata.itemName}</h2>
        <p className="text-lg text-gray-300 capitalize">{metadata.category}</p>
      </div>

      <p className="text-gray-300 italic">"{metadata.description}"</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 divide-y md:divide-y-0 md:divide-x-0 divide-gray-700">
        
        <div className="md:pr-3">
            <MetadataSection title="Dietary & Allergens">
                <div className="flex flex-wrap">
                    {metadata.dietaryTags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                    {metadata.allergenWarnings.map(tag => <Tag key={tag}>⚠️ {tag}</Tag>)}
                </div>
            </MetadataSection>

            <MetadataSection title="Suggested Pairings">
                <div className="flex flex-wrap">
                    {metadata.suggestedPairings.map(pairing => <Tag key={pairing}>+ {pairing}</Tag>)}
                </div>
            </MetadataSection>
        </div>
        
        <div className="md:pl-3">
            <MetadataSection title="SEO Keywords">
                <div className="flex flex-wrap">
                    {metadata.seoKeywords.map(keyword => <Tag key={keyword}>#{keyword}</Tag>)}
                </div>
            </MetadataSection>
        </div>
      </div>
    </div>
  );
};