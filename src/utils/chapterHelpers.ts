import { Story, BookChapter, BookPage } from '../types';

/**
 * Ensures a Story object has a valid, non-empty chapters array.
 * Converts single-body manuscripts automatically to Chapter 1, Page 1.
 */
export function ensureStoryChapters(story: Story): BookChapter[] {
  if (story.chapters && story.chapters.length > 0) {
    return story.chapters.map((chap, chapIdx) => ({
      ...chap,
      order: chap.order ?? chapIdx + 1,
      notes: chap.notes || '',
      pages:
        chap.pages && chap.pages.length > 0
          ? chap.pages.map((p, pIdx) => ({
              ...p,
              order: p.order ?? pIdx + 1,
              notes: p.notes || '',
              words: countWords(p.body || ''),
            }))
          : [
              {
                id: `page-${chap.id}-1`,
                title: 'Page 1',
                order: 1,
                body: '',
                notes: '',
                words: 0,
              },
            ],
    }));
  }

  // Fallback for existing legacy single-body stories
  const bodyText = story.body || '';
  return [
    {
      id: `chap-${story.id}-1`,
      title: 'Chapter 1',
      order: 1,
      summary: story.summary || '',
      notes: '',
      pages: [
        {
          id: `page-${story.id}-1-1`,
          title: 'Page 1',
          order: 1,
          body: bodyText,
          notes: '',
          words: countWords(bodyText),
        },
      ],
    },
  ];
}

export function countWords(text: string): number {
  if (!text) return 0;
  return (text.match(/\S+/g) || []).length;
}

export function calculateChapterWords(chapter: BookChapter): number {
  return (chapter.pages || []).reduce((acc, p) => acc + countWords(p.body || ''), 0);
}

export function calculateBookWords(chapters: BookChapter[]): number {
  return chapters.reduce((acc, chap) => acc + calculateChapterWords(chap), 0);
}

/**
 * Compiles an entire book into a single formatted Markdown manuscript
 */
export function compileBookManuscript(bookTitle: string, chapters: BookChapter[], includeNotes = false): string {
  let md = `# ${bookTitle || 'Untitled Book'}\n\n`;

  for (let i = 0; i < chapters.length; i++) {
    const chap = chapters[i];
    md += `## ${chap.title || `Chapter ${i + 1}`}\n\n`;

    if (includeNotes && chap.notes) {
      md += `> **Chapter Outline & Notes:**\n> ${chap.notes.replace(/\n/g, '\n> ')}\n\n`;
    }

    for (let j = 0; j < chap.pages.length; j++) {
      const page = chap.pages[j];
      if (chap.pages.length > 1) {
        md += `### ${page.title || `Page ${j + 1}`}\n\n`;
      }
      md += `${page.body || ''}\n\n`;

      if (includeNotes && page.notes) {
        md += `> *Page Notes:*\n> ${page.notes.replace(/\n/g, '\n> ')}\n\n`;
      }

      if (j < chap.pages.length - 1) {
        md += `---\n\n`;
      }
    }

    if (i < chapters.length - 1) {
      md += `\n***\n\n`;
    }
  }

  return md.trim();
}

/**
 * Compiles a single chapter into a formatted Markdown document
 */
export function compileChapterText(chapter: BookChapter, includeNotes = false): string {
  let md = `# ${chapter.title || 'Chapter'}\n\n`;

  if (includeNotes && chapter.notes) {
    md += `> **Chapter Outline & Notes:**\n> ${chapter.notes.replace(/\n/g, '\n> ')}\n\n`;
  }

  for (let j = 0; j < chapter.pages.length; j++) {
    const page = chapter.pages[j];
    if (chapter.pages.length > 1) {
      md += `## ${page.title || `Page ${j + 1}`}\n\n`;
    }
    md += `${page.body || ''}\n\n`;

    if (includeNotes && page.notes) {
      md += `> *Page Notes:*\n> ${page.notes.replace(/\n/g, '\n> ')}\n\n`;
    }

    if (j < chapter.pages.length - 1) {
      md += `---\n\n`;
    }
  }

  return md.trim();
}

/**
 * Compiles a single page into a formatted document
 */
export function compilePageText(page: BookPage, chapterTitle?: string, includeNotes = false): string {
  let md = `# ${page.title || 'Page'}${chapterTitle ? ` — ${chapterTitle}` : ''}\n\n`;

  md += `${page.body || ''}\n\n`;

  if (includeNotes && page.notes) {
    md += `\n---\n\n### Page Notes\n${page.notes}\n`;
  }

  return md.trim();
}
