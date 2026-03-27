import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, FolderPlus, Download, Upload, Sun, Moon, Save, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';
import { Folder, Theme } from '../types';
import { exportToBookmarksHtml, importFromBookmarksHtml } from '../utils/bookmarkHtml';

interface SettingsProps {
  folders: Folder[];
  onBack: () => void;
  onAddFolder: (folder: Folder) => void;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleTheme: () => void;
  theme: Theme;
  onImport: (data: any) => void;
  onExport: () => any;
}

const AVAILABLE_ICONS = [
  'Folder', 'Palette', 'Code', 'BookOpen', 'Sparkles', 'Heart', 'Star', 
  'Zap', 'Coffee', 'Music', 'Camera', 'ShoppingBag', 'Briefcase', 'Gamepad2',
  'Dumbbell', 'Plane', 'Home', 'Library', 'Rocket', 'Award'
];

const COLORS = [
  '#8B5CF6', '#3B82F6', '#EF4444', '#F59E0B', '#10B981', 
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
];

export default function Settings({
  folders,
  onBack,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  onToggleTheme,
  theme,
  onImport,
  onExport,
}: SettingsProps) {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(COLORS[0]);
  const [newFolderIcon, setNewFolderIcon] = useState(AVAILABLE_ICONS[0]);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      color: newFolderColor,
      icon: newFolderIcon,
      parent: null,
    };

    onAddFolder(newFolder);
    setNewFolderName('');
    setNewFolderColor(COLORS[0]);
    setNewFolderIcon(AVAILABLE_ICONS[0]);
    setIsAddingFolder(false);
  };

  const handleEditFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setEditingFolderId(folderId);
      setNewFolderName(folder.name);
      setNewFolderColor(folder.color);
      setNewFolderIcon(folder.icon);
    }
  };

  const handleUpdateFolder = () => {
    if (!editingFolderId || !newFolderName.trim()) return;

    onUpdateFolder(editingFolderId, {
      name: newFolderName,
      color: newFolderColor,
      icon: newFolderIcon,
    });

    setEditingFolderId(null);
    setNewFolderName('');
    setNewFolderColor(COLORS[0]);
    setNewFolderIcon(AVAILABLE_ICONS[0]);
  };

  const handleCancelEdit = () => {
    setIsAddingFolder(false);
    setEditingFolderId(null);
    setNewFolderName('');
    setNewFolderColor(COLORS[0]);
    setNewFolderIcon(AVAILABLE_ICONS[0]);
  };

  const handleExport = () => {
    const data = onExport();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const data = onExport();
    const html = exportToBookmarksHtml(data, 'Bookmark Organizer');
    const dataBlob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bookmarks-export-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) ?? '';
        const name = (file.name || '').toLowerCase();

        const isJson = name.endsWith('.json') || file.type === 'application/json';
        const isHtml = name.endsWith('.html') || name.endsWith('.htm') || file.type === 'text/html';

        if (!isJson && !isHtml) {
          alert('Unsupported file type. Please import a .json or .html bookmarks file.');
          return;
        }

        const data = isHtml ? importFromBookmarksHtml(text) : JSON.parse(text);
        onImport(data);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Folder;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
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
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Appearance */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className={`rounded-xl p-6 ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Theme</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Switch between light and dark mode
                </p>
              </div>
              <button
                onClick={onToggleTheme}
                className={`p-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </section>

        {/* Folder Management */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Folder Management</h2>
            {!isAddingFolder && !editingFolderId && (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Add/Edit Folder Form */}
            {(isAddingFolder || editingFolderId) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <h3 className="font-medium mb-4">
                  {isAddingFolder ? 'Create New Folder' : 'Edit Folder'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                      className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        theme === 'dark'
                          ? 'bg-gray-750 border-gray-600 text-white'
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Icon
                    </label>
                    <div className="grid grid-cols-10 gap-2">
                      {AVAILABLE_ICONS.map(iconName => {
                        const IconComponent = getIconComponent(iconName);
                        return (
                          <button
                            key={iconName}
                            onClick={() => setNewFolderIcon(iconName)}
                            className={`p-2 rounded-lg transition-colors ${
                              newFolderIcon === iconName
                                ? 'bg-purple-600 text-white'
                                : theme === 'dark'
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Color
                    </label>
                    <div className="flex gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewFolderColor(color)}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            newFolderColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={editingFolderId ? handleUpdateFolder : handleAddFolder}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {editingFolderId ? 'Update' : 'Create'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Existing Folders */}
            {folders.map((folder) => {
              const IconComponent = getIconComponent(folder.icon);
              return (
                <div
                  key={folder.id}
                  className={`rounded-xl p-4 flex items-center justify-between ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: folder.color }}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{folder.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFolder(folder.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${folder.name}"? Links will be moved to Uncategorized.`)) {
                          onDeleteFolder(folder.id);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-red-900 text-gray-400 hover:text-red-400'
                          : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Import/Export */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Data Management</h2>
          <div className={`rounded-xl p-6 space-y-4 ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          }`}>
            <div>
              <h3 className="font-medium mb-1">Export Data</h3>
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Download all your bookmarks and folders as JSON or HTML
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExport}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={handleExportHtml}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Export HTML
                </button>
              </div>
            </div>

            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className="font-medium mb-1">Import Data</h3>
              <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Import bookmarks from a JSON or HTML file
              </p>
              <label className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer inline-flex ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <Upload className="w-4 h-4" />
                Import Data
                <input
                  type="file"
                  accept=".json,.html"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
