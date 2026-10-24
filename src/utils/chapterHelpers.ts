import { Story, BookChapter, BookPage } from '../types';

export const STANDARD_LETTER_WORDS_PER_PAGE = 300;

export function countWords(text: string): number {
  if (!text) return 0;
  return (text.match(/\S+/g) || []).length;
}

/**
 * Automatically splits a long text into standard letter-sized pages (~280-320 words each),
 * breaking cleanly at paragraph or sentence boundaries like Microsoft Word.
 */
export function splitTextIntoLetterPages(
  text: string,
  targetWords = STANDARD_LETTER_WORDS_PER_PAGE
): string[] {
  if (!text || !text.trim()) return [''];

  const paragraphs = text.split(/\n+/);
  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;
    const paraWords = countWords(trimmedPara);

    // If a single paragraph is long, break it by sentences
    if (paraWords > targetWords * 1.2) {
      const sentences = trimmedPara.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [trimmedPara];
      for (const sent of sentences) {
        const trimmedSent = sent.trim();
        if (!trimmedSent) continue;
        const sentWords = countWords(trimmedSent);
        if (currentWordCount + sentWords > targetWords && currentWordCount > 120) {
          pages.push(currentPageParagraphs.join('\n\n').trim());
          currentPageParagraphs = [trimmedSent];
          currentWordCount = sentWords;
        } else {
          currentPageParagraphs.push(trimmedSent);
          currentWordCount += sentWords;
        }
      }
      continue;
    }

    if (currentWordCount + paraWords > targetWords && currentWordCount >= 180) {
      pages.push(currentPageParagraphs.join('\n\n').trim());
      currentPageParagraphs = [trimmedPara];
      currentWordCount = paraWords;
    } else {
      currentPageParagraphs.push(trimmedPara);
      currentWordCount += paraWords;
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n\n').trim());
  }

  return pages.length > 0 ? pages : [''];
}

/**
 * Ensures a Story object has a valid, non-empty chapters array.
 * Converts single-body manuscripts automatically to Chapter 1 with standard Letter-sized pages.
 */
export function ensureStoryChapters(story: Story): BookChapter[] {
  if (story.chapters && story.chapters.length > 0) {
    return story.chapters.map((chap, chapIdx) => {
      let pages = chap.pages || [];
      // If a chapter only has 1 page and that page has > 350 words, automatically divide into letter pages
      if (pages.length === 1 && countWords(pages[0].body || '') > 350) {
        const slices = splitTextIntoLetterPages(pages[0].body || '');
        pages = slices.map((slice, sIdx) => ({
          id: sIdx === 0 ? pages[0].id : `page-${chap.id}-${sIdx + 1}`,
          title: `Page ${sIdx + 1}`,
          order: sIdx + 1,
          body: slice,
          notes: sIdx === 0 ? pages[0].notes || '' : '',
          words: countWords(slice),
        }));
      }

      return {
        ...chap,
        order: chap.order ?? chapIdx + 1,
        notes: chap.notes || '',
        pages:
          pages.length > 0
            ? pages.map((p, pIdx) => ({
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
      };
    });
  }

  // Fallback for existing legacy single-body stories: split into real letter-sized pages
  const bodyText = story.body || '';
  const textSlices = splitTextIntoLetterPages(bodyText);
  return [
    {
      id: `chap-${story.id}-1`,
      title: 'Chapter 1',
      order: 1,
      summary: story.summary || '',
      notes: '',
      pages: textSlices.map((slice, sIdx) => ({
        id: `page-${story.id}-1-${sIdx + 1}`,
        title: `Page ${sIdx + 1}`,
        order: sIdx + 1,
        body: slice,
        notes: '',
        words: countWords(slice),
      })),
    },
  ];
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
