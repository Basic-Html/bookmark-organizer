import { useState } from 'react';
import { Search, Plus, Grid3x3, List, Settings, Bookmark } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { Folder, Link, Theme, ViewMode } from '../types';

interface DashboardProps {
  folders: Folder[];
  links: Link[];
  onNavigateToFolder: (folderId: string) => void;
  onNavigateToAddLink: () => void;
  onNavigateToSearch: () => void;
  onNavigateToSettings: () => void;
  theme: Theme;
  onUpdateLink: (linkId: string, updates: Partial<Link>) => void;
}

export default function Dashboard({
  folders,
  links,
  onNavigateToFolder,
  onNavigateToAddLink,
  onNavigateToSearch,
  onNavigateToSettings,
  theme,
  onUpdateLink,
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const getLinkCountForFolder = (folderId: string) => {
    return links.filter(link => link.folderId === folderId).length;
  };

  const recentLinks = [...links]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Folder;
  };

  const togglePin = (linkId: string, currentPinned: boolean) => {
    onUpdateLink(linkId, { pinned: !currentPinned });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Bookmark Organizer</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {links.length} saved links
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToSettings}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onNavigateToAddLink}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div
            onClick={onNavigateToSearch}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                : 'bg-white hover:shadow-md border border-gray-200'
            }`}
          >
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Search bookmarks, tags, or folders...
            </span>
          </div>
        </div>

        {/* Folders Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Folders</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
            {folders.map((folder, index) => {
              const IconComponent = getIconComponent(folder.icon);
              const linkCount = getLinkCountForFolder(folder.id);

              return (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onNavigateToFolder(folder.id)}
                  className={`cursor-pointer rounded-xl p-5 transition-all ${
                    viewMode === 'grid'
                      ? 'hover:scale-105'
                      : 'flex items-center gap-4'
                  } ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                      : 'bg-white hover:shadow-lg border border-gray-200'
                  }`}
                  style={{
                    background: viewMode === 'grid'
                      ? theme === 'dark'
                        ? `linear-gradient(135deg, ${folder.color}20 0%, ${folder.color}10 100%)`
                        : `linear-gradient(135deg, ${folder.color}15 0%, ${folder.color}05 100%)`
                      : undefined,
                  }}
                >
                  <div
                    className={`${viewMode === 'grid' ? 'mb-4' : ''} w-12 h-12 rounded-xl flex items-center justify-center`}
                    style={{ backgroundColor: folder.color }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${viewMode === 'list' ? 'text-lg' : ''}`}>
                        {folder.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: folder.color }}
                      >
                        {linkCount}
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {linkCount} {linkCount === 1 ? 'link' : 'links'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Links Section */}
        {recentLinks.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Recent Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentLinks.map((link, index) => {
                const folder = folders.find(f => f.id === link.folderId);
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-xl p-4 transition-all hover:scale-105 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                        : 'bg-white hover:shadow-lg border border-gray-200'
                    }`}
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {link.favicon ? (
                        <img src={link.favicon} alt="" className="w-8 h-8 rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded flex items-center justify-center">
                          <Bookmark className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{link.title}</h3>
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {link.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(link.id, link.pinned);
                        }}
                        className={`transition-colors ${
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
                    {folder && (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {folder.name}
                        </span>
                      </div>
                    )}
                    {link.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {link.tags.slice(0, 3).map(tag => (
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
