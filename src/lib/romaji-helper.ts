/**
 * Bảng ánh xạ Kana (Hiragana & Katakana) sang Romaji thông dụng
 */
const KANA_TO_ROMAJI_MAP: Record<string, string> = {
  // Nguyên âm
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',

  // Hàng K
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',

  // Hàng S
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',

  // Hàng T
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',

  // Hàng N
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',

  // Hàng H
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',

  // Hàng M
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', '摸': 'mo', 'も': 'mo',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',

  // Hàng Y
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',

  // Hàng R
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',

  // Hàng W & N
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',

  // Âm ghép (Yōon)
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
};

/**
 * Tự động chuyển đổi chuỗi Kana sang Romaji
 */
export function kanaToRomaji(kana: string): string {
  if (!kana) return '';
  let result = '';
  let i = 0;
  const len = kana.length;

  while (i < len) {
    // Kiểm tra âm ngắt っ / ッ (sokuon)
    if (kana[i] === 'っ' || kana[i] === 'ッ') {
      if (i + 1 < len) {
        // Lấy chữ cái đầu tiên của âm tiếp theo
        const nextTwo = kana.slice(i + 1, i + 3);
        const nextOne = kana.slice(i + 1, i + 2);
        const nextRomaji = KANA_TO_ROMAJI_MAP[nextTwo] || KANA_TO_ROMAJI_MAP[nextOne] || '';
        if (nextRomaji) {
          result += nextRomaji[0];
          i++;
          continue;
        }
      }
    }

    // Kiểm tra âm đôi trước (2 ký tự, ví dụ: しゃ, きょ)
    if (i + 1 < len) {
      const twoChar = kana.slice(i, i + 2);
      if (KANA_TO_ROMAJI_MAP[twoChar]) {
        result += KANA_TO_ROMAJI_MAP[twoChar];
        i += 2;
        continue;
      }
    }

    // Kiểm tra âm đơn (1 ký tự)
    const oneChar = kana[i];
    if (KANA_TO_ROMAJI_MAP[oneChar]) {
      result += KANA_TO_ROMAJI_MAP[oneChar];
    } else {
      result += oneChar; // Giữ nguyên khoảng trắng, dấu hoặc ký tự la-tinh
    }
    i++;
  }

  return result.trim();
}
