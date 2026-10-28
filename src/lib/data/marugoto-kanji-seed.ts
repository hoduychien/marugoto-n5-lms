export interface KanjiItem {
  id: number;
  lesson_id: number;
  character: string; // Chữ Hán đơn (1 ký tự Kanji chuẩn để hiển thị và tập viết)
  yomikata: string; // Từ vựng Kanji trong bài (ví dụ: 食べます - たべます)
  onyomi?: string | null;
  kunyomi?: string | null;
  han_viet?: string;
  meaning_vn: string;
  stroke_count: number;
  stroke_gif_url?: string | null;
  example_jp?: string;
  example_vn?: string;
  is_rikai_official?: boolean;
}

type RawKanjiSeed = Omit<KanjiItem, 'id' | 'lesson_id'>;

/**
 * Toàn bộ các chữ Kanji chuẩn từ `MarugotoStarterCompetencesKanjiList.pdf`
 * Mỗi mục hiển thị đúng 1 chữ Kanji đơn ở ô chữ Hán để giao diện thoáng đẹp và tập viết chuẩn.
 */
const RAW_KANJI_BY_LESSON: Record<number, RawKanjiSeed[]> = {
  // Bài 1: Lớp học & Tiếng Nhật
  1: [
    { character: '日', yomikata: 'にほんご', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・び', han_viet: 'NHẬT', meaning_vn: 'Mặt trời, ngày, Nhật Bản', stroke_count: 4, example_jp: '日本語（にほんご）を勉強します。', example_vn: 'Tôi học tiếng Nhật.' },
    { character: '本', yomikata: 'ほん', onyomi: 'ホン', kunyomi: 'もと', han_viet: 'BẢN', meaning_vn: 'Sách, gốc, Nhật Bản', stroke_count: 5, example_jp: '日本語の本（ほん）。', example_vn: 'Sách tiếng Nhật.' },
    { character: '語', yomikata: 'にほんご', onyomi: 'ゴ', kunyomi: 'かた.る', han_viet: 'NGỮ', meaning_vn: 'Ngôn ngữ, tiếng', stroke_count: 14, example_jp: '日本語（にほんご）・英語（えいご）', example_vn: 'Tiếng Nhật / Tiếng Anh' },
    { character: '学', yomikata: 'がくせい', onyomi: 'ガク', kunyomi: 'まな.ぶ', han_viet: 'HỌC', meaning_vn: 'Học tập, trường học', stroke_count: 8, example_jp: '学生（がくせい）・学校（がっこう）', example_vn: 'Sinh viên / Trường học' },
    { character: '生', yomikata: 'せんせい', onyomi: 'セイ・ショウ', kunyomi: 'い.きる', han_viet: 'SINH', meaning_vn: 'Sinh sống, học sinh, thầy giáo', stroke_count: 5, example_jp: '先生（せんせい）・学生（がくせい）', example_vn: 'Thầy cô giáo / Học sinh' },
    { character: '先', yomikata: 'せんせい', onyomi: 'セン', kunyomi: 'さき', han_viet: 'TIÊN', meaning_vn: 'Trước, thầy cô', stroke_count: 6, example_jp: '佐藤先生（せんせい）。', example_vn: 'Thầy/cô Sato.' },
  ],

  // Bài 2: Hoạt động trong lớp học
  2: [
    { character: '話', yomikata: 'はなします', onyomi: 'ワ', kunyomi: 'はな.す', han_viet: 'THOẠI', meaning_vn: 'Nói chuyện, hội thoại', stroke_count: 13, example_jp: '話します（はなします）', example_vn: 'Nói chuyện' },
    { character: '聞', yomikata: 'ききます', onyomi: 'ブン', kunyomi: 'き.く', han_viet: 'VĂN', meaning_vn: 'Nghe, hỏi', stroke_count: 14, example_jp: '聞きます（ききます）', example_vn: 'Nghe' },
    { character: '見', yomikata: 'みます', onyomi: 'ケン', kunyomi: 'み.る', han_viet: 'KIẾN', meaning_vn: 'Nhìn, xem', stroke_count: 7, example_jp: '見ます（みます）', example_vn: 'Xem, nhìn' },
    { character: '読', yomikata: 'よみます', onyomi: 'ドク', kunyomi: 'よ.む', han_viet: 'ĐỘC', meaning_vn: 'Đọc', stroke_count: 14, example_jp: '読みます（よみます）', example_vn: 'Đọc sách' },
    { character: '書', yomikata: 'かきます', onyomi: 'ショ', kunyomi: 'か.く', han_viet: 'THƯ', meaning_vn: 'Viết, sách', stroke_count: 10, example_jp: '書きます（かきます）', example_vn: 'Viết chữ' },
    { character: '休', yomikata: 'やすみます', onyomi: 'キュウ', kunyomi: 'やす.む', han_viet: 'HƯU', meaning_vn: 'Nghỉ ngơi', stroke_count: 6, example_jp: '休みます（やすみます）', example_vn: 'Nghỉ ngơi' },
  ],

  // Bài 3: Bản thân & Con người
  3: [
    { character: '私', yomikata: 'わたし', onyomi: 'シ', kunyomi: 'わたし', han_viet: 'TƯ', meaning_vn: 'Tôi, cá nhân', stroke_count: 7, example_jp: '私（わたし）はベトナム人です。', example_vn: 'Tôi là người Việt Nam.' },
    { character: '人', yomikata: 'ひと', onyomi: 'ジン・ニン', kunyomi: 'ひと', han_viet: 'NHÂN', meaning_vn: 'Người, quốc tịch', stroke_count: 2, example_jp: '日本人（にほんじん）・あの人（ひと）', example_vn: 'Người Nhật / Người kia' },
    { character: '男', yomikata: 'おとこ', onyomi: 'ダン', kunyomi: 'おとこ', han_viet: 'NAM', meaning_vn: 'Đàn ông, nam giới', stroke_count: 7, example_jp: '男の人（おとこのひと）', example_vn: 'Người đàn ông' },
    { character: '女', yomikata: 'おんな', onyomi: 'ジョ', kunyomi: 'おんな', han_viet: 'NỮ', meaning_vn: 'Phụ nữ, nữ giới', stroke_count: 3, example_jp: '女の人（おんなのひと）', example_vn: 'Người phụ nữ' },
    { character: '子', yomikata: 'こども', onyomi: 'シ', kunyomi: 'こ', han_viet: 'TỬ', meaning_vn: 'Con, đứa trẻ', stroke_count: 3, example_jp: '子ども（こども）', example_vn: 'Trẻ con, con cái' },
    { character: '友', yomikata: 'ともだち', onyomi: 'ユウ', kunyomi: 'とも', han_viet: 'HỮU', meaning_vn: 'Bạn bè', stroke_count: 4, example_jp: '友だち（ともだち）', example_vn: 'Bạn bè' },
  ],

  // Bài 4: Gia đình & Đất nước
  4: [
    { character: '父', yomikata: 'ちち', onyomi: 'フ', kunyomi: 'ちち', han_viet: 'PHỤ', meaning_vn: 'Bố, cha', stroke_count: 4, example_jp: '父（ちち）・お父さん（おとうさん）', example_vn: 'Bố mình / Bố người khác' },
    { character: '母', yomikata: 'はは', onyomi: 'ボ', kunyomi: 'はは', han_viet: 'MẪU', meaning_vn: 'Mẹ, má', stroke_count: 5, example_jp: '母（はは）・お母さん（おかあさん）', example_vn: 'Mẹ mình / Mẹ người khác' },
    { character: '兄', yomikata: 'あに', onyomi: 'ケイ・キョウ', kunyomi: 'あに', han_viet: 'HUYNH', meaning_vn: 'Anh trai', stroke_count: 5, example_jp: '兄（あに）・お兄さん（おにいさん）', example_vn: 'Anh trai' },
    { character: '姉', yomikata: 'あね', onyomi: 'シ', kunyomi: 'あね', han_viet: 'TỶ', meaning_vn: 'Chị gái', stroke_count: 8, example_jp: '姉（あね）・お姉さん（おねえさん）', example_vn: 'Chị gái' },
    { character: '弟', yomikata: 'おとうと', onyomi: 'テイ・ダイ', kunyomi: 'おとうと', han_viet: 'ĐỆ', meaning_vn: 'Em trai', stroke_count: 7, example_jp: '弟（おとうと）・兄弟（きょうだい）', example_vn: 'Em trai / Anh chị em' },
    { character: '妹', yomikata: 'いもうと', onyomi: 'マイ', kunyomi: 'いもうと', han_viet: 'MUỘI', meaning_vn: 'Em gái', stroke_count: 8, example_jp: '妹（いもうと）は学生です。', example_vn: 'Em gái tôi là học sinh.' },
    { character: '国', yomikata: 'くに', onyomi: 'コク', kunyomi: 'くに', han_viet: 'QUỐC', meaning_vn: 'Đất nước, quốc gia', stroke_count: 8, example_jp: '国（くに）・外国（がいこく）', example_vn: 'Đất nước / Nước ngoài' },
  ],

  // ==================== BÀI 5 (Kanji List #1 -> #4) ====================
  5: [
    { character: '魚', yomikata: 'さかな', onyomi: 'ギョ', kunyomi: 'さかな', han_viet: 'NGƯ', meaning_vn: 'Cá', stroke_count: 11, example_jp: '魚（さかな）が好きです。', example_vn: 'Tôi thích ăn cá.', is_rikai_official: true },
    { character: '肉', yomikata: 'にく', onyomi: 'ニク', kunyomi: '-', han_viet: 'NHỤC', meaning_vn: 'Thịt', stroke_count: 6, example_jp: '牛肉（ぎゅうにく）・豚肉（ぶたにく）', example_vn: 'Thịt bò / Thịt lợn', is_rikai_official: true },
    { character: '卵', yomikata: 'たまご', onyomi: 'ラン', kunyomi: 'たまご', han_viet: 'NOÃN', meaning_vn: 'Trứng', stroke_count: 7, example_jp: '毎朝、卵（たまご）を食べます。', example_vn: 'Mỗi sáng tôi ăn trứng.', is_rikai_official: true },
    { character: '水', yomikata: 'みず', onyomi: 'スイ', kunyomi: 'みず', han_viet: 'THỦY', meaning_vn: 'Nước', stroke_count: 4, example_jp: '冷たい水（みず）を飲みます。', example_vn: 'Uống nước mát.', is_rikai_official: true },
  ],

  // ==================== BÀI 6 (Kanji List #5 -> #6) ====================
  6: [
    { character: '食', yomikata: 'たべます', onyomi: 'ショク', kunyomi: 'た.べる', han_viet: 'THỰC', meaning_vn: 'Ăn, bữa ăn', stroke_count: 9, example_jp: '食べます（たべます）・食事（しょくじ）', example_vn: 'Ăn / Dùng bữa', is_rikai_official: true },
    { character: '飲', yomikata: 'のみます', onyomi: 'イン', kunyomi: 'の.む', han_viet: 'ẨM', meaning_vn: 'Uống, đồ uống', stroke_count: 12, example_jp: '飲みます（のみます）・飲み物（のみもの）', example_vn: 'Uống / Đồ uống', is_rikai_official: true },
    { character: '茶', yomikata: 'おちゃ', onyomi: 'チャ・サ', kunyomi: '-', han_viet: 'TRÀ', meaning_vn: 'Trà xanh, quán trà', stroke_count: 9, example_jp: 'お茶（おちゃ）・喫茶店（きっさてん）', example_vn: 'Trà xanh / Quán giải khát' },
    { character: '店', yomikata: 'みせ', onyomi: 'テン', kunyomi: 'みせ', han_viet: 'ĐIẾM', meaning_vn: 'Cửa hàng, quán', stroke_count: 8, example_jp: 'きれいな店（みせ）ですね。', example_vn: 'Quán đẹp quá nhỉ.' },
  ],

  // Bài 7: Nhà cửa
  7: [
    { character: '家', yomikata: 'いえ', onyomi: 'カ・ケ', kunyomi: 'いえ・うち', han_viet: 'GIA', meaning_vn: 'Ngôi nhà, gia đình', stroke_count: 10, example_jp: '家（いえ）・家族（かぞく）', example_vn: 'Ngôi nhà / Gia đình' },
    { character: '室', yomikata: 'わしつ', onyomi: 'シツ', kunyomi: 'むろ', han_viet: 'THẤT', meaning_vn: 'Căn phòng', stroke_count: 9, example_jp: '和室（わしつ）・教室（きょうしつ）', example_vn: 'Phòng kiểu Nhật / Phòng học' },
    { character: '電', yomikata: 'でんき', onyomi: 'デン', kunyomi: '-', han_viet: 'ĐIỆN', meaning_vn: 'Điện, điện tử', stroke_count: 13, example_jp: '電気（でんき）・電子（でんし）レンジ', example_vn: 'Điện / Lò vi sóng' },
  ],

  // ==================== BÀI 8 (Kanji List #7 -> #10) ====================
  8: [
    { character: '大', yomikata: 'おおきい', onyomi: 'ダイ・タイ', kunyomi: 'おお.きい', han_viet: 'ĐẠI', meaning_vn: 'To, lớn', stroke_count: 3, example_jp: '大きい（おおきい）テレビ。', example_vn: 'Chiếc tivi lớn.', is_rikai_official: true },
    { character: '小', yomikata: 'ちいさい', onyomi: 'ショウ', kunyomi: 'ちい.さい', han_viet: 'TIỂU', meaning_vn: 'Nhỏ, bé', stroke_count: 3, example_jp: '小さい（ちいさい）庭。', example_vn: 'Khu vườn nhỏ.', is_rikai_official: true },
    { character: '新', yomikata: 'あたらしい', onyomi: 'シン', kunyomi: 'あたら.しい', han_viet: 'TÂN', meaning_vn: 'Mới', stroke_count: 13, example_jp: '新しい（あたらしい）家。', example_vn: 'Ngôi nhà mới.', is_rikai_official: true },
    { character: '古', yomikata: 'ふるい', onyomi: 'コ', kunyomi: 'ふる.い', han_viet: 'CỔ', meaning_vn: 'Cũ, cổ kính', stroke_count: 5, example_jp: '古い（ふるい）お寺。', example_vn: 'Ngôi chùa cổ.', is_rikai_official: true },
  ],

  // ==================== BÀI 9 (Kanji List #11 -> #13) ====================
  9: [
    { character: '時', yomikata: 'ごじ', onyomi: 'ジ', kunyomi: 'とき', han_viet: 'THỜI', meaning_vn: 'Giờ, thời gian', stroke_count: 10, example_jp: '5時（ごじ）・時間（じかん）', example_vn: '5 giờ / Thời gian', is_rikai_official: true },
    { character: '分', yomikata: 'さんじゅっぷん', onyomi: 'フン・ブン', kunyomi: 'わ.ける', han_viet: 'PHÂN', meaning_vn: 'Phút, chia ra', stroke_count: 4, example_jp: '5時30分（ごじさんじゅっぷん）', example_vn: '5 giờ 30 phút', is_rikai_official: true },
    { character: '半', yomikata: 'ろくじはん', onyomi: 'ハン', kunyomi: 'なか.ば', han_viet: 'BÁN', meaning_vn: 'Một nửa, rưỡi', stroke_count: 5, example_jp: '6時半（ろくじはん）に起きます。', example_vn: 'Dậy lúc 6 giờ rưỡi.', is_rikai_official: true },
  ],

  // ==================== BÀI 10 (Kanji List #14 -> #21) ====================
  10: [
    { character: '月', yomikata: 'げつようび', onyomi: 'ゲツ・ガツ', kunyomi: 'つき', han_viet: 'NGUYỆT', meaning_vn: 'Mặt trăng, thứ Hai, tháng', stroke_count: 4, example_jp: '月よう日（げつようび）', example_vn: 'Thứ Hai', is_rikai_official: true },
    { character: '火', yomikata: 'かようび', onyomi: 'カ', kunyomi: 'ひ', han_viet: 'HỎA', meaning_vn: 'Lửa, thứ Ba', stroke_count: 4, example_jp: '火よう日（かようび）', example_vn: 'Thứ Ba', is_rikai_official: true },
    { character: '水', yomikata: 'すいようび', onyomi: 'スイ', kunyomi: 'みず', han_viet: 'THỦY', meaning_vn: 'Nước, thứ Tư', stroke_count: 4, example_jp: '水よう日（すいようび）', example_vn: 'Thứ Tư', is_rikai_official: true },
    { character: '木', yomikata: 'もくようび', onyomi: 'モク・ボク', kunyomi: 'き', han_viet: 'MỘC', meaning_vn: 'Cây gỗ, thứ Năm', stroke_count: 4, example_jp: '木よう日（もくようび）', example_vn: 'Thứ Năm', is_rikai_official: true },
    { character: '金', yomikata: 'きんようび', onyomi: 'キン・コン', kunyomi: 'かね', han_viet: 'KIM', meaning_vn: 'Vàng, tiền, thứ Sáu', stroke_count: 8, example_jp: '金よう日（きんようび）', example_vn: 'Thứ Sáu', is_rikai_official: true },
    { character: '土', yomikata: 'どようび', onyomi: 'ド・ト', kunyomi: 'つち', han_viet: 'THỔ', meaning_vn: 'Đất, thứ Bảy', stroke_count: 3, example_jp: '土よう日（どようび）', example_vn: 'Thứ Bảy', is_rikai_official: true },
    { character: '日', yomikata: 'にちようび', onyomi: 'ニチ・ジツ', kunyomi: 'ひ・び', han_viet: 'NHẬT', meaning_vn: 'Mặt trời, Chủ nhật, ngày', stroke_count: 4, example_jp: '日よう日（にちようび）', example_vn: 'Chủ nhật', is_rikai_official: true },
  ],

  // ==================== BÀI 11 (Kanji List #22 -> #27) ====================
  11: [
    { character: '言', yomikata: 'いいます', onyomi: 'ゲン・ゴン', kunyomi: 'い.う', han_viet: 'NGÔN', meaning_vn: 'Nói, lời nói', stroke_count: 7, example_jp: '言います（いいます）', example_vn: 'Nói', is_rikai_official: true },
    { character: '話', yomikata: 'はなします', onyomi: 'ワ', kunyomi: 'はな.す', han_viet: 'THOẠI', meaning_vn: 'Nói chuyện', stroke_count: 13, example_jp: '話します（はなします）', example_vn: 'Nói chuyện với bạn', is_rikai_official: true },
    { character: '読', yomikata: 'よみます', onyomi: 'ドク', kunyomi: 'よ.む', han_viet: 'ĐỘC', meaning_vn: 'Đọc', stroke_count: 14, example_jp: '本を読みます（よみます）', example_vn: 'Đọc sách', is_rikai_official: true },
    { character: '見', yomikata: 'みます', onyomi: 'ケン', kunyomi: 'み.る', han_viet: 'KIẾN', meaning_vn: 'Xem, nhìn', stroke_count: 7, example_jp: '映画を見ます（みます）', example_vn: 'Xem phim', is_rikai_official: true },
    { character: '聞', yomikata: 'ききます', onyomi: 'ブン・モン', kunyomi: 'き.く', han_viet: 'VĂN', meaning_vn: 'Nghe', stroke_count: 14, example_jp: '音楽を聞きます（ききます）', example_vn: 'Nghe nhạc', is_rikai_official: true },
    { character: '書', yomikata: 'かきます', onyomi: 'ショ', kunyomi: 'か.く', han_viet: 'THƯ', meaning_vn: 'Viết, vẽ', stroke_count: 10, example_jp: '手紙を書きます（かきます）', example_vn: 'Viết thư', is_rikai_official: true },
  ],

  // ==================== BÀI 12 (Kanji List #28 -> #40) ====================
  12: [
    { character: '一', yomikata: 'いち', onyomi: 'イチ', kunyomi: 'ひと.つ', han_viet: 'NHẤT', meaning_vn: 'Số 1', stroke_count: 1, example_jp: '一月（いちがつ）・一日（ついたち）', example_vn: 'Tháng 1 / Ngày mùng 1', is_rikai_official: true },
    { character: '二', yomikata: 'に', onyomi: 'ニ', kunyomi: 'ふた.つ', han_viet: 'NHỊ', meaning_vn: 'Số 2', stroke_count: 2, example_jp: '二月（にがつ）・二日（ふつか）', example_vn: 'Tháng 2 / Ngày mùng 2', is_rikai_official: true },
    { character: '三', yomikata: 'さん', onyomi: 'サン', kunyomi: 'みっ.つ', han_viet: 'TAM', meaning_vn: 'Số 3', stroke_count: 3, example_jp: '三月（さんがつ）・三日（みっか）', example_vn: 'Tháng 3 / Ngày mùng 3', is_rikai_official: true },
    { character: '四', yomikata: 'よん', onyomi: 'シ', kunyomi: 'よん・よっ.つ', han_viet: 'TỨ', meaning_vn: 'Số 4', stroke_count: 5, example_jp: '四月（しがつ）・四日（よっか）', example_vn: 'Tháng 4 / Ngày mùng 4', is_rikai_official: true },
    { character: '五', yomikata: 'ご', onyomi: 'ゴ', kunyomi: 'いつ.つ', han_viet: 'NGŨ', meaning_vn: 'Số 5', stroke_count: 4, example_jp: '五月（ごがつ）・五日（いつか）', example_vn: 'Tháng 5 / Ngày mùng 5', is_rikai_official: true },
    { character: '六', yomikata: 'ろく', onyomi: 'ロク', kunyomi: 'むっ.つ', han_viet: 'LỤC', meaning_vn: 'Số 6', stroke_count: 4, example_jp: '六月（ろくがつ）・六日（むいか）', example_vn: 'Tháng 6 / Ngày mùng 6', is_rikai_official: true },
    { character: '七', yomikata: 'なな', onyomi: 'シチ', kunyomi: 'なな.つ', han_viet: 'THẤT', meaning_vn: 'Số 7', stroke_count: 2, example_jp: '七月（しちがつ）・七日（なのか）', example_vn: 'Tháng 7 / Ngày mùng 7', is_rikai_official: true },
    { character: '八', yomikata: 'はち', onyomi: 'ハチ', kunyomi: 'やっ.つ', han_viet: 'BÁT', meaning_vn: 'Số 8', stroke_count: 2, example_jp: '八月（はちがつ）・八日（ようか）', example_vn: 'Tháng 8 / Ngày mùng 8', is_rikai_official: true },
    { character: '九', yomikata: 'きゅう', onyomi: 'キュウ・ク', kunyomi: 'ここの.つ', han_viet: 'CỬU', meaning_vn: 'Số 9', stroke_count: 2, example_jp: '九月（くがつ）・九日（ここのか）', example_vn: 'Tháng 9 / Ngày mùng 9', is_rikai_official: true },
    { character: '十', yomikata: 'じゅう', onyomi: 'ジュウ', kunyomi: 'とお', han_viet: 'THẬP', meaning_vn: 'Số 10', stroke_count: 2, example_jp: '十月（じゅうがつ）・十日（とおか）', example_vn: 'Tháng 10 / Ngày mùng 10', is_rikai_official: true },
    { character: '年', yomikata: 'ねん', onyomi: 'ネン', kunyomi: 'とし', han_viet: 'NIÊN', meaning_vn: 'Năm (~ねん)', stroke_count: 6, example_jp: '今年（ことし）・来年（らいねん）', example_vn: 'Năm nay / Năm sau', is_rikai_official: true },
  ],

  // ==================== BÀI 13 (Kanji List #41 -> #49) ====================
  13: [
    { character: '東', yomikata: 'ひがし', onyomi: 'トウ', kunyomi: 'ひがし', han_viet: 'ĐÔNG', meaning_vn: 'Phía Đông', stroke_count: 8, example_jp: '東（ひがし）・東口（ひがしぐち）', example_vn: 'Phía Đông / Cổng Đông', is_rikai_official: true },
    { character: '西', yomikata: 'にし', onyomi: 'セイ・サイ', kunyomi: 'にし', han_viet: 'TÂY', meaning_vn: 'Phía Tây', stroke_count: 6, example_jp: '西（にし）・西口（にしぐち）', example_vn: 'Phía Tây / Cổng Tây', is_rikai_official: true },
    { character: '南', yomikata: 'みなみ', onyomi: 'ナン', kunyomi: 'みなみ', han_viet: 'NAM', meaning_vn: 'Phía Nam', stroke_count: 9, example_jp: '南（みなみ）・南口（みなみぐち）', example_vn: 'Phía Nam / Cổng Nam', is_rikai_official: true },
    { character: '北', yomikata: 'きた', onyomi: 'ホク', kunyomi: 'きた', han_viet: 'BẮC', meaning_vn: 'Phía Bắc', stroke_count: 5, example_jp: '北（きた）・北口（きたぐち）', example_vn: 'Phía Bắc / Cổng Bắc', is_rikai_official: true },
    { character: '口', yomikata: 'くち', onyomi: 'コウ・ク', kunyomi: 'くち・ぐち', han_viet: 'KHẨU', meaning_vn: 'Cửa, cổng ra vào', stroke_count: 3, example_jp: '入口（いりぐち）・出口（でぐち）', example_vn: 'Lối vào / Lối ra', is_rikai_official: true },
  ],

  // Bài 14: Phố phường & Địa điểm
  14: [
    { character: '町', yomikata: 'まち', onyomi: 'チョウ', kunyomi: 'まち', han_viet: 'ĐINH', meaning_vn: 'Thị trấn, khu phố', stroke_count: 7, example_jp: 'にぎやかな町（まち）。', example_vn: 'Khu phố nhộn nhịp.' },
    { character: '駅', yomikata: 'えき', onyomi: 'エキ', kunyomi: '-', han_viet: 'DỊCH', meaning_vn: 'Nhà ga', stroke_count: 14, example_jp: '駅（えき）の前。', example_vn: 'Trước nhà ga.' },
    { character: '高', yomikata: 'たかい', onyomi: 'コウ', kunyomi: 'たか.い', han_viet: 'CAO', meaning_vn: 'Cao, đắt', stroke_count: 10, example_jp: '高い（たかい）ビル。', example_vn: 'Tòa nhà cao tầng.' },
    { character: '安', yomikata: 'やすい', onyomi: 'アン', kunyomi: 'やす.い', han_viet: 'AN', meaning_vn: 'An toàn, rẻ', stroke_count: 6, example_jp: '安全（あんぜん）・安い（やすい）', example_vn: 'An toàn / Rẻ' },
  ],

  // Bài 15: Quà tặng & Đồ vật
  15: [
    { character: '花', yomikata: 'はな', onyomi: 'カ', kunyomi: 'はな', han_viet: 'HOA', meaning_vn: 'Bông hoa', stroke_count: 7, example_jp: 'きれいな花（はな）。', example_vn: 'Bông hoa đẹp.' },
    { character: '重', yomikata: 'おもい', onyomi: 'ジュウ', kunyomi: 'おも.い', han_viet: 'TRỌNG', meaning_vn: 'Nặng', stroke_count: 9, example_jp: '重い（おもい）かばん。', example_vn: 'Chiếc cặp nặng.' },
    { character: '軽', yomikata: 'かるい', onyomi: 'ケイ', kunyomi: 'かる.い', han_viet: 'KHINH', meaning_vn: 'Nhẹ', stroke_count: 12, example_jp: '軽い（かるい）カメラ。', example_vn: 'Chiếc máy ảnh nhẹ.' },
  ],

  // ==================== BÀI 16 (Kanji List #50 -> #59) ====================
  16: [
    { character: '買', yomikata: 'かいます', onyomi: 'バイ', kunyomi: 'か.う', han_viet: 'MÃI', meaning_vn: 'Mua, mua sắm', stroke_count: 12, example_jp: '買います（かいます）・買い物（かいもの）', example_vn: 'Mua / Việc mua sắm', is_rikai_official: true },
    { character: '金', yomikata: 'おかね', onyomi: 'キン', kunyomi: 'かね', han_viet: 'KIM', meaning_vn: 'Tiền bạc, vàng', stroke_count: 8, example_jp: 'お金（おかね）を払います。', example_vn: 'Thanh toán tiền.', is_rikai_official: true },
    { character: '円', yomikata: 'えん', onyomi: 'エン', kunyomi: 'まる.い', han_viet: 'VIÊN', meaning_vn: 'Yên Nhật (¥)', stroke_count: 4, example_jp: '百円（ひゃくえん）・千円（せんえん）', example_vn: '100 Yên / 1,000 Yên', is_rikai_official: true },
    { character: '百', yomikata: 'ひゃく', onyomi: 'ヒャク', kunyomi: '-', han_viet: 'BÁCH', meaning_vn: 'Một trăm (100)', stroke_count: 6, example_jp: '百円（ひゃくえん）・三百（さんびゃく）', example_vn: '100 Yên / 300', is_rikai_official: true },
    { character: '千', yomikata: 'せん', onyomi: 'セン', kunyomi: 'ち', han_viet: 'THIÊN', meaning_vn: 'Một nghìn (1,000)', stroke_count: 3, example_jp: '千円（せんえん）・三千（さんぜん）', example_vn: '1,000 Yên / 3,000', is_rikai_official: true },
    { character: '万', yomikata: 'まん', onyomi: 'マン・バン', kunyomi: '-', han_viet: 'VẠN', meaning_vn: 'Mười nghìn / Một vạn (10,000)', stroke_count: 3, example_jp: '一万円（いちまんえん）', example_vn: '10,000 Yên', is_rikai_official: true },
  ],

  // Bài 17: Cảm xúc kỳ nghỉ
  17: [
    { character: '楽', yomikata: 'たのしい', onyomi: 'ガク・ラク', kunyomi: 'たの.しい', han_viet: 'LẠC', meaning_vn: 'Vui vẻ, âm nhạc', stroke_count: 13, example_jp: '楽しい（たのしい）・音楽（おんがく）', example_vn: 'Vui vẻ / Âm nhạc' },
    { character: '長', yomikata: 'ながい', onyomi: 'チョウ', kunyomi: 'なが.い', han_viet: 'TRƯỜNG', meaning_vn: 'Dài, trưởng', stroke_count: 8, example_jp: '長い（ながい）休み。', example_vn: 'Kỳ nghỉ dài.' },
    { character: '難', yomikata: 'むずかしい', onyomi: 'ナン', kunyomi: 'むずか.しい', han_viet: 'NAN', meaning_vn: 'Khó khăn', stroke_count: 18, example_jp: '難しい（むずかしい）問題。', example_vn: 'Câu hỏi khó.' },
  ],

  // ==================== BÀI 18 (Kanji List #60 -> #65) ====================
  18: [
    { character: '行', yomikata: 'いきます', onyomi: 'コウ・ギョウ', kunyomi: 'い.く', han_viet: 'HÀNH', meaning_vn: 'Đi, du lịch', stroke_count: 6, example_jp: '行きます（いきます）・旅行（りょこう）', example_vn: 'Đi / Du lịch', is_rikai_official: true },
    { character: '来', yomikata: 'きます', onyomi: 'ライ', kunyomi: 'く.る', han_viet: 'LAI', meaning_vn: 'Đến', stroke_count: 7, example_jp: '来ます（きます）・来週（らいしゅう）', example_vn: 'Đến / Tuần sau', is_rikai_official: true },
    { character: '会', yomikata: 'あいます', onyomi: 'カイ', kunyomi: 'あ.う', han_viet: 'HỘI', meaning_vn: 'Gặp gỡ, công ty', stroke_count: 6, example_jp: '友だちに会います（あいます）。', example_vn: 'Gặp gỡ bạn bè.', is_rikai_official: true },
    { character: '休', yomikata: 'やすみます', onyomi: 'キュウ', kunyomi: 'やす.む', han_viet: 'HƯU', meaning_vn: 'Nghỉ ngơi', stroke_count: 6, example_jp: '休みます（やすみます）・夏休み', example_vn: 'Nghỉ ngơi / Nghỉ hè', is_rikai_official: true },
    { character: '京', yomikata: 'とうきょう', onyomi: 'キョウ・ケイ', kunyomi: '-', han_viet: 'KINH', meaning_vn: 'Kinh đô (Tokyo, Kyoto)', stroke_count: 8, example_jp: '東京（とうきょう）・京都（きょうと）', example_vn: 'Tokyo / Kyoto', is_rikai_official: true },
  ],
};

export const MARUGOTO_KANJI_SEED: Record<number, KanjiItem[]> =
  Object.fromEntries(
    Object.entries(RAW_KANJI_BY_LESSON).map(([lessonKey, items]) => {
      const lessonId = Number(lessonKey);
      const mapped: KanjiItem[] = items.map((item, idx) => ({
        id: lessonId * 1000 + idx + 1,
        lesson_id: lessonId,
        ...item,
      }));
      return [lessonId, mapped];
    })
  );
