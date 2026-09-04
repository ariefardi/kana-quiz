export interface KanaItem {
  kana: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
}

export interface UserScore {
  uid: string;
  name: string;
  score: number;
  createdAt: Date;
}