import { Story, StoryStatus, StoryboardData, Character, WorldMap, BookChapter } from '../types';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  description?: string;
}

/**
 * Searches for a folder by name in user's root Google Drive.
 * If not found, creates it and returns the folder ID.
 */
export async function getOrCreateFolder(accessToken: string, folderName: string = 'Inkling Stories'): Promise<string> {
  const cacheKey = `ink_drive_folder_id_${folderName}`;
  const cachedId = localStorage.getItem(cacheKey);

  // If we have a cached folder ID, verify it exists
  if (cachedId) {
    try {
      const checkRes = await fetch(`${DRIVE_API_URL}/files/${cachedId}?fields=id,name,trashed`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (checkRes.ok) {
        const item = await checkRes.json();
        if (!item.trashed) return cachedId;
      }
    } catch (e) {
      // Continue to search or create
    }
  }

  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 403 && errText.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
      throw new Error(
        'Google Drive permissions were not approved in the Google sign-in prompt. Please reconnect in Setup & Drive and ensure you check the box for Google Drive access.'
      );
    }
    // If querying failed for other reasons, try creating the folder directly
    console.warn(`Query failed (${res.status}), attempting direct folder creation...`);
  } else {
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      localStorage.setItem(cacheKey, data.files[0].id);
      return data.files[0].id;
    }
  }

  // Create the folder
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Storyboard Writing Desk projects, manuscripts, and world notes',
    }),
  });

  if (!createRes.ok) {
    const createErr = await createRes.text();
    if (createRes.status === 403 && createErr.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')) {
      throw new Error(
        'Google Drive permissions were not approved in the Google sign-in prompt. Please reconnect in Setup & Drive and ensure you check the box for Google Drive access.'
      );
    }
    throw new Error(`Failed to create Google Drive folder: ${createRes.statusText} - ${createErr}`);
  }

  const newFolder = await createRes.json();
  localStorage.setItem(cacheKey, newFolder.id);
  return newFolder.id;
}

/**
 * Uploads or updates a story file in Google Drive (.md format)
 */
export async function saveStoryToDrive(
  accessToken: string,
  folderId: string,
  story: Story
): Promise<string> {
  const fileName = `${story.title || 'Untitled Story'}.md`;
  const chaptersJson = story.chapters ? JSON.stringify(story.chapters) : '';
  const fileContent = `---
title: "${(story.title || '').replace(/"/g, '\\"')}"
id: "${story.id}"
status: "${story.status}"
words: ${story.words}
edited: ${new Date(story.edited).toISOString()}
summary: "${(story.summary || '').replace(/"/g, '\\"')}"
${story.notes ? `notes: "${story.notes.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n` : ''}${
  chaptersJson ? `chapters: ${JSON.stringify(chaptersJson)}\n` : ''
}---

# ${story.title}

${story.body || ''}
`;

  // Check if file already exists in folder (by story.gdriveFileId or by searching)
  let existingFileId = story.gdriveFileId;
  if (!existingFileId) {
    const q = `'${folderId}' in parents and name = '${fileName.replace(/'/g, "\\'")}' and trashed = false`;
    const checkRes = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.files && data.files.length > 0) {
        existingFileId = data.files[0].id;
      }
    }
  }

  if (existingFileId) {
    // Update content and metadata
    const updateRes = await fetch(`${UPLOAD_API_URL}/files/${existingFileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/markdown; charset=utf-8',
      },
      body: fileContent,
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update file in Google Drive: ${updateRes.statusText}`);
    }

    // Also update the filename in case the title changed
    await fetch(`${DRIVE_API_URL}/files/${existingFileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: fileName }),
    });

    return existingFileId;
  } else {
    // Multipart upload for new file with parent folder
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'text/markdown',
      description: `Storyboard manuscript: ${story.title}`,
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createRes = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to save file to Google Drive: ${createRes.statusText} - ${err}`);
    }

    const created = await createRes.json();
    return created.id;
  }
}

/**
 * Saves arbitrary JSON payload to Google Drive (e.g. storyboards, characters, maps)
 */
export async function saveJsonToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  dataObj: unknown
): Promise<string> {
  const content = JSON.stringify(dataObj, null, 2);

  // Check if exists
  const q = `'${folderId}' in parents and name = '${fileName}' and trashed = false`;
  const checkRes = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let fileId = '';
  if (checkRes.ok) {
    const list = await checkRes.json();
    if (list.files && list.files.length > 0) {
      fileId = list.files[0].id;
    }
  }

  if (fileId) {
    const updateRes = await fetch(`${UPLOAD_API_URL}/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: content,
    });
    if (!updateRes.ok) {
      throw new Error(`Failed to update ${fileName} in Drive`);
    }
    return fileId;
  } else {
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'application/json',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      content +
      closeDelimiter;

    const createRes = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!createRes.ok) {
      throw new Error(`Failed to upload ${fileName} to Drive`);
    }

    const created = await createRes.json();
    return created.id;
  }
}

/**
 * Exports Storyboard cards to a formatted Markdown/Document in Google Drive
 */
export async function exportStoryboardToDrive(
  accessToken: string,
  folderId: string,
  title: string,
  boardData: StoryboardData
): Promise<string> {
  const fileName = `${title} - Storyboard Outline.md`;
  let markdown = `# ${title} — Storyboard Outline\n\nGenerated from Storyboard Writing Studio\n\n`;

  const kinds = ['beat', 'character', 'place', 'idea', 'note'] as const;
  const kindNames: Record<string, string> = {
    beat: '🎬 Scenes & Beats',
    character: '👤 Characters',
    place: '🏰 Places & Settings',
    idea: '💡 Ideas & Hooks',
    note: '📝 Notes',
  };

  for (const kind of kinds) {
    const cards = boardData.cards.filter((c) => c.kind === kind);
    if (cards.length > 0) {
      markdown += `## ${kindNames[kind] || kind}\n\n`;
      for (const card of cards) {
        markdown += `### ${card.title || 'Untitled'}\n${card.body || ''}\n\n`;
      }
    }
  }

  if (boardData.links.length > 0) {
    markdown += `## 🔗 Connected Threads\n\n`;
    for (const link of boardData.links) {
      const fromCard = boardData.cards.find((c) => c.id === link.fromId);
      const toCard = boardData.cards.find((c) => c.id === link.toId);
      if (fromCard && toCard) {
        markdown += `- **${fromCard.title || 'Card'}** ➔ **${toCard.title || 'Card'}**${
          link.label ? ` (${link.label})` : ''
        }\n`;
      }
    }
  }

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'text/markdown',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/markdown; charset=UTF-8\r\n\r\n' +
    markdown +
    closeDelimiter;

  const res = await fetch(`${UPLOAD_API_URL}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error('Failed to export storyboard to Google Drive');
  }

  const created = await res.json();
  return created.id;
}

/**
 * Performs a complete sync of all stories, characters, storyboard, and maps to Google Drive.
 */
export async function syncAllToGoogleDrive(
  accessToken: string,
  folderName: string,
  data: {
    stories: Story[];
    characters: Character[];
    storyboards: Record<string, StoryboardData> | StoryboardData[];
    maps: WorldMap[];
  }
): Promise<{ folderId: string; syncedStories: number; syncedAt: number }> {
  const folderId = await getOrCreateFolder(accessToken, folderName);

  // Sync individual story manuscripts
  let syncedStories = 0;
  for (const story of data.stories) {
    try {
      const fileId = await saveStoryToDrive(accessToken, folderId, story);
      story.gdriveFileId = fileId;
      story.gdriveLastSynced = Date.now();
      syncedStories++;
    } catch (err) {
      console.error(`Failed to sync story "${story.title}":`, err);
    }
  }

  // Sync characters
  await saveJsonToDrive(accessToken, folderId, 'characters.json', data.characters);

  // Sync storyboards
  await saveJsonToDrive(accessToken, folderId, 'storyboards.json', data.storyboards);

  // Sync maps
  await saveJsonToDrive(accessToken, folderId, 'maps.json', data.maps);

  // Sync full backup JSON
  await saveJsonToDrive(accessToken, folderId, 'inkling_full_backup.json', {
    exportedAt: new Date().toISOString(),
    ...data,
  });

  return {
    folderId,
    syncedStories,
    syncedAt: Date.now(),
  };
}

/**
 * Deletes a file from Google Drive by file ID
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  try {
    const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 404;
  } catch (err) {
    console.error('Failed to delete Google Drive file:', err);
    return false;
  }
}

/**
 * Fetches content of a file from Google Drive.
 * Automatically handles Google Docs export as text/plain, or raw text/media for .md / .txt files.
 */
export async function fetchDriveFileContent(accessToken: string, fileId: string, mimeType: string): Promise<string> {
  let url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `${DRIVE_API_URL}/files/${fileId}/export?mimeType=text/plain`;
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    console.warn(`Failed to fetch Drive file content for ${fileId} (${res.status})`);
    return '';
  }
  return await res.text();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses markdown frontmatter or plain text / doc text into a structured Story object
 */
export function parseStoryFile(
  content: string,
  fileName: string
): {
  title: string;
  id?: string;
  status?: StoryStatus;
  summary?: string;
  notes?: string;
  chapters?: BookChapter[];
  body: string;
} {
  const cleanTitle = fileName.replace(/\.(md|txt|markdown|doc|docx)$/i, '').trim();

  if (content.startsWith('---')) {
    const endMatch = content.indexOf('---', 3);
    if (endMatch !== -1) {
      const frontmatter = content.slice(3, endMatch);
      let body = content.slice(endMatch + 3).trim();

      let title = cleanTitle;
      let id: string | undefined;
      let status: StoryStatus | undefined;
      let summary: string | undefined;
      let notes: string | undefined;
      let chapters: BookChapter[] | undefined;

      const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n\r]+)["']?/i);
      if (titleMatch) title = titleMatch[1].trim();

      const idMatch = frontmatter.match(/id:\s*["']?([^"'\n\r]+)["']?/i);
      if (idMatch) id = idMatch[1].trim();

      const statusMatch = frontmatter.match(/status:\s*["']?([^"'\n\r]+)["']?/i);
      if (
        statusMatch &&
        ['drafting', 'stuck', 'needs-ending', 'resting', 'finished'].includes(statusMatch[1].trim())
      ) {
        status = statusMatch[1].trim() as StoryStatus;
      }

      const summaryMatch = frontmatter.match(/summary:\s*["']?([^"'\n\r]+)["']?/i);
      if (summaryMatch) summary = summaryMatch[1].trim();

      const notesMatch = frontmatter.match(/notes:\s*["']?([^"'\r\n]+)["']?/i);
      if (notesMatch) {
        notes = notesMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }

      const chaptersMatch = frontmatter.match(/chapters:\s*("(\\"|[^"])*"|'(\\'|[^'])*')/i);
      if (chaptersMatch) {
        try {
          const raw = JSON.parse(chaptersMatch[1]);
          chapters = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch (e) {
          console.warn('Could not parse chapters frontmatter:', e);
        }
      }

      // If body starts with "# Title", strip redundant heading
      if (body.startsWith(`# ${title}`)) {
        body = body.replace(new RegExp(`^#\\s*${escapeRegExp(title)}\\s*\\r?\\n*`, 'i'), '').trim();
      }

      return { title: title || cleanTitle, id, status, summary, notes, chapters, body };
    }
  }

  // Not frontmatter - regular Google Doc or plain text file
  let body = content.trim();
  let title = cleanTitle;

  const h1Match = body.match(/^#\s+([^\n\r]+)\r?\n+/);
  if (h1Match) {
    if (!title || title.toLowerCase() === 'untitled' || title.toLowerCase() === 'untitled document') {
      title = h1Match[1].trim();
    }
    body = body.slice(h1Match[0].length).trim();
  }

  return {
    title: title || 'Untitled Story',
    status: 'drafting',
    body,
  };
}

/**
 * Bi-directional Intelligent Google Drive Sync:
 * 1. Checks Google Drive folder for any files created or modified directly on Drive.
 *    - If new Google Doc or markdown file on Drive: imports it as a new Story in the App!
 *    - If file on Drive was edited more recently than in App: updates the Story in the App!
 * 2. Checks local stories in the App:
 *    - If created or edited in App: uploads/updates in Google Drive!
 * 3. Checks characters, storyboards, and maps for changes and syncs them.
 */
export async function syncBiDirectionalWithGoogleDrive(
  accessToken: string,
  folderName: string,
  data: {
    stories: Story[];
    characters: Character[];
    storyboards: Record<string, StoryboardData> | StoryboardData[];
    maps: WorldMap[];
  },
  lastModifiedState: {
    charactersLastModified: number;
    charactersLastSynced: number;
    storyboardLastModified: number;
    storyboardLastSynced: number;
    mapsLastModified: number;
    mapsLastSynced: number;
  }
): Promise<{
  folderId: string;
  importedCount: number;
  updatedRemoteCount: number;
  updatedLocalCount: number;
  syncedStoriesCount: number;
  syncedCharacters: boolean;
  syncedStoryboard: boolean;
  syncedMaps: boolean;
  updatedStories: Story[];
  syncedAt: number;
}> {
  const folderId = await getOrCreateFolder(accessToken, folderName);

  // 1. Fetch remote files in the Google Drive folder
  const query = `'${folderId}' in parents and trashed = false`;
  const listRes = await fetch(
    `${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id, name, mimeType, modifiedTime, createdTime)&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  let remoteFiles: DriveFileItem[] = [];
  if (listRes.ok) {
    const listData = await listRes.json();
    remoteFiles = listData.files || [];
  }

  const SYSTEM_NAMES = new Set([
    'characters.json',
    'storyboards.json',
    'maps.json',
    'inkling_full_backup.json',
  ]);

  // Filter out system config and storyboard outline exports
  const candidateStoryFiles = remoteFiles.filter((f) => {
    if (SYSTEM_NAMES.has(f.name)) return false;
    if (f.name.endsWith(' - Storyboard Outline.md')) return false;
    if (f.mimeType === 'application/vnd.google-apps.folder') return false;
    return true;
  });

  const updatedStories: Story[] = [...data.stories];
  let importedCount = 0;
  let updatedRemoteCount = 0;
  let updatedLocalCount = 0;

  // Process remote files from Drive -> App
  for (const rFile of candidateStoryFiles) {
    const cleanRemoteTitle = rFile.name.replace(/\.(md|txt|markdown|doc|docx)$/i, '').trim();

    // Match by Google Drive File ID first, or by title
    let matchIdx = updatedStories.findIndex((s) => s.gdriveFileId === rFile.id);
    if (matchIdx === -1) {
      matchIdx = updatedStories.findIndex(
        (s) => s.title.trim().toLowerCase() === cleanRemoteTitle.toLowerCase()
      );
    }

    const remoteModified = rFile.modifiedTime ? new Date(rFile.modifiedTime).getTime() : 0;

    if (matchIdx !== -1) {
      // Story exists in both Drive and local app
      const localStory = updatedStories[matchIdx];
      // Jitter tolerance: 3 seconds
      if (remoteModified > (localStory.edited || 0) + 3000) {
        // REMOTE IS NEWER: fetch from Google Drive and update local story
        try {
          const content = await fetchDriveFileContent(accessToken, rFile.id, rFile.mimeType);
          const parsed = parseStoryFile(content, rFile.name);
          const updated: Story = {
            ...localStory,
            title: parsed.title || cleanRemoteTitle,
            body: parsed.body,
            words: (parsed.body.match(/\S+/g) || []).length,
            edited: remoteModified,
            gdriveFileId: rFile.id,
            gdriveLastSynced: remoteModified,
            ...(parsed.status ? { status: parsed.status } : {}),
            ...(parsed.summary ? { summary: parsed.summary } : {}),
            ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
            ...(parsed.chapters ? { chapters: parsed.chapters } : {}),
          };
          updatedStories[matchIdx] = updated;
          updatedLocalCount++;
        } catch (e) {
          console.error(`Error updating local story from Drive (${rFile.name}):`, e);
        }
      } else if ((localStory.edited || 0) > (localStory.gdriveLastSynced || 0)) {
        // LOCAL IS NEWER: upload local changes to Drive
        try {
          const fileId = await saveStoryToDrive(accessToken, folderId, localStory);
          updatedStories[matchIdx] = {
            ...localStory,
            gdriveFileId: fileId,
            gdriveLastSynced: Date.now(),
          };
          updatedRemoteCount++;
        } catch (e) {
          console.error(`Error updating remote story in Drive (${localStory.title}):`, e);
        }
      } else {
        // Make sure file ID is linked if missing
        if (!localStory.gdriveFileId) {
          updatedStories[matchIdx] = {
            ...localStory,
            gdriveFileId: rFile.id,
            gdriveLastSynced: remoteModified || Date.now(),
          };
        }
      }
    } else {
      // NEW FILE FOUND ON GOOGLE DRIVE! Import it as a new Story in Inkling
      try {
        const content = await fetchDriveFileContent(accessToken, rFile.id, rFile.mimeType);
        const parsed = parseStoryFile(content, rFile.name);
        const newStory: Story = {
          id: parsed.id || `story-gdrive-${rFile.id}`,
          title: parsed.title || cleanRemoteTitle || 'Untitled Story from Drive',
          status: parsed.status || 'drafting',
          words: (parsed.body.match(/\S+/g) || []).length,
          edited: remoteModified || Date.now(),
          body: parsed.body,
          summary:
            parsed.summary ||
            (parsed.body
              ? parsed.body.slice(0, 140).trim().replace(/\n/g, ' ') + '…'
              : 'Imported from Google Drive.'),
          notes: parsed.notes || '',
          chapters: parsed.chapters,
          gdriveFileId: rFile.id,
          gdriveLastSynced: remoteModified || Date.now(),
        };
        updatedStories.unshift(newStory);
        importedCount++;
      } catch (e) {
        console.error(`Error importing new file from Drive (${rFile.name}):`, e);
      }
    }
  }

  // Process local stories that haven't been synced to Drive yet -> Drive
  for (let i = 0; i < updatedStories.length; i++) {
    const s = updatedStories[i];
    const isDirty = (s.edited || 0) > (s.gdriveLastSynced || 0);
    const hasNoDriveId = !s.gdriveFileId;
    if (isDirty || hasNoDriveId) {
      try {
        const fileId = await saveStoryToDrive(accessToken, folderId, s);
        updatedStories[i] = {
          ...s,
          gdriveFileId: fileId,
          gdriveLastSynced: Date.now(),
        };
        updatedRemoteCount++;
      } catch (err) {
        console.error(`Failed to upload local story "${s.title}" to Drive:`, err);
      }
    }
  }

  // Check if characters were modified
  let syncedCharacters = false;
  if (lastModifiedState.charactersLastModified > lastModifiedState.charactersLastSynced) {
    try {
      await saveJsonToDrive(accessToken, folderId, 'characters.json', data.characters);
      syncedCharacters = true;
    } catch (e) {
      console.error('Bi-directional sync characters failed:', e);
    }
  }

  // Check if storyboard was modified
  let syncedStoryboard = false;
  if (lastModifiedState.storyboardLastModified > lastModifiedState.storyboardLastSynced) {
    try {
      await saveJsonToDrive(accessToken, folderId, 'storyboards.json', data.storyboards);
      syncedStoryboard = true;
    } catch (e) {
      console.error('Bi-directional sync storyboard failed:', e);
    }
  }

  // Check if maps were modified
  let syncedMaps = false;
  if (lastModifiedState.mapsLastModified > lastModifiedState.mapsLastSynced) {
    try {
      await saveJsonToDrive(accessToken, folderId, 'maps.json', data.maps);
      syncedMaps = true;
    } catch (e) {
      console.error('Bi-directional sync maps failed:', e);
    }
  }

  return {
    folderId,
    importedCount,
    updatedRemoteCount,
    updatedLocalCount,
    syncedStoriesCount: importedCount + updatedRemoteCount + updatedLocalCount,
    syncedCharacters,
    syncedStoryboard,
    syncedMaps,
    updatedStories,
    syncedAt: Date.now(),
  };
}

/**
 * Intelligent incremental sync: delegates to full bi-directional sync
 */
export async function syncIncrementalToGoogleDrive(
  accessToken: string,
  folderName: string,
  data: {
    stories: Story[];
    characters: Character[];
    storyboards: Record<string, StoryboardData> | StoryboardData[];
    maps: WorldMap[];
  },
  lastModifiedState: {
    charactersLastModified: number;
    charactersLastSynced: number;
    storyboardLastModified: number;
    storyboardLastSynced: number;
    mapsLastModified: number;
    mapsLastSynced: number;
  }
) {
  return await syncBiDirectionalWithGoogleDrive(accessToken, folderName, data, lastModifiedState);
}

/**
 * Completely removes the Inkling Stories folder and all files inside from user's Google Drive
 */
export async function deleteInklingDriveFolder(accessToken: string, folderName: string = 'Inkling Stories'): Promise<boolean> {
  const cacheKey = `ink_drive_folder_id_${folderName}`;
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  try {
    const res = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        for (const folder of data.files) {
          await fetch(`${DRIVE_API_URL}/files/${folder.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to delete Google Drive folder:', err);
  }
  localStorage.removeItem(cacheKey);
  return true;
}

