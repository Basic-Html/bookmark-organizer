import type { Folder, Link } from '../types';

const DEFAULT_FOLDER_COLOR = '#8B5CF6';
const DEFAULT_FOLDER_ICON = 'Folder';

const escapeHtml = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const parseAddDate = (value: string | null): number | null => {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  // Chrome exports seconds since epoch.
  if (n > 10_000_000_000) return n; // already ms
  return n * 1000;
};

export function exportToBookmarksHtml(data: { folders: Folder[]; links: Link[] }, title = 'Bookmarks'): string {
  const { folders, links } = data;

  const foldersByParent = new Map<string | null, Folder[]>();
  for (const f of folders) {
    const key = f.parent ?? null;
    const list = foldersByParent.get(key) ?? [];
    list.push(f);
    foldersByParent.set(key, list);
  }
  for (const [, list] of foldersByParent) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const linksByFolder = new Map<string | null, Link[]>();
  for (const l of links) {
    const key = l.folderId ?? null;
    const list = linksByFolder.get(key) ?? [];
    list.push(l);
    linksByFolder.set(key, list);
  }
  for (const [, list] of linksByFolder) {
    list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  const renderFolder = (folder: Folder, indent: string): string => {
    const childrenFolders = foldersByParent.get(folder.id) ?? [];
    const childrenLinks = linksByFolder.get(folder.id) ?? [];

    let out = '';
    out += `${indent}<DT><H3>${escapeHtml(folder.name)}</H3>\n`;
    out += `${indent}<DL><p>\n`;
    out += renderLevel(folder.id, indent + '  ');
    out += `${indent}</DL><p>\n`;
    return out;
  };

  const renderLinks = (folderId: string | null, indent: string): string => {
    const list = linksByFolder.get(folderId) ?? [];
    return list
      .map((l) => {
        const addDateSeconds = Math.floor((l.createdAt ?? Date.now()) / 1000);
        return `${indent}<DT><A HREF="${escapeHtml(l.url)}" ADD_DATE="${addDateSeconds}">${escapeHtml(l.title || l.url)}</A>\n`;
      })
      .join('');
  };

  const renderLevel = (parentId: string | null, indent: string): string => {
    const childFolders = foldersByParent.get(parentId) ?? [];
    let out = '';
    for (const f of childFolders) {
      out += renderFolder(f, indent);
    }
    out += renderLinks(parentId, indent);
    return out;
  };

  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    `<H1>${escapeHtml(title)}</H1>`,
    '<DL><p>',
    renderLevel(null, '  '),
    '</DL><p>',
    '',
  ].join('\n');
}

export function importFromBookmarksHtml(html: string): { folders: Folder[]; links: Link[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const folders: Folder[] = [];
  const links: Link[] = [];

  const makeFolder = (name: string, parent: string | null): Folder => ({
    id: crypto.randomUUID(),
    name: name || 'Untitled Folder',
    color: DEFAULT_FOLDER_COLOR,
    icon: DEFAULT_FOLDER_ICON,
    parent,
  });

  const makeLink = (a: HTMLAnchorElement, folderId: string | null): Link => ({
    id: crypto.randomUUID(),
    url: a.getAttribute('href') || '',
    title: (a.textContent || '').trim() || (a.getAttribute('href') || ''),
    description: '',
    tags: [],
    folderId,
    favicon: null,
    thumbnail: null,
    pinned: false,
    createdAt: parseAddDate(a.getAttribute('add_date')) ?? Date.now(),
  });

  const findRootDl = (): HTMLDListElement | null => {
    // Chrome exports a top-level <DL><p> block; this finds the first DL.
    return doc.querySelector('dl');
  };

  const traverseDl = (dl: Element, parentFolderId: string | null) => {
    const children = Array.from(dl.children);
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      if (el.tagName !== 'DT') continue;

      const h3 = el.querySelector('h3');
      const a = el.querySelector('a[href]') as HTMLAnchorElement | null;

      if (h3) {
        const folder = makeFolder((h3.textContent || '').trim(), parentFolderId);
        folders.push(folder);

        // Nested DL can be either inside DT or as a sibling right after DT.
        const nestedDl =
          el.querySelector('dl') ||
          (el.nextElementSibling && el.nextElementSibling.tagName === 'DL' ? el.nextElementSibling : null);
        if (nestedDl) {
          traverseDl(nestedDl, folder.id);
        }
        continue;
      }

      if (a) {
        const link = makeLink(a, parentFolderId);
        if (link.url) {
          links.push(link);
        }
      }
    }
  };

  const root = findRootDl();
  if (!root) {
    throw new Error('No <DL> root found in bookmarks HTML');
  }
  traverseDl(root, null);

  return { folders, links };
}

