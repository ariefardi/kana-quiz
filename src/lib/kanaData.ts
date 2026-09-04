import kanaRawData from '../data/kana.json';
import { N5_KANJI_DATA } from './n5kanjidata';
import { N4_KANJI_DATA } from './n4kanjidata';
import { N3_KANJI_DATA } from './n3kanjidata';

export interface Kana {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana' | 'kanji';
}

export const HIRAGANA_DATA: Kana[] = kanaRawData.hiragana.map((item) => ({
  ...item,
  type: 'hiragana' as const,
}));

export const KATAKANA_DATA: Kana[] = kanaRawData.katakana.map((item) => ({
  ...item,
  type: 'katakana' as const,
}));

export type QuizMode =
  | 'hiragana'
  | 'katakana'
  | 'mixed'
  | 'hiragana-word'
  | 'katakana-word'
  | 'n5-kanji'
  | 'n4-kanji'
  | 'n3-kanji';

// Ambil satu bacaan utama dari field onyomi/kunyomi (bisa berisi beberapa
// bacaan dipisah koma, plus tanda kurung/strip buat okurigana, misal
// "atara-shii, ara-ta, nii" atau "i(kiru), u(mu)"). Kita ambil bacaan
// pertama lalu bersihkan tanda okurigana-nya jadi romaji polos.
function cleanReading(rawReading: string): string {
  const firstReading = rawReading.split(',')[0].trim();
  return firstReading.replace(/[()-]/g, '');
}

// Soal kanji: kana = karakter kanji, romaji = bacaan kanjinya.
// Prioritas kunyomi (cara baca kanji ini kalau BERDIRI SENDIRI, sesuai
// format kuis kita yang nampilin 1 karakter) — jatuh ke onyomi kalau
// kanjinya nggak punya kunyomi sama sekali (banyak kejadian di N3, kanji
// yang cuma dipakai dalam kata majemuk).
function kanjiToKana(entries: Array<{ kanji: string; onyomi: string; kunyomi: string }>): Kana[] {
  return entries.map((entry) => ({
    kana: entry.kanji,
    romaji: cleanReading(entry.kunyomi !== '—' ? entry.kunyomi : entry.onyomi),
    type: 'kanji' as const
  }));
}

const N5_KANJI_AS_KANA: Kana[] = kanjiToKana(N5_KANJI_DATA);
const N4_KANJI_AS_KANA: Kana[] = kanjiToKana(N4_KANJI_DATA);
const N3_KANJI_AS_KANA: Kana[] = kanjiToKana(N3_KANJI_DATA);

// Jumlah soal yang di-generate untuk mode word (kana tunggal pakai seluruh pool sebagai soal).
const WORD_QUIZ_LENGTH = 15;
const WORD_MIN_LENGTH = 2;
const WORD_MAX_LENGTH = 5;

// Gabungkan beberapa karakter kana acak jadi satu "kata" biar nggak cuma tebak 1 karakter.
function generateWordQuestions(
  pool: Kana[],
  count: number,
  minLength = WORD_MIN_LENGTH,
  maxLength = WORD_MAX_LENGTH
): Kana[] {
  const type = pool[0].type;

  return Array.from({ length: count }, () => {
    const wordLength = minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
    const characters = Array.from(
      { length: wordLength },
      () => pool[Math.floor(Math.random() * pool.length)]
    );

    return {
      kana: characters.map((c) => c.kana).join(''),
      romaji: characters.map((c) => c.romaji).join(''),
      type
    };
  });
}

export function getKanaDataByMode(mode: QuizMode): Kana[] {
  switch (mode) {
    case 'hiragana':
      return HIRAGANA_DATA;
    case 'katakana':
      return KATAKANA_DATA;
    case 'mixed':
      return [...HIRAGANA_DATA, ...KATAKANA_DATA];
    case 'hiragana-word':
      return generateWordQuestions(HIRAGANA_DATA, WORD_QUIZ_LENGTH);
    case 'katakana-word':
      return generateWordQuestions(KATAKANA_DATA, WORD_QUIZ_LENGTH);
    case 'n5-kanji':
      return N5_KANJI_AS_KANA;
    case 'n4-kanji':
      return N4_KANJI_AS_KANA;
    case 'n3-kanji':
      return N3_KANJI_AS_KANA;
  }
}

export function getRandomOptions(correctKana: Kana, currentPool: Kana[], count = 4): string[] {
  const wrongOptions = Array.from(new Set(
    currentPool
      .filter(item => item.romaji !== correctKana.romaji)
      .map(item => item.romaji)
  ));
  
  const shuffledWrong = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, count - 1);
  const options = [...shuffledWrong, correctKana.romaji];
  return options.sort(() => 0.5 - Math.random());
}