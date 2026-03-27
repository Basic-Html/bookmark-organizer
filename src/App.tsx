import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Dashboard from './components/Dashboard';
import FolderView from './components/FolderView';
import AddLink from './components/AddLink';
import SearchFilter from './components/SearchFilter';
import Settings from './components/Settings';
import { Folder, Link, Theme } from './types';

type Screen = 'dashboard' | 'folder' | 'add-link' | 'search' | 'settings';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('dashboard');
  const [theme, setTheme] = useState<Theme>('light');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedFolders = localStorage.getItem('bookmarkFolders');
    const savedLinks = localStorage.getItem('bookmarkLinks');
    const savedTheme = localStorage.getItem('bookmarkTheme') as Theme;

    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    } else {
      // Initialize with sample data
      const initialFolders: Folder[] = [
        { id: '1', name: 'Design Resources', color: '#8B5CF6', icon: 'Palette', parent: null },
        { id: '2', name: 'Development', color: '#3B82F6', icon: 'Code', parent: null },
        { id: '3', name: 'Reading List', color: '#EF4444', icon: 'BookOpen', parent: null },
        { id: '4', name: 'Inspiration', color: '#F59E0B', icon: 'Sparkles', parent: null },
      ];
      setFolders(initialFolders);
      localStorage.setItem('bookmarkFolders', JSON.stringify(initialFolders));
    }

    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    } else {
      // Initialize with sample data
      const initialLinks: Link[] = [
        {
          id: '1',
          url: 'https://dribbble.com',
          title: 'Dribbble - Discover the World\'s Top Designers',
          description: 'Explore the world\'s leading design portfolios',
          tags: ['design', 'inspiration'],
          folderId: '1',
          favicon: 'https://cdn.dribbble.com/assets/favicon-63b2904a073c89b52b19aa08cebc16a154bcf83fee8ecc6439968b1e6db569c7.ico',
          thumbnail: null,
          pinned: true,
          createdAt: Date.now() - 86400000,
        },
        {
          id: '2',
          url: 'https://github.com',
          title: 'GitHub: Where the world builds software',
          description: 'GitHub is where over 100 million developers shape the future of software',
          tags: ['development', 'code'],
          folderId: '2',
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          thumbnail: null,
          pinned: false,
          createdAt: Date.now() - 172800000,
        },
      ];
      setLinks(initialLinks);
      localStorage.setItem('bookmarkLinks', JSON.stringify(initialLinks));
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Save folders to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkFolders', JSON.stringify(folders));
  }, [folders]);

  // Save links to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkLinks', JSON.stringify(links));
  }, [links]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('bookmarkTheme', newTheme);
  };

  const navigateToFolder = (folderId: string) => {
    setPreviousScreen(currentScreen);
    setSelectedFolderId(folderId);
    setCurrentScreen('folder');
  };

  const navigateToAddLink = (linkToEdit?: Link) => {
    setPreviousScreen(currentScreen);
    if (linkToEdit) {
      setEditingLink(linkToEdit);
    } else {
      setEditingLink(null);
    }
    setCurrentScreen('add-link');
  };

  const addFolder = (folder: Folder) => {
    setFolders([...folders, folder]);
  };

  const updateFolder = (folderId: string, updates: Partial<Folder>) => {
    setFolders(folders.map(f => f.id === folderId ? { ...f, ...updates } : f));
  };

  const deleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId));
    // Move links from deleted folder to null (uncategorized)
    setLinks(links.map(l => l.folderId === folderId ? { ...l, folderId: null } : l));
  };

  const addLink = (link: Link) => {
    if (editingLink) {
      // Update existing link
      setLinks(links.map(l => l.id === editingLink.id ? link : l));
    } else {
      // Add new link
      setLinks([...links, link]);
    }
    
    // Clear editing state
    setEditingLink(null);
    
    // Navigate to the folder where link was saved, or back to where we came from
    if (link.folderId && previousScreen !== 'folder') {
      setSelectedFolderId(link.folderId);
      setCurrentScreen('folder');
    } else if (previousScreen === 'folder' && selectedFolderId) {
      setCurrentScreen('folder');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const updateLink = (linkId: string, updates: Partial<Link>) => {
    setLinks(links.map(l => l.id === linkId ? { ...l, ...updates } : l));
  };

  const deleteLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const reorderLinks = (reorderedLinks: Link[]) => {
    setLinks(reorderedLinks);
  };

  const importData = (data: { folders: Folder[], links: Link[] }) => {
    setFolders(data.folders);
    setLinks(data.links);
  };

  const exportData = () => {
    return { folders, links };
  };

  const handleBackFromAddLink = () => {
    setEditingLink(null);
    if (previousScreen === 'folder' && selectedFolderId) {
      setCurrentScreen('folder');
    } else {
      setSelectedFolderId(null);
      setCurrentScreen('dashboard');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {currentScreen === 'dashboard' && (
          <Dashboard
            folders={folders}
            links={links}
            onNavigateToFolder={navigateToFolder}
            onNavigateToAddLink={() => {
              setPreviousScreen('dashboard');
              setSelectedFolderId(null);
              navigateToAddLink();
            }}
            onNavigateToSearch={() => setCurrentScreen('search')}
            onNavigateToSettings={() => setCurrentScreen('settings')}
            theme={theme}
            onUpdateLink={updateLink}
            onDeleteLink={deleteLink}
          />
        )}
        {currentScreen === 'folder' && selectedFolderId && (
          <FolderView
            folder={folders.find(f => f.id === selectedFolderId)!}
            links={links.filter(l => l.folderId === selectedFolderId)}
            onBack={() => {
              setSelectedFolderId(null);
              setCurrentScreen('dashboard');
            }}
            onNavigateToAddLink={(linkToEdit) => {
              setPreviousScreen('folder');
              navigateToAddLink(linkToEdit);
            }}
            onDeleteLink={deleteLink}
            onUpdateLink={updateLink}
            onReorderLinks={reorderLinks}
            theme={theme}
            allLinks={links}
          />
        )}
        {currentScreen === 'add-link' && (
          <AddLink
            folders={folders}
            onBack={handleBackFromAddLink}
            onSave={addLink}
            theme={theme}
            editingLink={editingLink}
            currentFolderId={previousScreen === 'folder' ? selectedFolderId : null}
          />
        )}
        {currentScreen === 'search' && (
          <SearchFilter
            folders={folders}
            links={links}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigateToFolder={navigateToFolder}
            onNavigateToAddLink={navigateToAddLink}
            theme={theme}
            onUpdateLink={updateLink}
            onDeleteLink={deleteLink}
          />
        )}
        {currentScreen === 'settings' && (
          <Settings
            folders={folders}
            onBack={() => setCurrentScreen('dashboard')}
            onAddFolder={addFolder}
            onUpdateFolder={updateFolder}
            onDeleteFolder={deleteFolder}
            onToggleTheme={toggleTheme}
            theme={theme}
            onImport={importData}
            onExport={exportData}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;