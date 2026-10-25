import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParsedDocument {
  title: string;
  content: string;
  wordCount: number;
  detectedFormat: 'text' | 'markdown' | 'word' | 'pdf';
}

/**
 * Extracts plain text from legacy binary .doc format as a fallback
 */
function extractTextFromBinaryDoc(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let text = '';
  // Try UTF-16LE scanner (typical in Word CFBF streams)
  let utf16Chars = '';
  for (let i = 0; i < bytes.length - 1; i += 2) {
    const charCode = bytes[i] | (bytes[i + 1] << 8);
    if ((charCode >= 32 && charCode <= 126) || charCode === 10 || charCode === 13) {
      utf16Chars += String.fromCharCode(charCode);
    } else if (charCode === 0 && utf16Chars.length > 30) {
      // Chunk break
      if (utf16Chars.trim().length > 20) {
        text += '\n' + utf16Chars.trim();
      }
      utf16Chars = '';
    }
  }

  if (text.trim().length > 100) {
    return text.trim();
  }

  // Fallback to ASCII scanner
  let asciiChars = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
      asciiChars += String.fromCharCode(b);
    } else {
      if (asciiChars.length > 25) {
        text += '\n' + asciiChars.trim();
      }
      asciiChars = '';
    }
  }

  return text.trim();
}

/**
 * Parses uploaded file (.txt, .md, .doc, .docx, .pdf) into structured manuscript text
 */
export async function parseDocumentFile(file: File): Promise<ParsedDocument> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim();

  let content = '';
  let detectedFormat: ParsedDocument['detectedFormat'] = 'text';

  if (extension === 'md' || extension === 'markdown') {
    detectedFormat = 'markdown';
    content = await file.text();
  } else if (extension === 'txt') {
    detectedFormat = 'text';
    content = await file.text();
  } else if (extension === 'docx' || extension === 'doc') {
    detectedFormat = 'word';
    const arrayBuffer = await file.arrayBuffer();

    try {
      // Mammoth processes modern .docx and xml-based documents
      const result = await mammoth.extractRawText({ arrayBuffer });
      content = result.value || '';
    } catch (docxErr) {
      console.warn('Mammoth docx parse failed, attempting binary doc fallback:', docxErr);
      content = extractTextFromBinaryDoc(arrayBuffer);
    }

    if (!content.trim() && extension === 'doc') {
      content = extractTextFromBinaryDoc(arrayBuffer);
    }
  } else if (extension === 'pdf') {
    detectedFormat = 'pdf';
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          pageTexts.push(pageText);
        }
      } catch (pageErr) {
        console.warn(`Could not read PDF page ${pageNum}:`, pageErr);
      }
    }

    content = pageTexts.join('\n\n');
  } else {
    // Default fallback to text
    content = await file.text();
  }

  // Normalize line endings and cleanup excess blank lines
  content = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  const words = (content.match(/\S+/g) || []).length;

  return {
    title: cleanTitle || 'Imported Manuscript',
    content,
    wordCount: words,
    detectedFormat,
  };
}
