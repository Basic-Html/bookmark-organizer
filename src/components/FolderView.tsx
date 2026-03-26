import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, ExternalLink, Bookmark } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { useDrag, useDrop } from 'react-dnd';
import { Folder, Link, Theme } from '../types';

interface FolderViewProps {
  folder: Folder;
  links: Link[];
  onBack: () => void;
  onNavigateToAddLink: (link?: Link) => void;
  onDeleteLink: (linkId: string) => void;
  onUpdateLink: (linkId: string, updates: Partial<Link>) => void;
  onReorderLinks: (reorderedLinks: Link[]) => void;
  theme: Theme;
  allLinks: Link[];
}

interface DraggableLinkCardProps {
  // React automatically injects `key` for elements in a list; we include
  // it here so TypeScript doesn't complain when using this component in a map.
  key?: React.Key;
  link: Link;
  index: number;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  theme: Theme;
}

const DraggableLinkCard = ({
  link,
  index,
  onMove,
  onEdit,
  onDelete,
  onTogglePin,
  theme,
}: DraggableLinkCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'LINK',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'LINK',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 0.95 : 1 }}
      className={`rounded-xl p-5 transition-all cursor-move group ${
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
              onClick={onTogglePin}
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
          onClick={onEdit}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
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
};

export default function FolderView({
  folder,
  links,
  onBack,
  onNavigateToAddLink,
  onDeleteLink,
  onUpdateLink,
  onReorderLinks,
  theme,
  allLinks,
}: FolderViewProps) {
  const [localLinks, setLocalLinks] = useState(links);

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Folder;
  };

  const IconComponent = getIconComponent(folder.icon);

  const moveLink = (dragIndex: number, hoverIndex: number) => {
    const draggedLink = localLinks[dragIndex];
    const newLinks = [...localLinks];
    newLinks.splice(dragIndex, 1);
    newLinks.splice(hoverIndex, 0, draggedLink);
    setLocalLinks(newLinks);
    
    // Update the global links array
    const otherLinks = allLinks.filter(l => l.folderId !== folder.id);
    onReorderLinks([...otherLinks, ...newLinks]);
  };

  const togglePin = (linkId: string, currentPinned: boolean) => {
    onUpdateLink(linkId, { pinned: !currentPinned });
    setLocalLinks(localLinks.map(l => 
      l.id === linkId ? { ...l, pinned: !currentPinned } : l
    ));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: folder.color }}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{folder.name}</h1>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {localLinks.length} {localLinks.length === 1 ? 'link' : 'links'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateToAddLink()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {localLinks.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Bookmark className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              No links yet
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-6`}>
              Start adding links to this folder
            </p>
            <button
              onClick={() => onNavigateToAddLink()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Link
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localLinks.map((link, index) => (
              <DraggableLinkCard
                key={link.id}
                link={link}
                index={index}
                onMove={moveLink}
                onEdit={() => onNavigateToAddLink(link)}
                onDelete={() => {
                  onDeleteLink(link.id);
                  setLocalLinks(localLinks.filter(l => l.id !== link.id));
                }}
                onTogglePin={() => togglePin(link.id, link.pinned)}
                theme={theme}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
