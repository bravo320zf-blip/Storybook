import { Story, StoryboardData, Character, WorldMap } from '../types';

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
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await fetch(`${DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id, name)`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to query Google Drive: ${res.statusText} - ${errText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
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
      description: 'Inkling Writing Desk projects, manuscripts, and world notes',
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Failed to create Google Drive folder: ${createRes.statusText}`);
  }

  const newFolder = await createRes.json();
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
  const fileContent = `---
title: "${story.title.replace(/"/g, '\\"')}"
id: "${story.id}"
status: "${story.status}"
words: ${story.words}
edited: ${new Date(story.edited).toISOString()}
summary: "${(story.summary || '').replace(/"/g, '\\"')}"
---

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
      description: `Inkling manuscript: ${story.title}`,
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
  let markdown = `# ${title} — Storyboard Outline\n\nGenerated from Inkling Writing Studio\n\n`;

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
    storyboards: Record<string, StoryboardData>;
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
