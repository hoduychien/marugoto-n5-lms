export type KanaSystem = 'hiragana' | 'katakana';
export type KanaGroup = 'basic' | 'dakuon' | 'yoon';

export interface KanaItem {
  id: string;
  system: KanaSystem;
  group: KanaGroup;
  row: string; // Ví dụ: 'Hàng A (あ)', 'Hàng KA (か)'
  character: string;
  romaji: string;
  example_word: string;
  example_reading: string;
  example_vn: string;
}

type RawKanaTuple = [
  character: string,
  romaji: string,
  row: string,
  example_word: string,
  example_reading: string,
  example_vn: string,
];

// 46 chữ Hiragana cơ bản (Gojuon)
const HIRAGANA_BASIC_RAW: RawKanaTuple[] = [
  ['あ', 'a', 'Hàng A (あ行)', 'あさ', 'asa', 'Buổi sáng'],
  ['い', 'i', 'Hàng A (あ行)', 'いえ', 'ie', 'Ngôi nhà'],
  ['う', 'u', 'Hàng A (あ行)', 'うみ', 'umi', 'Biển'],
  ['え', 'e', 'Hàng A (あ行)', 'えき', 'eki', 'Nhà ga'],
  ['お', 'o', 'Hàng A (あ行)', 'おちゃ', 'ocha', 'Trà xanh'],

  ['か', 'ka', 'Hàng KA (か行)', 'かさ', 'kasa', 'Chiếc ô (dù)'],
  ['き', 'ki', 'Hàng KA (か行)', 'きっぷ', 'kippu', 'Vé tàu'],
  ['く', 'ku', 'Hàng KA (か行)', 'くつ', 'kutsu', 'Đôi giày'],
  ['け', 'ke', 'Hàng KA (か行)', 'けさ', 'kesa', 'Sáng nay'],
  ['こ', 'ko', 'Hàng KA (か行)', 'こども', 'kodomo', 'Trẻ em'],

  ['さ', 'sa', 'Hàng SA (さ行)', 'さかな', 'sakana', 'Con cá'],
  ['し', 'shi', 'Hàng SA (さ行)', 'しごと', 'shigoto', 'Công việc'],
  ['す', 'su', 'Hàng SA (さ行)', 'すし', 'sushi', 'Món Sushi'],
  ['せ', 'se', 'Hàng SA (さ行)', 'せんせい', 'sensee', 'Giáo viên'],
  ['そ', 'so', 'Hàng SA (さ行)', 'そら', 'sora', 'Bầu trời'],

  ['た', 'ta', 'Hàng TA (た行)', 'たべもの', 'tabemono', 'Đồ ăn'],
  ['ち', 'chi', 'Hàng TA (た行)', 'ちず', 'chizu', 'Bản đồ'],
  ['つ', 'tsu', 'Hàng TA (た行)', 'つくえ', 'tsukue', 'Cái bàn'],
  ['て', 'te', 'Hàng TA (た行)', 'てがみ', 'tegami', 'Bức thư'],
  ['と', 'to', 'Hàng TA (た行)', 'とけい', 'tokee', 'Đồng hồ'],

  ['な', 'na', 'Hàng NA (な行)', 'なつ', 'natsu', 'Mùa hè'],
  ['に', 'ni', 'Hàng NA (な行)', 'にほん', 'Nihon', 'Nhật Bản'],
  ['ぬ', 'nu', 'Hàng NA (な行)', 'いぬ', 'inu', 'Con chó'],
  ['ね', 'ne', 'Hàng NA (な行)', 'ねこ', 'neko', 'Con mèo'],
  ['の', 'no', 'Hàng NA (な行)', 'のみもの', 'nomimono', 'Đồ uống'],

  ['は', 'ha', 'Hàng HA (は行)', 'はな', 'hana', 'Bông hoa'],
  ['ひ', 'hi', 'Hàng HA (は行)', 'ひと', 'hito', 'Con người'],
  ['ふ', 'fu', 'Hàng HA (は行)', 'ふゆ', 'fuyu', 'Mùa đông'],
  ['へ', 'he', 'Hàng HA (は行)', 'へや', 'heya', 'Căn phòng'],
  ['ほ', 'ho', 'Hàng HA (は行)', 'ほん', 'hon', 'Quyển sách'],

  ['ま', 'ma', 'Hàng MA (ま行)', 'まち', 'machi', 'Thành phố / Thị trấn'],
  ['み', 'mi', 'Hàng MA (ま行)', 'みず', 'mizu', 'Nước'],
  ['む', 'mu', 'Hàng MA (ま行)', 'むし', 'mushi', 'Côn trùng'],
  ['め', 'me', 'Hàng MA (ま行)', 'めがね', 'megane', 'Mắt kính'],
  ['も', 'mo', 'Hàng MA (ま行)', 'もり', 'mori', 'Khu rừng'],

  ['や', 'ya', 'Hàng YA (や行)', 'やま', 'yama', 'Ngọn núi'],
  ['ゆ', 'yu', 'Hàng YA (や行)', 'ゆき', 'yuki', 'Tuyết'],
  ['よ', 'yo', 'Hàng YA (や行)', 'よる', 'yoru', 'Ban đêm'],

  ['ら', 'ra', 'Hàng RA (ら行)', 'らいねん', 'rainen', 'Năm sau'],
  ['り', 'ri', 'Hàng RA (ら行)', 'りんご', 'ringo', 'Quả táo'],
  ['る', 'ru', 'Hàng RA (ら行)', 'ひる', 'hiru', 'Buổi trưa'],
  ['れ', 're', 'Hàng RA (ら行)', 'れきし', 'rekishi', 'Lịch sử'],
  ['ろ', 'ro', 'Hàng RA (ら行)', 'ろく', 'roku', 'Số 6'],

  ['わ', 'wa', 'Hàng WA (わ行)', 'わたし', 'watashi', 'Tôi'],
  ['を', 'o (wo)', 'Hàng WA (わ行)', 'ほんを よむ', 'hon o yomu', 'Đọc sách (Trợ từ)'],
  ['ん', 'n', 'Phụ âm mũi N (ん)', 'かばん', 'kaban', 'Cặp sách / Túi xách'],
];

// 25 chữ Hiragana âm đục & bán đục (Dakuon & Handakuon)
const HIRAGANA_DAKUON_RAW: RawKanaTuple[] = [
  ['が', 'ga', 'Hàng GA (が行)', 'がっこう', 'gakkoo', 'Trường học'],
  ['ぎ', 'gi', 'Hàng GA (が行)', 'ぎんこう', 'ginkoo', 'Ngân hàng'],
  ['ぐ', 'gu', 'Hàng GA (が行)', 'かぐ', 'kagu', 'Đồ nội thất'],
  ['げ', 'ge', 'Hàng GA (が行)', 'げんき', 'genki', 'Khỏe mạnh'],
  ['ご', 'go', 'Hàng GA (が行)', 'ごはん', 'gohan', 'Cơm / Bữa ăn'],

  ['ざ', 'za', 'Hàng ZA (ざ行)', 'ざっし', 'zasshi', 'Tạp chí'],
  ['じ', 'ji', 'Hàng ZA (ざ行)', 'じしょ', 'jisho', 'Từ điển'],
  ['ず', 'zu', 'Hàng ZA (ざ行)', 'ちず', 'chizu', 'Bản đồ'],
  ['ぜ', 'ze', 'Hàng ZA (ざ行)', 'かぜ', 'kaze', 'Cơn gió / Cảm cúm'],
  ['ぞ', 'zo', 'Hàng ZA (ざ行)', 'かぞく', 'kazoku', 'Gia đình'],

  ['だ', 'da', 'Hàng DA (だ行)', 'だいがく', 'daigaku', 'Trường đại học'],
  ['ぢ', 'ji (di)', 'Hàng DA (だ行)', 'はなぢ', 'hanaji', 'Chảy máu cam'],
  ['づ', 'zu (du)', 'Hàng DA (だ行)', 'つづく', 'tsuzuku', 'Tiếp tục'],
  ['で', 'de', 'Hàng DA (だ行)', 'でんしゃ', 'densha', 'Tàu điện'],
  ['ど', 'do', 'Hàng DA (だ行)', 'どようび', 'doyoobi', 'Thứ Bảy'],

  ['ば', 'ba', 'Hàng BA (ば行)', 'ばんごはん', 'bangohan', 'Bữa tối'],
  ['び', 'bi', 'Hàng BA (ば行)', 'びょういん', 'byooin', 'Bệnh viện'],
  ['ぶ', 'bu', 'Hàng BA (ば行)', 'ぶたにく', 'butaniku', 'Thịt lợn'],
  ['べ', 'be', 'Hàng BA (ば行)', 'べんきょう', 'benkyoo', 'Học tập'],
  ['ぼ', 'bo', 'Hàng BA (ば行)', 'ぼうし', 'booshi', 'Cái mũ'],

  ['ぱ', 'pa', 'Hàng PA (ぱ行)', 'きっぷ', 'kippu', 'Vé tàu'],
  ['ぴ', 'pi', 'Hàng PA (ぱ行)', 'えんぴつ', 'enpitsu', 'Bút chì'],
  ['ぷ', 'pu', 'Hàng PA (ぱ行)', 'てんぷら', 'tenpura', 'Món Tempura'],
  ['ぺ', 'pe', 'Hàng PA (ぱ行)', 'ぺこぺこ', 'pekopeko', 'Đói bụng cồn cào'],
  ['ぽ', 'po', 'Hàng PA (ぱ行)', 'さんぽ', 'sanpo', 'Đi dạo'],
];

// 33 chữ Âm ghép Hiragana chuẩn (Yoon: 21 âm ghép cơ bản + 12 âm ghép đục/bán đục)
const HIRAGANA_YOON_RAW: RawKanaTuple[] = [
  ['きゃ', 'kya', 'Hàng KYA (きゃ)', 'きゃく', 'kyaku', 'Khách hàng'],
  ['きゅ', 'kyu', 'Hàng KYA (きゃ)', 'きゅう', 'kyuu', 'Số 9'],
  ['きょ', 'kyo', 'Hàng KYA (きゃ)', 'きょう', 'kyoo', 'Hôm nay'],

  ['しゃ', 'sha', 'Hàng SHA (しゃ)', 'しゃしん', 'shashin', 'Bức ảnh'],
  ['しゅ', 'shu', 'Hàng SHA (しゃ)', 'しゅみ', 'shumi', 'Sở thích'],
  ['しょ', 'sho', 'Hàng SHA (しゃ)', 'しょくどう', 'shokudoo', 'Nhà ăn'],

  ['ちゃ', 'cha', 'Hàng CHA (ちゃ)', 'おちゃ', 'ocha', 'Trà xanh'],
  ['ちゅ', 'chu', 'Hàng CHA (ちゃ)', 'ちゅうごく', 'Chuugoku', 'Trung Quốc'],
  ['ちょ', 'cho', 'Hàng CHA (ちゃ)', 'ちょっと', 'chotto', 'Một chút'],

  ['にゃ', 'nya', 'Hàng NYA (にゃ)', 'にゃんこ', 'nyanko', 'Chú mèo nhỏ'],
  ['にゅ', 'nyu', 'Hàng NYA (にゃ)', 'ぎゅうにゅう', 'gyuunyuu', 'Sữa bò'],
  ['にょ', 'nyo', 'Hàng NYA (にゃ)', 'にょうぼう', 'nyooboo', 'Vợ'],

  ['ひゃ', 'hya', 'Hàng HYA (ひゃ)', 'ひゃく', 'hyaku', 'Một trăm (100)'],
  ['ひゅ', 'hyu', 'Hàng HYA (ひゃ)', 'ひゅうが', 'Hyuuga', 'Tên riêng Hyuga'],
  ['ひょ', 'hyo', 'Hàng HYA (ひゃ)', 'ひょう', 'hyoo', 'Bảng biểu'],

  ['みゃ', 'mya', 'Hàng MYA (みゃ)', 'みゃく', 'myaku', 'Mạch đập'],
  ['みゅ', 'myu', 'Hàng MYA (みゃ)', 'みゅうじっく', 'myuujikku', 'Âm nhạc'],
  ['みょ', 'myo', 'Hàng MYA (みゃ)', 'みょうじ', 'myooji', 'Họ (trong họ tên)'],

  ['りゃ', 'rya', 'Hàng RYA (りゃ)', 'りゃくご', 'ryakugo', 'Từ viết tắt'],
  ['りゅ', 'ryu', 'Hàng RYA (りゃ)', 'りゅうがくせい', 'ryuugakusee', 'Du học sinh'],
  ['りょ', 'ryo', 'Hàng RYA (りゃ)', 'りょこう', 'ryokoo', 'Du lịch'],

  ['ぎゃ', 'gya', 'Hàng GYA (ぎゃ)', 'ぎゃく', 'gyaku', 'Ngược lại'],
  ['ぎゅ', 'gyu', 'Hàng GYA (ぎゃ)', 'ぎゅうにく', 'gyuuniku', 'Thịt bò'],
  ['ぎょ', 'gyo', 'Hàng GYA (ぎゃ)', 'きんぎょ', 'kingyo', 'Cá vàng'],

  ['じゃ', 'ja', 'Hàng JA (じゃ)', 'じゃま', 'jama', 'Làm phiền'],
  ['じゅ', 'ju', 'Hàng JA (じゃ)', 'じゅう', 'juu', 'Số 10'],
  ['じょ', 'jo', 'Hàng JA (じゃ)', 'じょうず', 'joozu', 'Giỏi / Khéo léo'],

  ['びゃ', 'bya', 'Hàng BYA (びゃ)', 'さんびゃく', 'sanbyaku', 'Ba trăm (300)'],
  ['びゅ', 'byu', 'Hàng BYA (びゃ)', 'びゅうびゅう', 'byuubyuu', 'Tiếng gió thổi'],
  ['びょ', 'byo', 'Hàng BYA (びゃ)', 'びょういん', 'byooin', 'Bệnh viện'],

  ['ぴゃ', 'pya', 'Hàng PYA (ぴゃ)', 'ろっぴゃく', 'roppyaku', 'Sáu trăm (600)'],
  ['ぴゅ', 'pyu', 'Hàng PYA (ぴゃ)', 'ぴゅうぴゅう', 'pyuupyuu', 'Tiếng gió rít'],
  ['ぴょ', 'pyo', 'Hàng PYA (ぴゃ)', 'はっぴょう', 'happyoo', 'Phát biểu / Trình bày'],
];

// 46 chữ Katakana cơ bản (Gojuon)
const KATAKANA_BASIC_RAW: RawKanaTuple[] = [
  ['ア', 'a', 'Hàng A (ア行)', 'アジア', 'Ajia', 'Châu Á'],
  ['イ', 'i', 'Hàng A (ア行)', 'インターネット', 'intaanetto', 'Mạng Internet'],
  ['ウ', 'u', 'Hàng A (ア行)', 'うどん → ウール', 'uuru', 'Len (Wool)'],
  ['エ', 'e', 'Hàng A (ア行)', 'エアコン', 'eakon', 'Máy điều hòa'],
  ['オ', 'o', 'Hàng A (ア行)', 'オレンジ', 'orenji', 'Quả cam'],

  ['カ', 'ka', 'Hàng KA (カ行)', 'カメラ', 'kamera', 'Máy ảnh'],
  ['キ', 'ki', 'Hàng KA (カ行)', 'ギター', 'gitaa', 'Đàn Guitar'],
  ['ク', 'ku', 'Hàng KA (カ行)', 'クラス', 'kurasu', 'Lớp học'],
  ['ケ', 'ke', 'Hàng KA (カ行)', 'ケーキ', 'keeki', 'Bánh kem'],
  ['コ', 'ko', 'Hàng KA (カ行)', 'コーヒー', 'koohii', 'Cà phê'],

  ['サ', 'sa', 'Hàng SA (サ行)', 'サッカー', 'sakkaa', 'Bóng đá'],
  ['シ', 'shi', 'Hàng SA (サ行)', 'シャツ', 'shatsu', 'Áo sơ mi'],
  ['ス', 'su', 'Hàng SA (サ行)', 'スマホ', 'sumaho', 'Điện thoại thông minh'],
  ['セ', 'se', 'Hàng SA (サ行)', 'セーター', 'seetaa', 'Áo len'],
  ['ソ', 'so', 'Hàng SA (サ行)', 'ソファ', 'sofa', 'Ghế Sofa'],

  ['タ', 'ta', 'Hàng TA (タ行)', 'タクシー', 'takushii', 'Xe Taxi'],
  ['チ', 'chi', 'Hàng TA (タ行)', 'チーズ', 'chiizu', 'Phô mai'],
  ['ツ', 'tsu', 'Hàng TA (タ行)', 'ツアー', 'tsuaa', 'Tour du lịch'],
  ['テ', 'te', 'Hàng TA (タ行)', 'テレビ', 'terebi', 'Ti-vi'],
  ['ト', 'to', 'Hàng TA (タ行)', 'トイレ', 'toire', 'Nhà vệ sinh'],

  ['ナ', 'na', 'Hàng NA (ナ行)', 'ナイフ', 'naifu', 'Con dao'],
  ['ニ', 'ni', 'Hàng NA (ナ行)', 'ニュース', 'nyuusu', 'Tin tức / Thời sự'],
  ['ヌ', 'nu', 'Hàng NA (ナ行)', 'カヌー', 'kanuu', 'Xuồng Canoe'],
  ['ネ', 'ne', 'Hàng NA (ナ行)', 'ネクタイ', 'nekutai', 'Cà vạt'],
  ['ノ', 'no', 'Hàng NA (ナ行)', 'ノート', 'nooto', 'Quyển vở'],

  ['ハ', 'ha', 'Hàng HA (ハ行)', 'ハンバーガー', 'hanbaagaa', 'Bánh Hamburger'],
  ['ヒ', 'hi', 'Hàng HA (ハ行)', 'ヒーター', 'hiitaa', 'Máy sưởi'],
  ['フ', 'fu', 'Hàng HA (ハ行)', 'フランス', 'Furansu', 'Nước Pháp'],
  ['ヘ', 'he', 'Hàng HA (ハ行)', 'ヘルメット', 'herumetto', 'Mũ bảo hiểm'],
  ['ホ', 'ho', 'Hàng HA (ハ行)', 'ホテル', 'hoteru', 'Khách sạn'],

  ['マ', 'ma', 'Hàng MA (マ行)', 'マンション', 'manshon', 'Chung cư'],
  ['ミ', 'mi', 'Hàng MA (マ行)', 'ミルク', 'miruku', 'Sữa'],
  ['ム', 'mu', 'Hàng MA (マ行)', 'チーム', 'chiimu', 'Đội / Nhóm'],
  ['メ', 'me', 'Hàng MA (マ行)', 'メール', 'meeru', 'Thư điện tử (Email)'],
  ['モ', 'mo', 'Hàng MA (マ行)', 'モデル', 'moderu', 'Người mẫu'],

  ['ヤ', 'ya', 'Hàng YA (ヤ行)', 'タイヤ', 'taiya', 'Lốp xe'],
  ['ユ', 'yu', 'Hàng YA (ヤ行)', 'ユニフォーム', 'yunifoomu', 'Đồng phục'],
  ['ヨ', 'yo', 'Hàng YA (ヤ行)', 'ヨーロッパ', 'Yooroppa', 'Châu Âu'],

  ['ラ', 'ra', 'Hàng RA (ラ行)', 'ラーメン', 'raamen', 'Mì Ramen'],
  ['リ', 'ri', 'Hàng RA (ラ行)', 'リモコン', 'rimokon', 'Điều khiển từ xa'],
  ['ル', 'ru', 'Hàng RA (ラ行)', 'ルール', 'ruuru', 'Quy tắc / Luật lệ'],
  ['レ', 're', 'Hàng RA (ラ行)', 'レストラン', 'resutoran', 'Nhà hàng'],
  ['ロ', 'ro', 'Hàng RA (ラ行)', 'ロビー', 'robii', 'Sảnh chờ (Lobby)'],

  ['ワ', 'wa', 'Hàng WA (ワ行)', 'ワイン', 'wain', 'Rượu vang'],
  ['ヲ', 'o (wo)', 'Hàng WA (ワ行)', 'ヲタク', 'otaku', 'Otaku'],
  ['ン', 'n', 'Phụ âm mũi N (ン)', 'パン', 'pan', 'Bánh mì'],
];

// 25 chữ Katakana âm đục & bán đục
const KATAKANA_DAKUON_RAW: RawKanaTuple[] = [
  ['ガ', 'ga', 'Hàng GA (ガ行)', 'ガラス', 'garasu', 'Kính / Thủy tinh'],
  ['ギ', 'gi', 'Hàng GA (ガ行)', 'ギター', 'gitaa', 'Đàn Guitar'],
  ['グ', 'gu', 'Hàng GA (ガ行)', 'グループ', 'guruupu', 'Nhóm'],
  ['ゲ', 'ge', 'Hàng GA (ガ行)', 'ゲーム', 'geemu', 'Trò chơi (Game)'],
  ['ゴ', 'go', 'Hàng GA (ガ行)', 'ゴルフ', 'gorufu', 'Môn Golf'],

  ['ザ', 'za', 'Hàng ZA (ザ行)', 'ピザ', 'piza', 'Bánh Pizza'],
  ['ジ', 'ji', 'Hàng ZA (ザ行)', 'ジュース', 'juusu', 'Nước ép trái cây'],
  ['ズ', 'zu', 'Hàng ZA (ザ行)', 'ズボン', 'zubon', 'Quần dài'],
  ['ゼ', 'ze', 'Hàng ZA (ザ行)', 'ゼロ', 'zero', 'Số 0'],
  ['ゾ', 'zo', 'Hàng ZA (ザ行)', 'ゾーン', 'zoon', 'Khu vực (Zone)'],

  ['ダ', 'da', 'Hàng DA (ダ行)', 'ダンス', 'dansu', 'Khiêu vũ / Nhảy'],
  ['ヂ', 'ji (di)', 'Hàng DA (ダ行)', 'ヂーゼル', 'diizeru', 'Động cơ Diesel'],
  ['ヅ', 'zu (du)', 'Hàng DA (ダ行)', 'つづく', 'tsuzuku', 'Ít dùng trong Katakana'],
  ['デ', 'de', 'Hàng DA (ダ行)', 'デパート', 'depaato', 'Trung tâm thương mại'],
  ['ド', 'do', 'Hàng DA (ダ行)', 'ドア', 'doa', 'Cánh cửa'],

  ['バ', 'ba', 'Hàng BA (バ行)', 'バス', 'basu', 'Xe buýt'],
  ['ビ', 'bi', 'Hàng BA (バ行)', 'ビール', 'biiru', 'Bia'],
  ['ブ', 'bu', 'Hàng BA (バ行)', 'テーブル', 'teeburu', 'Bàn ăn'],
  ['ベ', 'be', 'Hàng BA (バ行)', 'ベトナム', 'Betonamu', 'Việt Nam'],
  ['ボ', 'bo', 'Hàng BA (バ行)', 'ボールペン', 'boorupen', 'Bút bi'],

  ['パ', 'pa', 'Hàng PA (パ行)', 'パソコン', 'pasokon', 'Máy tính cá nhân'],
  ['ピ', 'pi', 'Hàng PA (パ行)', 'ピアノ', 'piano', 'Đàn Piano'],
  ['プ', 'pu', 'Hàng PA (パ行)', 'プレゼント', 'purezento', 'Món quà'],
  ['ペ', 'pe', 'Hàng PA (パ行)', 'ペン', 'pen', 'Cây bút'],
  ['ポ', 'po', 'Hàng PA (パ行)', 'ポケット', 'poketto', 'Túi áo / Túi quần'],
];

// 33 chữ Âm ghép Katakana chuẩn (Yoon: 21 âm ghép cơ bản + 12 âm ghép đục/bán đục)
const KATAKANA_YOON_RAW: RawKanaTuple[] = [
  ['キャ', 'kya', 'Hàng KYA (キャ)', 'キャンプ', 'kyanpu', 'Cắm trại'],
  ['キュ', 'kyu', 'Hàng KYA (キャ)', 'バーベキュー', 'baabekyuu', 'Tiệc nướng BBQ'],
  ['キョ', 'kyo', 'Hàng KYA (キャ)', 'キョウト', 'Kyooto', 'Cố đô Kyoto'],

  ['シャ', 'sha', 'Hàng SHA (シャ)', 'シャワー', 'shawaa', 'Vòi hoa sen'],
  ['シュ', 'shu', 'Hàng SHA (シャ)', 'シューズ', 'shuuzu', 'Giày thể thao'],
  ['ショ', 'sho', 'Hàng SHA (シャ)', 'ショッピング', 'shoppingu', 'Mua sắm'],

  ['チャ', 'cha', 'Hàng CHA (チャ)', 'チャンス', 'chansu', 'Cơ hội'],
  ['チュ', 'chu', 'Hàng CHA (チャ)', 'シチュー', 'shichuu', 'Món hầm (Stew)'],
  ['チョ', 'cho', 'Hàng CHA (チャ)', 'チョコレート', 'chokoreeto', 'Sô-cô-la'],

  ['ニャ', 'nya', 'Hàng NYA (ニャ)', 'ニャチャン', 'Nyachan', 'Nha Trang'],
  ['ニュ', 'nyu', 'Hàng NYA (ニャ)', 'メニュー', 'menyuu', 'Thực đơn (Menu)'],
  ['ニョ', 'nyo', 'Hàng NYA (ニャ)', 'ニョクマム', 'nyokumamu', 'Nước mắm'],

  ['ヒャ', 'hya', 'Hàng HYA (ヒャ)', 'ヒャク', 'hyaku', 'Một trăm (100)'],
  ['ヒュ', 'hyu', 'Hàng HYA (ヒャ)', 'ヒューズ', 'hyuuzu', 'Cầu chì (Fuse)'],
  ['ヒョ', 'hyo', 'Hàng HYA (ヒャ)', 'ヒョウ', 'hyoo', 'Con báo (Leopard)'],

  ['ミャ', 'mya', 'Hàng MYA (ミャ)', 'ミャンマー', 'Myanmaa', 'Myanmar'],
  ['ミュ', 'myu', 'Hàng MYA (ミャ)', 'ミュージカル', 'myuujikaru', 'Nhạc kịch'],
  ['ミョ', 'myo', 'Hàng MYA (ミャ)', 'ミョウバン', 'myooban', 'Phèn chua'],

  ['リャ', 'rya', 'Hàng RYA (リャ)', 'リャマ', 'ryama', 'Lạc đà không bướu (Llama)'],
  ['リュ', 'ryu', 'Hàng RYA (リャ)', 'リュック', 'ryukku', 'Ba lô (Rucksack)'],
  ['リョ', 'ryo', 'Hàng RYA (リャ)', 'マトリョーシカ', 'matoryooshika', 'Búp bê Nga'],

  ['ギャ', 'gya', 'Hàng GYA (ギャ)', 'ギャラリー', 'gyararii', 'Phòng trưng bày'],
  ['ギュ', 'gyu', 'Hàng GYA (ギャ)', 'フィギュア', 'figyua', 'Mô hình (Figure)'],
  ['ギョ', 'gyo', 'Hàng GYA (ギャ)', 'ギョーザ', 'gyooza', 'Há cảo áp chảo (Gyoza)'],

  ['ジャ', 'ja', 'Hàng JA (ジャ)', 'ジャケット', 'jaketto', 'Áo khoác (Jacket)'],
  ['ジュ', 'ju', 'Hàng JA (ジャ)', 'ジュース', 'juusu', 'Nước ép trái cây'],
  ['ジョ', 'jo', 'Hàng JA (ジャ)', 'ジョギング', 'jogingu', 'Chạy bộ (Jogging)'],

  ['ビャ', 'bya', 'Hàng BYA (ビャ)', 'ビャクダン', 'byakudan', 'Gỗ đàn hương'],
  ['ビュ', 'byu', 'Hàng BYA (ビャ)', 'ビュッフェ', 'byuffe', 'Tiệc đứng (Buffet)'],
  ['ビョ', 'byo', 'Hàng BYA (ビャ)', 'ビョウ', 'byoo', 'Đinh tán'],

  ['ピャ', 'pya', 'Hàng PYA (ピャ)', 'ピャー', 'pyaa', 'Tiếng kêu'],
  ['ピュ', 'pyu', 'Hàng PYA (ピャ)', 'コンピュータ', 'konpyuuta', 'Máy vi tính'],
  ['ピョ', 'pyo', 'Hàng PYA (ピャ)', 'ピョンヤン', 'Pyonyan', 'Bình Nhưỡng'],
];

function buildKanaList(
  system: KanaSystem,
  group: KanaGroup,
  tuples: RawKanaTuple[]
): KanaItem[] {
  return tuples.map(
    ([character, romaji, row, example_word, example_reading, example_vn], idx) => ({
      id: `${system}-${group}-${idx + 1}`,
      system,
      group,
      row,
      character,
      romaji,
      example_word,
      example_reading,
      example_vn,
    })
  );
}

export const HIRAGANA_ITEMS: KanaItem[] = [
  ...buildKanaList('hiragana', 'basic', HIRAGANA_BASIC_RAW),
  ...buildKanaList('hiragana', 'dakuon', HIRAGANA_DAKUON_RAW),
  ...buildKanaList('hiragana', 'yoon', HIRAGANA_YOON_RAW),
];

export const KATAKANA_ITEMS: KanaItem[] = [
  ...buildKanaList('katakana', 'basic', KATAKANA_BASIC_RAW),
  ...buildKanaList('katakana', 'dakuon', KATAKANA_DAKUON_RAW),
  ...buildKanaList('katakana', 'yoon', KATAKANA_YOON_RAW),
];
