import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Bookmark, Tag, Clock, Pin, Edit, Trash2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Folder, Link, Theme } from '../types';

interface SearchFilterProps {
  folders: Folder[];
  links: Link[];
  onBack: () => void;
  onNavigateToFolder: (folderId: string) => void;
  onNavigateToAddLink: (link?: Link) => void;
  theme: Theme;
  onUpdateLink: (linkId: string, updates: Partial<Link>) => void;
  onDeleteLink: (linkId: string) => void;
}

type FilterType = 'all' | 'pinned' | 'recent';

export default function SearchFilter({
  folders,
  links,
  onBack,
  onNavigateToFolder,
  onNavigateToAddLink,
  theme,
  onUpdateLink,
  onDeleteLink,
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach(link => {
      link.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [links]);

  // Filter and search links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(link =>
        link.title.toLowerCase().includes(query) ||
        link.description.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filter type
    if (selectedFilter === 'pinned') {
      result = result.filter(link => link.pinned);
    } else if (selectedFilter === 'recent') {
      result = result.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
    }

    // Apply folder filter
    if (selectedFolderFilter !== 'all') {
      result = result.filter(link => link.folderId === selectedFolderFilter);
    }

    // Apply tag filter
    if (selectedTagFilter !== 'all') {
      result = result.filter(link => link.tags.includes(selectedTagFilter));
    }

    return result;
  }, [links, searchQuery, selectedFilter, selectedFolderFilter, selectedTagFilter]);

  const togglePin = (linkId: string, currentPinned: boolean) => {
    onUpdateLink(linkId, { pinned: !currentPinned });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
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
            <h1 className="text-xl font-semibold">Search & Filter</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, URL, or tags..."
              className={`flex-1 bg-transparent outline-none ${
                theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              }`}
              autoFocus
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          {/* Quick Filters and Dropdowns in one row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Left side: All Links, Pinned, Recent */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                All Links
              </button>
              <button
                onClick={() => setSelectedFilter('pinned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedFilter === 'pinned'
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Pin className="w-4 h-4" />
                Pinned
              </button>
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedFilter === 'recent'
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
            </div>

            {/* Right side: Folder and Tag dropdowns */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedFolderFilter}
                onChange={(e) => setSelectedFolderFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <option value="all">All Folders</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>

              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredLinks.length} {filteredLinks.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              No results found
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link, index) => {
              const folder = folders.find(f => f.id === link.folderId);
              return (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`rounded-xl p-5 transition-all group ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                      : 'bg-white hover:shadow-xl border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    {link.favicon ? (
                      <img src={link.favicon} alt="" className="w-10 h-10 rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold line-clamp-2">{link.title}</h3>
                        <button
                          onClick={() => togglePin(link.id, link.pinned)}
                          className={`transition-colors flex-shrink-0 ${
                            link.pinned
                              ? 'text-yellow-500'
                              : theme === 'dark'
                              ? 'text-gray-600 hover:text-yellow-500'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Bookmark
                            className="w-4 h-4"
                            fill={link.pinned ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {link.description}
                      </p>
                    </div>
                  </div>

                  {link.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {link.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {folder && (
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {folder.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </a>
                    <button
                      onClick={() => onNavigateToAddLink(link)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLink(link.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-red-900 text-gray-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
