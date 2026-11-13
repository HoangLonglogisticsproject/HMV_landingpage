// The language a buyer writes in, from the words of a message only: never from the IP address, the country or the
// destination. A message decides only on clear evidence, two or more common words of one language and more than of
// the other; a place, a number or a product name alone ("India", "Chennai", "Hanoi", "500 MT") decides nothing, and
// the desk keeps its language.

const WORDS = {
  en: new Set([
    'we', 'i', 'our', 'my', 'us', 'need', 'needs', 'looking', 'want', 'would', 'like', 'buy', 'buying', 'purchase',
    'import', 'supply', 'for', 'the', 'a', 'an', 'to', 'in', 'of', 'and', 'is', 'are', 'with', 'from', 'at', 'per',
    'about', 'please', 'deliver', 'delivered', 'delivery', 'plant', 'factory', 'company', 'hello', 'hi', 'can', 'you',
  ]),
  vi: new Set([
    'tôi', 'chúng', 'bên', 'mình', 'công', 'ty', 'cần', 'đang', 'tìm', 'muốn', 'mua', 'nhập', 'giao', 'về', 'đến',
    'hàng', 'cho', 'của', 'và', 'là', 'có', 'không', 'được', 'với', 'tại', 'nhà', 'máy', 'khoảng', 'mỗi', 'xin',
    'chào', 'anh', 'chị', 'em', 'giúp', 'ạ', 'nhé', 'bao', 'nhiêu',
  ]),
};

/** @returns {'en' | 'vi' | null} the language of `text`, or null when its words are not clear evidence of one */
export function detectLanguage(text) {
  const words = String(text ?? '').normalize('NFC').toLowerCase().split(/[^\p{L}]+/u);
  const count = lang => words.filter(w => WORDS[lang].has(w)).length;
  const en = count('en');
  const vi = count('vi');
  if (vi >= 2 && vi > en) return 'vi';
  if (en >= 2 && en > vi) return 'en';
  return null;
}
