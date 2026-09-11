import sharp, { type OverlayOptions } from "sharp";
import { downloadSubmissionBuffer } from "@/lib/supabase/storage";

const TILE_SIZE = 320;
const CAPTION_HEIGHT = 60;
const GAP = 8;

interface CollageEntry {
  nickname: string;
  score: number;
  submissionStoragePath: string | null;
}

interface CollageInput {
  promptText: string;
  entries: CollageEntry[];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Разбивает текст задания на строки примерно по ширине тайла — без библиотеки
// для измерения текста, просто по количеству символов.
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function promptTile(text: string, width: number, height: number) {
  const lines = wrapText(text, 16);
  const lineHeight = 30;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map((line, i) => `<tspan x="50%" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#6d3fd6"/>
      <text font-family="sans-serif" font-size="22" font-weight="bold" fill="white"
        text-anchor="middle" dominant-baseline="middle">${tspans}</text>
    </svg>`;
  return Buffer.from(svg);
}

function captionSvg(text: string, width: number, height: number) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#111827"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="22" fill="white"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>
    </svg>`;
  return Buffer.from(svg);
}

function placeholderTile(width: number, height: number, label: string) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151"/>
      <text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#9ca3af"
        text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
    </svg>`;
  return Buffer.from(svg);
}

async function toTile(buffer: Buffer | null, label: string): Promise<Buffer> {
  if (!buffer) {
    return sharp(placeholderTile(TILE_SIZE, TILE_SIZE, label)).png().toBuffer();
  }
  try {
    return await sharp(buffer)
      .resize(TILE_SIZE, TILE_SIZE, { fit: "cover" })
      .png()
      .toBuffer();
  } catch {
    return sharp(placeholderTile(TILE_SIZE, TILE_SIZE, label)).png().toBuffer();
  }
}

export async function generateCollage({ promptText, entries }: CollageInput): Promise<Buffer> {
  const taskTile = await sharp(promptTile(promptText, TILE_SIZE, TILE_SIZE)).png().toBuffer();

  const submissionTiles = await Promise.all(
    entries.map(async (entry) => {
      const buffer = entry.submissionStoragePath
        ? await downloadSubmissionBuffer(entry.submissionStoragePath)
        : null;
      return toTile(buffer, "Нет рисунка");
    }),
  );

  const tiles = [taskTile, ...submissionTiles];
  const labels = ["Задание", ...entries.map((e) => `${e.nickname} · ${e.score >= 0 ? "+" : ""}${e.score}`)];

  const columns = tiles.length;
  const width = columns * TILE_SIZE + (columns - 1) * GAP;
  const height = TILE_SIZE + CAPTION_HEIGHT;

  const composites: OverlayOptions[] = [];
  for (let i = 0; i < tiles.length; i++) {
    const left = i * (TILE_SIZE + GAP);
    composites.push({ input: tiles[i], left, top: 0 });
    composites.push({
      input: await sharp(captionSvg(labels[i], TILE_SIZE, CAPTION_HEIGHT)).png().toBuffer(),
      left,
      top: TILE_SIZE,
    });
  }

  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#111827",
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}
