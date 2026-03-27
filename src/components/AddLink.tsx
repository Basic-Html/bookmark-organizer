import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Globe } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Favicon from './Favicon';
import { Folder, Link, Theme } from '../types';
import { extractDomain, getFaviconUrl } from '../utils/favicon';

interface AddLinkProps {
  folders: Folder[];
  onBack: () => void;
  onSave: (link: Link) => void;
  theme: Theme;
  editingLink: Link | null;
  currentFolderId: string | null;
}

export default function AddLink({ folders, onBack, onSave, theme, editingLink, currentFolderId }: AddLinkProps) {  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [favicon, setFavicon] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url || '');
      setTitle(editingLink.title || '');
      setDescription(editingLink.description || '');
      setTags(editingLink.tags?.join(', ') || '');
      setSelectedFolderId(editingLink.folderId || '');
      setFavicon(editingLink.favicon || null);
    } else {
      // Reset form when not editing
      setUrl('');
      setTitle('');
      setDescription('');
      setTags('');
      // Auto-select folder if coming from a folder view
      setSelectedFolderId(currentFolderId || '');
      setFavicon(null);
    }
  }, [editingLink, currentFolderId]);

  const fetchFavicon = (urlString: string) => {
    return getFaviconUrl(urlString);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    // Auto-fetch favicon when URL is valid
    if (newUrl && newUrl.startsWith('http')) {
      const newFavicon = fetchFavicon(newUrl);
      setFavicon(newFavicon);
      
      // Auto-fill title if empty
      if (!title) {
        const domain = extractDomain(newUrl);
        setTitle(domain || 'New Bookmark');
      }
    }
  };

  const handleSave = () => {
    if (!url || !title) return;

    const link: Link = {
      id: editingLink?.id || Date.now().toString(),
      url,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      folderId: selectedFolderId || null,
      favicon: favicon,
      thumbnail: null,
      pinned: editingLink?.pinned || false,
      createdAt: editingLink?.createdAt || Date.now(),
    };

    onSave(link);
    onBack();
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Folder;
  };

  const renderFolderOption = (folder: Folder, depth: number = 0) => {
    const IconComponent = getIconComponent(folder.icon);
    return (
      <option key={folder.id} value={folder.id}>
        {'  '.repeat(depth) + folder.name}
      </option>
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!url || !title}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Link
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Title Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this link a memorable title"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Description Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description (optional)"
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="design, inspiration, tutorial (comma-separated)"
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Folder Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Folder {currentFolderId && !editingLink && <span className="text-xs">(Auto-selected)</span>}
              </label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                disabled={currentFolderId !== null && !editingLink}
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  currentFolderId !== null && !editingLink ? 'opacity-60 cursor-not-allowed' : ''
                } ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="">Uncategorized</option>
                {folders.map(folder => renderFolderOption(folder))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className={`sticky top-8 rounded-xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}>
              <h3 className="text-sm font-medium mb-4">Preview</h3>
              <div className={`rounded-lg p-4 border ${
                theme === 'dark'
                  ? 'bg-gray-750 border-gray-600'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  {url ? (
                    <Favicon url={url} alt="" className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {title || 'Link Title'}
                    </h4>
                    <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {description || 'Link description will appear here'}
                    </p>
                  </div>
                </div>
                {tags && (
                  <div className="flex flex-wrap gap-1">
                    {tags.split(',').map((tag, i) => {
                      const trimmedTag = tag.trim();
                      if (!trimmedTag) return null;
                      return (
                        <span
                          key={i}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {trimmedTag}
                        </span>
                      );
                    })}
                  </div>
                )}
                {selectedFolderId && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    {(() => {
                      const folder = folders.find(f => f.id === selectedFolderId);
                      if (!folder) return null;
                      const IconComponent = getIconComponent(folder.icon);
                      return (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: folder.color }}
                          >
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm">{folder.name}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}