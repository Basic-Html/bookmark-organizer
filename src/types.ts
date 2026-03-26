export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  parent: string | null;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string;
  tags: string[];
  folderId: string | null;
  favicon: string | null;
  thumbnail: string | null;
  pinned: boolean;
  createdAt: number;
}

export type Theme = 'light' | 'dark';

export type ViewMode = 'grid' | 'list';
