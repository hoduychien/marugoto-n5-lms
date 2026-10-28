export interface TheorySectionPoint {
  title: string;
  explanation_vn: string;
  highlight_jp?: string;
}

export interface KeyExpressionItem {
  jp: string;
  furigana?: string;
  romaji: string;
  vn: string;
  usage_note: string;
}

export interface LessonOverview {
  id: number;
  lesson_id: number;
  summary_vn: string;
  can_do_objectives: string[];
  core_theory_points: TheorySectionPoint[];
  key_expressions: KeyExpressionItem[];
  cultural_notes: string[];
}

type RawLessonOverview = Omit<LessonOverview, 'id' | 'lesson_id'>;

const RAW_OVERVIEW_BY_LESSON: Record<number, RawLessonOverview> = {
  1: {
    summary_vn:
      'Làm quen với hệ thống chữ viết tiếng Nhật (Hiragana), các câu chào hỏi theo thời điểm trong ngày và cách giới thiệu tên, quốc tịch lịch sự trong lần đầu gặp mặt.',
    can_do_objectives: [
      'Chào hỏi phù hợp theo từng buổi trong ngày (Sáng, Trưa, Tối, Khi ra về, Khi đi ngủ).',
      'Tự giới thiệu tên và quốc tịch/ngôn ngữ của bản thân một cách lịch sự.',
      'Nhận diện và đọc chuẩn 46 chữ cái Hiragana cơ bản.',
    ],
    core_theory_points: [
      {
        title: '1. Hệ thống chữ viết tiếng Nhật (Hiragana, Katakana, Kanji)',
        explanation_vn:
          'Tiếng Nhật sử dụng kết hợp 3 loại chữ: Hiragana (chữ mềm dùng cho từ thuần Nhật và trợ từ ngữ pháp), Katakana (chữ cứng dùng cho tên nước ngoài và từ mượn), và Kanji (chữ Hán biểu ý). Ở Bài 1, trọng tâm là nắm vững bảng Hiragana.',
        highlight_jp: 'あ い う え お ・ か き く け こ',
      },
      {
        title: '2. Trợ từ chủ ngữ 「は」 (Đọc là "wa")',
        explanation_vn:
          'Khi đóng vai trò trợ từ đứng sau chủ ngữ trong câu 「N1 は N2 です」, chữ 「は」 (ha) luôn được phát âm là "wa". Từ 「です」 (desu) đặt ở cuối câu để biểu thị sự lịch sự.',
        highlight_jp: 'わたしは [Tên / Quốc tịch] です。',
      },
      {
        title: '3. Hậu tố xưng hô lịch sự 「～さん」',
        explanation_vn:
          'Gắn 「～さん」 (san) vào sau tên của người nghe hoặc người thứ ba (không phân biệt nam/nữ, tuổi tác) để thể hiện sự tôn trọng. Tuyệt đối KHÔNG gắn 「～さん」 vào sau tên của chính mình.',
        highlight_jp: '田中さん (Anh/Chị Tanaka) ≠ わたしは ナムです。',
      },
    ],
    key_expressions: [
      {
        jp: 'はじめまして。どうぞ よろしく おねがいします。',
        furigana: 'はじめまして。どうぞ よろしく おねがいします。',
        romaji: 'Hajimemashite. Doozo yoroshiku onegaishimasu.',
        vn: 'Rất hân hạnh được gặp bạn lần đầu. Mong nhận được sự giúp đỡ.',
        usage_note: 'Cặp câu mở đầu và kết thúc tiêu chuẩn khi mới làm quen.',
      },
      {
        jp: 'おはようございます / こんにちは / こんばんは',
        furigana: 'おはようございます / こんにちは / こんばんは',
        romaji: 'Ohayoo gozaimasu / Konnichiwa / Konbanwa',
        vn: 'Chào buổi sáng / Xin chào (ban ngày) / Chào buổi tối',
        usage_note: 'Chữ は trong こんにちは và こんばんは đọc là "wa".',
      },
      {
        jp: 'おやすみなさい / さようなら',
        furigana: 'おやすみなさい / さようなら',
        romaji: 'Oyasuminasai / Sayoonara',
        vn: 'Chúc ngủ ngon / Tạm biệt',
        usage_note: 'Dùng khi kết thúc ngày hoặc tạm biệt ra về.',
      },
    ],
    cultural_notes: [
      'Khi chào hỏi và nói câu 「どうぞ よろしく おねがいします」, người Nhật thường cúi đầu nhẹ (Ojigi - おじぎ) khoảng 15–30 độ để thể hiện sự chân thành.',
      'Trong giao tiếp công sở, câu 「お先に失礼します」 (Xin phép về trước) và 「お疲れ様でした」 (Cảm ơn vì đã vất vả) được dùng phổ biến hơn từ 「さようなら」.',
    ],
  },
  2: {
    summary_vn:
      'Làm chủ bảng chữ cứng Katakana và các mẫu câu giao tiếp thiết yếu trong lớp học tiếng Nhật (nhờ giáo viên nói lại, nói chậm hơn, hoặc hỏi nghĩa từ mới).',
    can_do_objectives: [
      'Hiểu các mệnh lệnh và hướng dẫn cơ bản của giáo viên trong lớp học.',
      'Nhờ người đối diện lặp lại hoặc nói chậm lại khi chưa nghe rõ.',
      'Hỏi cách nói một từ bằng tiếng Nhật hoặc hỏi ý nghĩa của từ chưa biết.',
    ],
    core_theory_points: [
      {
        title: '1. Đặc điểm của chữ cứng Katakana (カタカナ)',
        explanation_vn:
          'Katakana dùng để ghi âm từ vay mượn nước ngoài (Gairaigo), tên quốc gia, tên người nước ngoài. Lưu ý ký hiệu trường âm 「ー」 dùng để kéo dài nguyên âm đứng trước thêm 1 phách.',
        highlight_jp: 'ベトナム (Việt Nam) ・ コーヒー (Cà phê) ・ ノート (Vở)',
      },
      {
        title: '2. Mẫu câu yêu cầu lịch sự 「V-て ください」',
        explanation_vn:
          'Động từ chia sang thể て (Te-form) kết hợp với 「ください」 mang nghĩa "Xin vui lòng hãy làm V". Trong lớp học, bạn sẽ thường xuyên nghe các cụm như みて (nhìn), きいて (nghe), いって (nói).',
        highlight_jp: 'もういちど いって ください。 (Xin hãy nói lại lần nữa.)',
      },
      {
        title: '3. Cách hỏi từ vựng và ý nghĩa 「なんですか / どういういみですか」',
        explanation_vn:
          'Khi muốn biết một từ trong tiếng Nhật nói thế nào, dùng 「日本語で なんですか」. Khi nghe một từ tiếng Nhật nhưng không hiểu nghĩa, dùng 「"～"って どういう いみですか」.',
        highlight_jp: '「しゅくだい」って どういう いみですか。',
      },
    ],
    key_expressions: [
      {
        jp: 'すみません、もういちど おねがいします。',
        furigana: 'すみません、もういちど おねがいします。',
        romaji: 'Sumimasen, moo ichido onegaishimasu.',
        vn: 'Xin lỗi, làm ơn nhắc lại một lần nữa ạ.',
        usage_note: 'Rất hữu ích khi nghe không kịp trong hội thoại.',
      },
      {
        jp: 'もうすこし ゆっくり いって ください。',
        furigana: 'もうすこし ゆっくり いって ください。',
        romaji: 'Moo sukoshi yukkuri itte kudasai.',
        vn: 'Xin vui lòng nói chậm hơn một chút ạ.',
        usage_note: 'Dùng khi đối phương nói tiếng Nhật quá nhanh.',
      },
      {
        jp: 'わかりました / わかりません',
        furigana: 'わかりました / わかりません',
        romaji: 'Wakarimashita / Wakarimasen',
        vn: 'Tôi đã hiểu rồi / Tôi không hiểu.',
        usage_note: 'Phản hồi trực tiếp khi giáo viên hỏi 「いいですか」.',
      },
    ],
    cultural_notes: [
      'Từ 「すみません」 (Sumimasen) không chỉ có nghĩa là "Xin lỗi" mà còn dùng để gọi người khác ("Cho tôi hỏi...") hoặc cảm ơn khi ai đó làm giúp mình việc gì.',
    ],
  },
  3: {
    summary_vn:
      'Mở rộng kỹ năng tự giới thiệu bản thân: nói về nghề nghiệp, nơi xuất thân, ngôn ngữ có thể sử dụng và cách đặt câu hỏi xác nhận thông tin.',
    can_do_objectives: [
      'Giới thiệu nghề nghiệp hiện tại và đất nước/thành phố nơi mình đến.',
      'Nói được bản thân có thể nói được những ngôn ngữ nào.',
      'Hỏi nghề nghiệp, quốc tịch của người đối diện một cách lịch sự.',
    ],
    core_theory_points: [
      {
        title: '1. Câu danh từ khẳng định, phủ định và nghi vấn',
        explanation_vn:
          'Khẳng định: 「N1 は N2 です」 (N1 là N2). Phủ định trong hội thoại lịch sự: 「N1 は N2 じゃないです」 (N1 không phải là N2). Câu hỏi: thêm 「か」 vào cuối câu khẳng định.',
        highlight_jp: '学生です ／ 学生じゃないです ／ 学生ですか',
      },
      {
        title: '2. Trợ từ 「も」 (Cũng) và 「の」 (Sở hữu / Thuộc về)',
        explanation_vn:
          'Trợ từ 「も」 thay thế cho 「は」 khi thông tin tương đồng với câu trước ("Tôi cũng là..."). Trợ từ 「の」 nối 2 danh từ để chỉ sự trực thuộc (VD: công ty, trường học).',
        highlight_jp: 'わたしも ベトナム人です。 ・ ABCの 社員です。',
      },
      {
        title: '3. Nói về khả năng ngôn ngữ 「[Ngôn ngữ] が できます」',
        explanation_vn:
          'Để diễn tả biết nói hoặc sử dụng được ngôn ngữ nào, đặt tên ngôn ngữ (kèm hậu tố ～語) trước trợ từ 「が」 và động từ 「できます」. Có thể thêm 「すこし」 (một chút).',
        highlight_jp: '日本語が すこし できます。',
      },
    ],
    key_expressions: [
      {
        jp: 'ベトナムから きました。',
        furigana: 'ベトナムから きました。',
        romaji: 'Betonamu kara kimashita.',
        vn: 'Tôi đến từ Việt Nam.',
        usage_note: 'Trợ từ から chỉ điểm xuất phát / quê quán.',
      },
      {
        jp: 'おしごとは なんですか。',
        furigana: 'おしごとは なんですか。',
        romaji: 'Oshigoto wa nan desu ka.',
        vn: 'Công việc của bạn là gì?',
        usage_note: 'Tiền tố お đứng trước しごと thể hiện sự lịch sự.',
      },
      {
        jp: 'へえ、そうですか。',
        furigana: 'へえ、そうですか。',
        romaji: 'Hee, soo desu ka.',
        vn: 'Ồ, vậy à!',
        usage_note: 'Câu cảm thán thể hiện sự lắng nghe (Aizuchi) tự nhiên.',
      },
    ],
    cultural_notes: [
      'Ở Nhật Bản, trao đổi danh thiếp (Meishi - 名刺) bằng hai tay là nghi thức quan trọng trong buổi gặp đầu tiên của người đi làm.',
    ],
  },
  4: {
    summary_vn:
      'Học cách giới thiệu các thành viên trong gia đình, nói về số lượng người, tuổi tác và nơi sinh sống hiện tại.',
    can_do_objectives: [
      'Giới thiệu gia đình mình có mấy người và gồm những ai.',
      'Nói về nơi sinh sống và tuổi của các thành viên trong gia đình.',
      'Phân biệt cách gọi người thân của mình và gia đình người khác.',
    ],
    core_theory_points: [
      {
        title: '1. Cách gọi thành viên gia đình mình',
        explanation_vn:
          'Khi nói với người ngoài về gia đình mình, dùng từ khiêm nhường/trung tính: ちち (bố), はは (mẹ), あに (anh trai), あね (chị gái), おとうと (em trai), いもうと (em gái).',
        highlight_jp: 'ちち と はは と わたしです。',
      },
      {
        title: '2. Trợ từ nối danh từ 「と」 (Và) & Trợ từ nơi cư trú 「に」',
        explanation_vn:
          'Dùng 「N1 と N2」 để liệt kê đầy đủ các danh từ. Khi nói đang sống ở đâu, dùng địa điểm đi kèm trợ từ 「に」 và động từ tiếp diễn 「すんでいます」.',
        highlight_jp: 'ハノイに すんでいます。 (Đang sống ở Hà Nội.)',
      },
      {
        title: '3. Cách đếm tuổi 「～さい (歳)」 và số người 「～にん (人)」',
        explanation_vn:
          'Lưu ý các âm biến đổi đặc biệt khi nói tuổi: 1 tuổi (いっさい), 8 tuổi (はっさい), 10 tuổi (じゅっさい), 20 tuổi (はたち). Đếm người: 1 người (ひとり), 2 người (ふたり), từ 3 người dùng ～にん.',
        highlight_jp: '４人（よにん）家族です。 ・ ２０歳（はたち）です。',
      },
    ],
    key_expressions: [
      {
        jp: '家族は ４人です。',
        furigana: 'かぞくは よにんです。',
        romaji: 'Kazoku wa yonin desu.',
        vn: 'Gia đình tôi có 4 người.',
        usage_note: 'Lưu ý 4 người đọc là よにん (không đọc là しにん).',
      },
      {
        jp: 'おいくつですか / なんさいですか。',
        furigana: 'おいくつですか / なんさいですか。',
        romaji: 'Oikutsu desu ka / Nansai desu ka.',
        vn: 'Bạn bao nhiêu tuổi?',
        usage_note: '「おいくつですか」 là cách hỏi tuổi lịch sự hơn.',
      },
    ],
    cultural_notes: [
      'Khi khen người thân của đối phương (vợ/chồng/con), người Nhật thường dùng từ 「きれいですね」 (Đẹp nhỉ), 「かっこいいですね」 (Phong độ nhỉ) hoặc 「かわいいですね」 (Dễ thương nhỉ).',
    ],
  },
  5: {
    summary_vn:
      'Chủ đề Ẩm thực (Phần 1): Nói về các món ăn, đồ uống yêu thích, thói quen ăn sáng và cách dùng động từ nhóm ngoại động từ kèm trợ từ 「を」.',
    can_do_objectives: [
      'Nói được món ăn và đồ uống mà mình thích hoặc không thích.',
      'Mô tả bữa sáng hàng ngày thường ăn gì, uống gì.',
      'Đọc hiểu và viết các chữ Kanji cơ bản đầu tiên (水, 食, 飲, 魚, 肉...).',
    ],
    core_theory_points: [
      {
        title: '1. Diễn tả sở thích 「N が すきです」',
        explanation_vn:
          'Từ 「すき」 (thích) trong tiếng Nhật là Tính từ đuôi な (không phải động từ), do đó đối tượng được thích đi với trợ từ 「が」 chứ không dùng 「を」. Khi không thích lắm, dùng 「あまり すきじゃないです」.',
        highlight_jp: '魚が すきです。 ・ 生の 魚は あまり すきじゃないです。',
      },
      {
        title: '2. Trợ từ chỉ tân ngữ 「を」 (Đọc là "o")',
        explanation_vn:
          'Đặt 「を」 sau danh từ chỉ đồ ăn/thức uống và trước ngoại động từ 「たべます」 (ăn), 「のみます」 (uống). Khi không ăn gì cả, dùng 「なにも たべません」.',
        highlight_jp: 'パンを たべます。 ・ コーヒーを のみます。',
      },
      {
        title: '3. Trạng từ chỉ tần suất (いつも, よく, あまり)',
        explanation_vn:
          '「いつも」 (luôn luôn) và 「よく」 (thường xuyên) đi với động từ khẳng định (～ます). Ngược lại, 「あまり」 (không ~ lắm) luôn đi kèm với đuôi phủ định (～ません / ～じゃないです).',
        highlight_jp: '朝ごはんを あまり たべません。',
      },
    ],
    key_expressions: [
      {
        jp: 'すきな 食べ物は なんですか。',
        furigana: 'すきな たべものは なんですか。',
        romaji: 'Suki na tabemono wa nan desu ka.',
        vn: 'Món ăn yêu thích của bạn là gì?',
        usage_note: 'Khi đứng trước danh từ, すき giữ nguyên đuôi な (すきな N).',
      },
      {
        jp: '朝ごはんに なにを たべますか。',
        furigana: 'あさごはんに なにを たべますか。',
        romaji: 'Asagohan ni nani o tabemasu ka.',
        vn: 'Vào bữa sáng bạn ăn gì?',
        usage_note: 'Trợ từ に chỉ bữa ăn (朝ごはんに).',
      },
    ],
    cultural_notes: [
      'Bữa sáng truyền thống kiểu Nhật (Washoku - 和食) thường gồm cơm trắng (ご飯), súp tương Miso (みそしる), cá nướng (焼き魚) và rong biển.',
    ],
  },
  6: {
    summary_vn:
      'Chủ đề Ẩm thực (Phần 2): Đi ăn ngoài hàng quán, hỏi món ăn tại nhà hàng và gọi món kèm số lượng phần.',
    can_do_objectives: [
      'Rủ bạn bè cùng đi ăn trưa và thảo luận hôm nay muốn ăn món gì.',
      'Gọi món ăn và đồ uống kèm số lượng tại nhà hàng hoặc quán ăn nhanh.',
      'Hiểu các câu hỏi thường gặp của nhân viên phục vụ.',
    ],
    core_theory_points: [
      {
        title: '1. Trợ từ chỉ địa điểm diễn ra hành động 「で」',
        explanation_vn:
          'Khi hành động (ăn, uống, mua, làm việc...) diễn ra tại một địa điểm nào đó, ta đặt trợ từ 「で」 ngay sau danh từ chỉ địa điểm.',
        highlight_jp: '会社の 食堂で 昼ごはんを たべます。',
      },
      {
        title: '2. Mẫu câu gọi món lịch sự 「[Món ăn] を [Số lượng] ください」',
        explanation_vn:
          'Tại nhà hàng hoặc quầy thu ngân, nói tên món + trợ từ 「を」 + lượng từ đếm số cái (ひとつ, ふたつ, みっつ...) + 「ください」 (Cho tôi ~).',
        highlight_jp: 'チーズバーガーを ふたつ ください。',
      },
      {
        title: '3. Đếm số lượng đồ vật chung (ひとつ → とお)',
        explanation_vn:
          'Hệ thống đếm thuần Nhật dùng cho các món ăn, đồ vật nhỏ: 1 (ひとつ), 2 (ふたつ), 3 (みっつ), 4 (よっつ), 5 (いつつ), 6 (むっつ), 7 (ななつ), 8 (やっつ), 9 (ここのつ), 10 (とお). Hỏi bao nhiêu cái: 「いくつ」.',
        highlight_jp: 'ひとつ ・ ふたつ ・ みっつ ・ よっつ',
      },
    ],
    key_expressions: [
      {
        jp: 'いらっしゃいませ。 ご注文は？',
        furigana: 'いらっしゃいませ。 ごちゅうもんは？',
        romaji: 'Irasshaimase. Gochuumon wa?',
        vn: 'Xin kính chào quý khách. Quý khách gọi món gì ạ?',
        usage_note: 'Câu mở đầu của nhân viên quán ăn.',
      },
      {
        jp: 'いただきます / ごちそうさまでした',
        furigana: 'いただきます / ごちそうさまでした',
        romaji: 'Itadakimasu / Gochisoosama deshita',
        vn: 'Xin mời dùng bữa (trước khi ăn) / Cảm ơn vì bữa ăn ngon (sau khi ăn).',
        usage_note: 'Nghi thức văn hóa bắt buộc trước và sau bữa ăn tại Nhật.',
      },
    ],
    cultural_notes: [
      'Ở nhiều quán mì Ramen hoặc quán cơm bò (Gyudon) tại Nhật, khách hàng mua vé món ăn tại máy bán tự động (Kenbaiki - 券売機) ở cửa ra vào trước khi ngồi vào bàn.',
    ],
  },
  7: {
    summary_vn:
      'Chủ đề Ngôi nhà (Phần 1): Mô tả nơi ở, các phòng trong nhà, đồ nội thất và sử dụng cấu trúc tồn tại 「あります / います」.',
    can_do_objectives: [
      'Nói được mình đang sống trong loại nhà nào và ngôi nhà rộng hay hẹp.',
      'Liệt kê các phòng và đồ đạc có trong ngôi nhà của mình.',
      'Phân biệt chính xác động từ tồn tại 「あります」 (đồ vật) và 「います」 (người/động vật).',
    ],
    core_theory_points: [
      {
        title: '1. Cấu trúc chỉ sự tồn tại 「[Địa điểm] に [Vật/Người] が あります / います」',
        explanation_vn:
          'Dùng 「あります」 cho đồ vật, cây cối, phòng ốc (vật vô tri). Dùng 「います」 cho con người và động vật (sinh vật có sự sống). Phủ định tương ứng là 「ありません」 và 「いません」.',
        highlight_jp: '部屋に ベッドが あります。 ・ 家に 猫が います。',
      },
      {
        title: '2. Tính từ đuôi い và Tính từ đuôi な (Mô tả nhà cửa)',
        explanation_vn:
          'Tính từ đuôi い: ひろい (rộng), せまい (hẹp), あたらしい (mới), ふるい (cũ), あかるい (sáng). Tính từ đuôi な: しずか(な) (yên tĩnh), きれい(な) (đẹp/sạch sẽ), べんり(な) (tiện lợi).',
        highlight_jp: 'わたしの 部屋は せまいです。でも、きれいです。',
      },
      {
        title: '3. Liên từ nối câu 「そして」 (Và) & 「でも」 (Nhưng)',
        explanation_vn:
          'Dùng 「そして」 để nối 2 ý cùng chiều (tích cực + tích cực). Dùng 「でも」 ở đầu câu thứ hai để nối 2 ý trái ngược nhau (VD: Tuy nhỏ nhưng rất sạch đẹp).',
        highlight_jp: 'この 家は ふるいです。でも、ひろいです。',
      },
    ],
    key_expressions: [
      {
        jp: 'わたしの 家に 部屋が みっつ あります。',
        furigana: 'わたしの いえに へやが みっつ あります。',
        romaji: 'Watashi no ie ni heya ga mittsu arimasu.',
        vn: 'Nhà tôi có 3 căn phòng.',
        usage_note: 'Lượng từ (みっつ) đứng sau trợ từ が và ngay trước động từ.',
      },
      {
        jp: 'エアコンは ありません。',
        furigana: 'エアコンは ありません。',
        romaji: 'Eakon wa arimasen.',
        vn: 'Không có máy điều hòa.',
        usage_note: 'Trong câu phủ định tồn tại, trợ từ が thường đổi thành は.',
      },
    ],
    cultural_notes: [
      'Căn hộ ở Nhật thường ký hiệu theo cấu trúc như 1K, 2DK, 3LDK (L = Living room / Phòng khách, D = Dining / Phòng ăn, K = Kitchen / Bếp, kèm số lượng phòng ngủ).',
    ],
  },
  8: {
    summary_vn:
      'Chủ đề Ngôi nhà (Phần 2): Chỉ dẫn vị trí của đồ vật trong phòng và đón tiếp khách đến thăm nhà.',
    can_do_objectives: [
      'Hỏi và chỉ rõ vị trí của đồ vật (trên, dưới, trong, cạnh...).',
      'Mời bạn bè vào nhà, mời ngồi và mời đồ uống khi khách đến chơi.',
      'Đọc và viết các chữ Kanji chỉ phương hướng (上, 下, 中, 外...).',
    ],
    core_theory_points: [
      {
        title: '1. Danh từ chỉ vị trí 「N1 の [Vị trí] に」',
        explanation_vn:
          'Ghép danh từ mốc + trợ từ 「の」 + từ chỉ vị trí: うえ (trên), した (dưới), なか (trong), そと (ngoài), まえ (trước), うしろ (sau), よこ/となり (bên cạnh), ちかく (gần).',
        highlight_jp: '机の 上に メガネが あります。',
      },
      {
        title: '2. Hỏi vị trí đồ vật 「N は どこに ありますか」',
        explanation_vn:
          'Khi tìm kiếm một vật đã xác định, đưa vật đó lên làm chủ đề với trợ từ 「は」, sau đó hỏi bằng 「どこに ありますか」 (hoặc ngắn gọn là 「どこですか」).',
        highlight_jp: 'リモコンは どこに ありますか。 ― テレビの 横です。',
      },
      {
        title: '3. Đại từ chỉ vị trí 「ここ ・ そこ ・ あそこ」',
        explanation_vn:
          '「ここ」 (chỗ này - gần người nói), 「そこ」 (chỗ đó - gần người nghe), 「あそこ」 (chỗ kia - xa cả hai người).',
        highlight_jp: 'トイレは あそこです。',
      },
    ],
    key_expressions: [
      {
        jp: 'ごめんください / いらっしゃい。どうぞ あがって ください。',
        furigana: 'ごめんください / いらっしゃい。どうぞ あがって ください。',
        romaji: 'Gomen kudasai / Irasshai. Doozo agatte kudasai.',
        vn: 'Có ai ở nhà không ạ? / Chào mừng bạn đến. Xin mời bước lên nhà.',
        usage_note: '「あがる」 nghĩa là cởi giày ở Genkan và bước lên sàn nhà.',
      },
      {
        jp: 'おじゃまします。',
        furigana: 'おじゃまします。',
        romaji: 'Ojama shimasu.',
        vn: 'Xin phép làm phiền ạ (Nói khi bước vào nhà người khác).',
        usage_note: 'Câu lễ절 bắt buộc khi bước qua cửa nhà người Nhật.',
      },
    ],
    cultural_notes: [
      'Khi vào nhà người Nhật, bạn luôn phải cởi giày tại khu vực tiền sảnh (Genkan - 玄関), quay mũi giày ra phía cửa rồi mới bước lên sàn nhà và đi dép trong nhà (スリッパ).',
    ],
  },
  9: {
    summary_vn:
      'Chủ đề Nhịp sống hàng ngày (Phần 1): Nói về giờ giấc và trình bày thời gian biểu sinh hoạt từ sáng đến tối.',
    can_do_objectives: [
      'Đọc và hỏi giờ giấc chính xác bằng tiếng Nhật (Giờ & Phút).',
      'Kể lại lịch trình sinh hoạt hàng ngày (mấy giờ thức dậy, đi làm, đi ngủ).',
      'Nhận diện các chữ Kanji chỉ thời gian (時, 分, 半, 何, 朝, 昼, 夜).',
    ],
    core_theory_points: [
      {
        title: '1. Cách nói Giờ (～時 - ji) và Phút (～分 - fun/pun)',
        explanation_vn:
          'Lưu ý các giờ đọc đặc biệt: 4 giờ (よじ), 7 giờ (しちじ), 9 giờ (くじ). Rưỡi (30 phút) dùng 「はん (半)」. Phút biến âm: 1, 3, 4, 6, 8, 10 phút đọc là ～ぷん (いっぷん, さんぷん, よんぷん, ろっぷん, はっぷん, じゅっぷん).',
        highlight_jp: 'いま 午前 ８時３０分（はちじはん）です。',
      },
      {
        title: '2. Trợ từ chỉ thời điểm xác định 「に」',
        explanation_vn:
          'Đặt trợ từ 「に」 sau danh từ chỉ thời gian có con số cụ thể (giờ, ngày tháng) để chỉ thời điểm thực hiện hành động. Các từ không có số như 毎日 (hàng ngày), 朝 (buổi sáng) thì không bắt buộc dùng 「に」.',
        highlight_jp: 'わたしは 毎朝 ６時に おきます。',
      },
      {
        title: '3. So sánh thời gian với 「ごろ」 (Khoảng ~)',
        explanation_vn:
          'Khi thời gian không cố định chính xác từng phút, gắn 「ごろ」 sau danh từ chỉ giờ (VD: 11時ごろ - khoảng 11 giờ). Khi đã có 「ごろ」, không cần thêm trợ từ 「に」 nữa.',
        highlight_jp: '夜 １１時ごろ ねます。',
      },
    ],
    key_expressions: [
      {
        jp: 'いま 何時ですか。',
        furigana: 'いま なんじですか。',
        romaji: 'Ima nanji desu ka.',
        vn: 'Bây giờ là mấy giờ?',
        usage_note: 'Dùng 午前 (AM - sáng) và 午後 (PM - chiều) trước giờ.',
      },
      {
        jp: '毎日、何時に おきますか。',
        furigana: 'まいにち、なんじに おきますか。',
        romaji: 'Mainichi, nanji ni okimasu ka.',
        vn: 'Hàng ngày bạn thức dậy lúc mấy giờ?',
        usage_note: 'Khi hỏi "lúc mấy giờ", bắt buộc có trợ từ に sau 何時.',
      },
    ],
    cultural_notes: [
      'Người Nhật cực kỳ coi trọng sự đúng giờ (Jikan genshu - 時間厳守). Trong công việc và tàu điện, mọi người thường có mặt trước giờ hẹn từ 5 đến 10 phút.',
    ],
  },
  10: {
    summary_vn:
      'Chủ đề Nhịp sống hàng ngày (Phần 2): Nói về các thứ trong tuần, khoảng thời gian làm việc và sắp xếp lịch hẹn cùng đồng nghiệp/bạn bè.',
    can_do_objectives: [
      'Nói và đọc thành thạo 7 thứ trong tuần (月曜日 → 日曜日).',
      'Diễn tả khoảng thời gian bắt đầu và kết thúc (Từ ~ Đến ~).',
      'Thương lượng và chốt lịch hẹn gặp mặt hoặc ăn tối cùng bạn bè.',
    ],
    core_theory_points: [
      {
        title: '1. Hệ thống 7 Thứ trong tuần (～曜日 - yoobi)',
        explanation_vn:
          'Các thứ gắn liền với ngũ hành và mặt trăng/mặt trời: 月曜日 (Thứ 2), 火曜日 (Thứ 3), 水曜日 (Thứ 4), 木曜日 (Thứ 5), 金曜日 (Thứ 6), 土曜日 (Thứ 7), 日曜日 (Chủ nhật). Hỏi thứ mấy: 「何曜日（なんようび）」.',
        highlight_jp: 'やすみは 土曜日と 日曜日です。',
      },
      {
        title: '2. Cấu trúc chỉ khoảng thời gian 「N1 から N2 まで」 (Từ N1 đến N2)',
        explanation_vn:
          '「から」 chỉ mốc bắt đầu (từ lúc / từ nơi) và 「まで」 chỉ mốc kết thúc (đến lúc / đến nơi). Có thể dùng kết hợp hoặc tách riêng từng từ.',
        highlight_jp: '仕事は ９時から ５時までです。',
      },
      {
        title: '3. Hỏi lịch trống 「[Thời gian] は どうですか / いいですか」',
        explanation_vn:
          'Khi đề xuất một ngày hoặc giờ hẹn với người khác, dùng 「[Thứ/Giờ] は どうですか」 (Thứ ~ thì sao?) hoặc 「[Thứ/Giờ] は いいですか」 (Thứ ~ có được không?).',
        highlight_jp: '金曜日の 夜は どうですか。 ― いいですね！',
      },
    ],
    key_expressions: [
      {
        jp: 'きょうは 何曜日ですか。',
        furigana: 'きょうは なんようびですか。',
        romaji: 'Kyoo wa nan-yoobi desu ka.',
        vn: 'Hôm nay là thứ mấy?',
        usage_note: 'Kết hợp với あした (ngày mai), あさって (ngày kia).',
      },
      {
        jp: 'すみません、金曜日は ちょっと…',
        furigana: 'すみません、きんようびは ちょっと…',
        romaji: 'Sumimasen, kinyoobi wa chotto...',
        vn: 'Xin lỗi, thứ Sáu thì hơi bất tiện một chút...',
        usage_note: 'Cách từ chối khéo léo chuẩn văn hóa Nhật.',
      },
    ],
    cultural_notes: [
      'Khi muốn từ chối lời mời vì bận, người Nhật hiếm khi nói thẳng "Không được" (だめです) mà thường bỏ lửng câu bằng từ 「ちょっと…」 (Hơi kẹt một chút...) để giữ hòa khí.',
    ],
  },
  11: {
    summary_vn:
      'Chủ đề Sở thích & Ngày nghỉ (Phần 1): Trò chuyện về các hoạt động giải trí, thể thao, âm nhạc và khả năng cá nhân.',
    can_do_objectives: [
      'Nói về sở thích cá nhân và những việc thường làm vào ngày nghỉ.',
      'Diễn tả những kỹ năng bản thân biết làm (nấu ăn, chơi đàn, thể thao).',
      'Hỏi thăm sở thích của bạn bè để tìm điểm chung trong giao tiếp.',
    ],
    core_theory_points: [
      {
        title: '1. Phân biệt trợ từ 「を」 (Làm hành động) và 「が」 (Sở thích / Năng lực)',
        explanation_vn:
          'Khi nói làm một hoạt động: dùng 「N を します」 (VD: スポーツを します). Nhưng khi đi với từ chỉ sở thích 「すきです」 hoặc khả năng 「できます」, bắt buộc dùng trợ từ 「が」.',
        highlight_jp: 'ギターを ひきます。 ／ ギターが できます。',
      },
      {
        title: '2. Câu hỏi cụ thể hóa thể loại 「どんな N」 (Loại N như thế nào?)',
        explanation_vn:
          'Đặt 「どんな」 trước danh từ để hỏi sâu hơn về thể loại nhạc, môn thể thao, bộ phim hay loại sách mà đối phương yêu thích.',
        highlight_jp: 'どんな 音楽が すきですか。 ― J-POPが すきです。',
      },
      {
        title: '3. Liệt kê hoạt động mẫu với trợ từ 「や」',
        explanation_vn:
          'Khác với 「と」 (liệt kê toàn bộ), trợ từ 「N1 や N2」 dùng để liệt kê tiêu biểu một vài ví dụ đại diện ("Làm những việc như N1, N2...").',
        highlight_jp: 'やすみの 日に 掃除や 洗濯を します。',
      },
    ],
    key_expressions: [
      {
        jp: '趣味は なんですか。',
        furigana: 'しゅみは なんですか。',
        romaji: 'Shumi wa nan desu ka.',
        vn: 'Sở thích của bạn là gì?',
        usage_note: 'Câu hỏi mở đầu rất phổ biến khi trò chuyện xã giao.',
      },
      {
        jp: 'やすみの 日に なにを しますか。',
        furigana: 'やすみの ひに なにを しますか。',
        romaji: 'Yasumi no hi ni nani o shimasu ka.',
        vn: 'Vào ngày nghỉ bạn thường làm gì?',
        usage_note: 'Có thể trả lời kèm trạng từ よく (thường xuyên) hoặc ときどき (thỉnh thoảng).',
      },
    ],
    cultural_notes: [
      'Khi được khen giỏi một kỹ năng nào đó (「じょうずですね！」), người Nhật thường khiêm tốn đáp lại là 「いいえ、まだまだです」 (Không đâu, tôi vẫn còn kém lắm).',
    ],
  },
  12: {
    summary_vn:
      'Chủ đề Sở thích & Ngày nghỉ (Phần 2): Đọc hiểu thông tin sự kiện (triển lãm, hòa nhạc, thi đấu), nói ngày tháng và rủ bạn bè đi cùng.',
    can_do_objectives: [
      'Nói và đọc chính xác các Tháng trong năm (1月 → 12月) và Ngày trong tháng.',
      'Hiểu thông tin trên áp phích sự kiện (thời gian, địa điểm, giá vé).',
      'Rủ bạn bè cùng đi xem phim, xem bóng đá hoặc lễ hội bằng mẫu 「V-ませんか」.',
    ],
    core_theory_points: [
      {
        title: '1. Cách đọc Tháng (～月 - gatsu) và Ngày (～日 - nichi/ka)',
        explanation_vn:
          'Tháng lưu ý: 4月 (しがつ), 7月 (しちがつ), 9月 (くがつ). Ngày mùng 1 đến mùng 10 dùng âm thuần Nhật đặc biệt: 1日 (ついたち), 2日 (ふつか), 3日 (みっか), 4日 (よっか), 5日 (いつか), 6日 (むいか), 7日 (なのか), 8日 (ようか), 9日 (ここのか), 10日 (とおか), 20日 (はつか).',
        highlight_jp: '誕生日は ４月２０日（しがつはつか）です。',
      },
      {
        title: '2. Mẫu câu rủ rê lịch sự 「いっしょに V-ませんか」',
        explanation_vn:
          'Đổi đuôi 「～ます」 sang 「～ませんか」 để tạo câu mời/rủ rê lịch sự ("Cùng làm V với tôi không?"). Nếu đồng ý và hưởng ứng ngay, trả lời bằng 「いいですね。V-ましょう！」.',
        highlight_jp: '土曜日に いっしょに 映画を みませんか。 ― いいですね。いきましょう！',
      },
      {
        title: '3. Hỏi thời gian tổng quát với 「いつ」 (Khi nào / Bao giờ)',
        explanation_vn:
          'Khác với 「何時」 (mấy giờ), từ để hỏi 「いつ」 dùng cho mọi mốc thời gian (ngày, tháng, mùa) và KHÔNG đi kèm trợ từ 「に」 ở phía sau.',
        highlight_jp: 'コンサートは いつですか。 ― 来週の 日曜日です。',
      },
    ],
    key_expressions: [
      {
        jp: 'こんどの 日曜日、いっしょに いきませんか。',
        furigana: 'こんどの にちようび、いっしょに いきませんか。',
        romaji: 'Kondo no nichiyoobi, issho ni ikimasen ka.',
        vn: 'Chủ nhật tới này, bạn có đi cùng tôi không?',
        usage_note: '「こんどの～」 nghĩa là kỳ/lần sắp tới.',
      },
      {
        jp: 'いいですね。 いきましょう！',
        furigana: 'いいですね。 いきましょう！',
        romaji: 'Ii desu ne. Ikimashoo!',
        vn: 'Hay quá nhỉ. Chúng mình cùng đi thôi!',
        usage_note: '「～ましょう」 dùng khi đồng ý lời rủ hoặc chủ động đề xuất.',
      },
    ],
    cultural_notes: [
      'Nhật Bản có 4 mùa rõ rệt với các sự kiện đặc trưng: Mùa xuân ngắm hoa anh đào (お花見), mùa hè xem pháo hoa (花火大会), mùa thu ngắm lá đỏ (紅葉) và mùa đông trượt tuyết.',
    ],
  },
  13: {
    summary_vn:
      'Chủ đề Giao thông & Đi lại trong thành phố (Phần 1): Hỏi phương tiện di chuyển, cách đi từ điểm A đến điểm B và giao tiếp khi đi tàu/taxi.',
    can_do_objectives: [
      'Nói được phương tiện di chuyển (tàu điện, xe buýt, taxi, đi bộ) đến một địa điểm.',
      'Hỏi người bản xứ tại nhà ga xem chuyến tàu nào đi đến nơi mình cần.',
      'Nêu địa điểm muốn đến cho tài xế taxi và thanh toán tiền cước.',
    ],
    core_theory_points: [
      {
        title: '1. Trợ từ chỉ phương tiện di chuyển 「で」',
        explanation_vn:
          'Đặt trợ từ 「で」 sau danh từ chỉ phương tiện giao thông (電車, バス, タクシー, 自転車) kết hợp với động từ di chuyển (いきます, きます, かえります). Riêng "đi bộ" dùng cụm cố định 「あるいて」 (không có で).',
        highlight_jp: '電車で 会社へ いきます。 ／ 駅まで あるいて いきます。',
      },
      {
        title: '2. Trợ từ chỉ hướng di chuyển 「へ」 (Đọc là "e") và đích đến 「に」',
        explanation_vn:
          'Đứng trước các động từ chỉ sự di chuyển (いきます - đi, きます - đến, かえります - về), trợ từ 「へ」 luôn được đọc là "e" để chỉ phương hướng/đích đến.',
        highlight_jp: '空港へ いきます。 ・ 家へ かえります。',
      },
      {
        title: '3. Hỏi phương tiện và cách đi 「どうやって いきますか」',
        explanation_vn:
          'Dùng 「どうやって」 (bằng cách nào) hoặc 「なんで」 (bằng phương tiện gì) để hỏi cách di chuyển đến một địa điểm.',
        highlight_jp: '東京駅まで どうやって いきますか。',
      },
    ],
    key_expressions: [
      {
        jp: 'この 電車は 新宿へ いきますか。',
        furigana: 'この でんしゃは しんじゅくへ いきますか。',
        romaji: 'Kono densha wa Shinjuku e ikimasu ka.',
        vn: 'Chuyến tàu điện này có đi Shinjuku không ạ?',
        usage_note: 'Câu hỏi cực kỳ quan trọng khi đứng trên sân ga (ホーム) tại Nhật.',
      },
      {
        jp: 'さくらホテルまで おねがいします。',
        furigana: 'さくらホテルまで おねがいします。',
        romaji: 'Sakura Hoteru made onegaishimasu.',
        vn: 'Làm ơn cho tôi đến khách sạn Sakura ạ.',
        usage_note: 'Nói với tài xế ngay khi lên xe Taxi.',
      },
    ],
    cultural_notes: [
      'Cửa sau của xe Taxi ở Nhật Bản được tài xế điều khiển đóng/mở hoàn toàn tự động; hành khách không nên tự dùng tay kéo cửa xe.',
    ],
  },
  14: {
    summary_vn:
      'Chủ đề Giao thông & Đi lại trong thành phố (Phần 2): Mô tả đặc điểm khu phố, hỏi đường và chỉ dẫn lộ trình đến các tòa nhà công cộng.',
    can_do_objectives: [
      'Mô tả các địa điểm, tòa nhà nổi bật trong thành phố bằng tính từ nối.',
      'Hỏi đường đến nhà ga, ngân hàng, bưu điện hoặc cửa hàng tiện lợi.',
      'Hiểu các chỉ dẫn phương hướng cơ bản (đi thẳng, rẽ phải, rẽ trái, ở góc đường).',
    ],
    core_theory_points: [
      {
        title: '1. Cách nối 2 Tính từ trong cùng một câu (Thể て của tính từ)',
        explanation_vn:
          'Để nối 2 tính từ cùng chiều: Tính từ đuôi い bỏ 「い」 thêm 「～くて」 (VD: おおきい → おおきくて). Tính từ đuôi な và Danh từ thêm 「～で」 (VD: きれい → きれいで / にぎやか → にぎやかで).',
        highlight_jp: 'この 町は きれいで、にぎやかです。 ・ あの お寺は ふるくて、有名です。',
      },
      {
        title: '2. Trợ từ chỉ không gian di chuyển xuyên qua 「を」',
        explanation_vn:
          'Với các động từ như まがります (rẽ), わたります (băng qua), あるきます (đi bộ dọc theo), nơi chốn đi kèm trợ từ 「を」.',
        highlight_jp: 'あの 信号を 右へ まがって ください。',
      },
      {
        title: '3. Chỉ điểm mốc bằng số thứ tự 「～つめの 角 / 信号」',
        explanation_vn:
          'Gắn 「～め」 sau lượng từ đếm (ひとつめ - thứ nhất, ふたつめ - thứ hai) để chỉ ngã rẽ hoặc cột đèn giao thông thứ mấy.',
        highlight_jp: 'ふたつめの 角を 左へ まがります。',
      },
    ],
    key_expressions: [
      {
        jp: 'すみません、駅は どこですか。',
        furigana: 'すみません、えきは どこですか。',
        romaji: 'Sumimasen, eki wa doko desu ka.',
        vn: 'Xin lỗi, nhà ga ở đâu vậy ạ?',
        usage_note: 'Có thể hỏi lịch sự hơn bằng 「～は どちらですか」.',
      },
      {
        jp: 'まっすぐ いって ください。',
        furigana: 'まっすぐ いって ください。',
        romaji: 'Massugu itte kudasai.',
        vn: 'Xin hãy đi thẳng.',
        usage_note: 'Kết hợp với 右 (phải) và 左 (trái).',
      },
    ],
    cultural_notes: [
      'Tại mỗi nhà ga ở Nhật đều có đồn cảnh sát khu vực nhỏ gọi là Koban (交番). Nếu bị lạc đường hoặc thất lạc đồ đạc, bạn có thể hỏi cảnh sát tại Koban bất cứ lúc nào.',
    ],
  },
  15: {
    summary_vn:
      'Chủ đề Mua sắm (Phần 1): Nói về món đồ mình đang muốn mua, tìm kiếm nơi bán và hỏi giá tiền tại cửa hàng.',
    can_do_objectives: [
      'Diễn tả mong muốn sở hữu một món đồ hoặc quà lưu niệm bằng 「N が ほしいです」.',
      'Sử dụng đúng các đại từ chỉ định (これ, それ, あれ / この, その, あの) khi chọn hàng.',
      'Đọc và hỏi giá tiền hàng hóa từ hàng trăm đến hàng vạn Yên.',
    ],
    core_theory_points: [
      {
        title: '1. Cấu trúc nói về món đồ muốn có 「N が ほしいです」',
        explanation_vn:
          '「ほしい」 là tính từ đuôi い mang nghĩa "muốn có (một vật)". Danh từ chỉ món đồ mong muốn đứng trước trợ từ 「が」. Khi hỏi người nghe muốn gì: 「なにが ほしいですか」.',
        highlight_jp: '新しい カメラが ほしいです。',
      },
      {
        title: '2. Phân biệt 「これ・それ・あれ」 và 「この・その・あの + Danh từ」',
        explanation_vn:
          '「これ / それ / あれ」 đứng độc lập một mình như danh từ (Cái này / Cái đó / Cái kia). Trong khi đó, 「この / その / あの」 bắt buộc phải có một Danh từ đi ngay phía sau (VD: この かばん - Chiếc túi này).',
        highlight_jp: 'これは いくらですか。 ／ この 時計は いくらですか。',
      },
      {
        title: '3. Cách đọc số tiền lớn (Trăm - 百, Nghìn - 千, Vạn - 万)',
        explanation_vn:
          'Lưu ý các âm biến đổi đặc biệt: 300 (さんびゃく), 600 (ろっぴゃく), 800 (はっぴゃく); 3.000 (さんぜん), 8.000 (はっせん). Đơn vị 10.000 đọc là 「いちまん (一万)」 (không đọc là じゅうせん).',
        highlight_jp: '３,８００円（さんぜん はっぴゃくえん）です。',
      },
    ],
    key_expressions: [
      {
        jp: 'すみません、これは いくらですか。',
        furigana: 'すみません、これは いくらですか。',
        romaji: 'Sumimasen, kore wa ikura desu ka.',
        vn: 'Xin lỗi, cái này giá bao nhiêu tiền ạ?',
        usage_note: '「いくら」 là từ để hỏi giá tiền.',
      },
      {
        jp: 'これを ください。',
        furigana: 'これを ください。',
        romaji: 'Kore o kudasai.',
        vn: 'Làm ơn bán cho tôi cái này.',
        usage_note: 'Câu chốt mua hàng thông dụng nhất.',
      },
    ],
    cultural_notes: [
      'Tại các cửa hàng Nhật Bản, giá niêm yết thường ghi rõ giá chưa thuế (税抜) và giá đã bao gồm 10% thuế tiêu dùng (税込 - Zeikomi).',
    ],
  },
  16: {
    summary_vn:
      'Chủ đề Mua sắm (Phần 2): Mua quần áo, phụ kiện thời trang, hỏi màu sắc, kích cỡ (Size) và xin mặc thử đồ.',
    can_do_objectives: [
      'Nhận xét về trang phục, màu sắc và mức giá tại cửa hàng thời trang.',
      'Hỏi nhân viên xem có màu khác hoặc kích cỡ khác (S, M, L) hay không.',
      'Xin phép nhân viên cho xem món đồ hoặc mặc thử quần áo.',
    ],
    core_theory_points: [
      {
        title: '1. Nhóm động từ Mặc / Đeo theo vị trí trên cơ thể',
        explanation_vn:
          'Tiếng Nhật phân biệt rõ động từ mặc theo bộ phận cơ thể: 「きます」 (mặc áo/khoác từ vai trở lên), 「はきます」 (mặc quần/váy, đi giày/tất từ thắt lưng trở xuống), 「かぶります」 (đội mũ), 「かけます」 (đeo kính), 「します」 (thắt cà vạt, đeo đồng hồ).',
        highlight_jp: 'シャツを きます。 ・ 靴を はきます。',
      },
      {
        title: '2. Mẫu câu xin phép làm thử 「V-ても いいですか」',
        explanation_vn:
          'Động từ chia sang thể て + 「も いいですか」 dùng để xin phép người khác một cách lịch sự ("Tôi làm V có được không?"). Trong cửa hàng quần áo, hay dùng với みます (xem) và きます (mặc thử).',
        highlight_jp: 'これを きても いいですか。 (Tôi mặc thử cái này có được không?)',
      },
      {
        title: '3. Diễn tả hơi quá mức với 「ちょっと + Tính từ」',
        explanation_vn:
          'Đặt 「ちょっと」 trước tính từ để giảm nhẹ nhận xét khi món đồ chưa vừa ý (VD: ちょっと ちいさいです - hơi chật một chút; ちょっと たかいです - hơi đắt một chút).',
        highlight_jp: 'これは ちょっと おおきいです。 Mサイズは ありますか。',
      },
    ],
    key_expressions: [
      {
        jp: 'すみません、これを みせて ください。',
        furigana: 'すみません、これを みせて ください。',
        romaji: 'Sumimasen, kore o misete kudasai.',
        vn: 'Xin lỗi, làm ơn cho tôi xem cái này ạ.',
        usage_note: 'Dùng khi món đồ đặt trong tủ kính hoặc trên kệ cao.',
      },
      {
        jp: 'ほかの 色は ありますか。',
        furigana: 'ほかの いろは ありますか。',
        romaji: 'Hoka no iro wa arimasu ka.',
        vn: 'Có màu khác không ạ?',
        usage_note: 'Có thể thay 色 bằng サイズ (kích cỡ).',
      },
    ],
    cultural_notes: [
      'Khi vào phòng thử đồ (Shichakushitsu - 試着室) ở Nhật, khách hàng luôn phải tháo giày đứng lên tấm thảm trải sẵn và dùng túi trùm mặt (Face cover) nếu có trang điểm.',
    ],
  },
  17: {
    summary_vn:
      'Chủ đề Kỳ nghỉ & Du lịch (Phần 1): Kể lại những hoạt động đã làm vào cuối tuần hoặc kỳ nghỉ vừa qua bằng thì quá khứ.',
    can_do_objectives: [
      'Chia chính xác Động từ, Tính từ và Danh từ ở thì quá khứ.',
      'Kể lại cho bạn bè nghe kỳ nghỉ vừa rồi đã đi đâu, làm gì và cảm nhận ra sao.',
      'Nêu mong muốn làm một hành động trong tương lai bằng 「V-たいです」.',
    ],
    core_theory_points: [
      {
        title: '1. Thì quá khứ của Động từ 「～ました / ～ませんでした」',
        explanation_vn:
          'Để kể về hành động đã hoàn tất trong quá khứ: Khẳng định đổi 「～ます」 thành 「～ました」. Phủ định quá khứ đổi 「～ません」 thành 「～ませんでした」.',
        highlight_jp: 'きのう 映画を みました。 ・ どこへも いきませんでした。',
      },
      {
        title: '2. Thì quá khứ của Tính từ đuôi い và Tính từ đuôi な / Danh từ',
        explanation_vn:
          'Tính từ đuôi い: Bỏ 「い」 + 「～かったです」 (Phủ định: 「～くなかったです」). Tính từ đuôi な và Danh từ: Đổi 「です」 thành 「でした」 (Phủ định: 「じゃなかったです」). Lưu ý: いい (tốt) → よかったです.',
        highlight_jp: 'おいしかったです！ ・ とても にぎやかでした。',
      },
      {
        title: '3. Mong muốn thực hiện hành động 「V (bỏ ます) + たいです」',
        explanation_vn:
          'Bỏ đuôi 「ます」 của động từ và gắn 「～たいです」 để nói "Tôi muốn làm V" (VD: いきたいです - muốn đi, たべたいです - muốn ăn).',
        highlight_jp: '来年も また 日本へ いきたいです。',
      },
    ],
    key_expressions: [
      {
        jp: '週末は どうでしたか。',
        furigana: 'しゅうまつは どうでしたか。',
        romaji: 'Shuumatsu wa doo deshita ka.',
        vn: 'Cuối tuần vừa rồi của bạn thế nào?',
        usage_note: '「どうでしたか」 dùng để hỏi cảm nhận về việc đã qua.',
      },
      {
        jp: 'とても たのしかったです。',
        furigana: 'とても たのしかったです。',
        romaji: 'Totemo tanoshikatta desu.',
        vn: 'Đã rất vui.',
        usage_note: 'たのしい bỏ い thêm かったです.',
      },
    ],
    cultural_notes: [
      'Vào sáng thứ Hai đầu tuần, câu chuyện mở đầu phổ biến nhất nơi công sở Nhật Bản là hỏi thăm về kỳ nghỉ cuối tuần vừa qua của nhau.',
    ],
  },
  18: {
    summary_vn:
      'Chủ đề Kỳ nghỉ & Du lịch (Phần 2): Tường thuật một chuyến đi du lịch theo trình tự thời gian và chia sẻ kế hoạch cho kỳ nghỉ sắp tới.',
    can_do_objectives: [
      'Kể lại chuỗi hành động trong chuyến du lịch bằng các từ nối trình tự (それから, そして).',
      'Nói về người đồng hành cùng mình trong chuyến đi bằng trợ từ 「と」.',
      'Tổng kết trọn vẹn kiến thức giao tiếp trình độ Sơ cấp 1 (Marugoto A1 / JLPT N5).',
    ],
    core_theory_points: [
      {
        title: '1. Kể chuỗi sự kiện theo trình tự với 「それから」 (Sau đó)',
        explanation_vn:
          'Khi tường thuật một chuyến đi gồm nhiều hoạt động nối tiếp nhau, đặt 「それから」 ở đầu câu tiếp theo để mang nghĩa "Sau đó thì..." hoặc "Ngoài ra...".',
        highlight_jp: '京都で お寺を みました。それから、お土産を かいました。',
      },
      {
        title: '2. Trợ từ chỉ người cùng thực hiện hành động 「[Người] と」',
        explanation_vn:
          'Đặt trợ từ 「と」 sau danh từ chỉ người (家族, 友だち, 恋人) để nói đi cùng với ai. Nếu đi một mình, dùng cụm cố định 「ひとりで」 (không dùng と).',
        highlight_jp: '家族と 東京へ いきました。 ／ ひとりで 旅行を しました。',
      },
      {
        title: '3. Tổng kết hệ thống Trợ từ cốt lõi trình độ A1 (N5)',
        explanation_vn:
          'Ôn tập 8 trợ từ quan trọng nhất đã học từ Bài 1 đến Bài 18: は (chủ đề), が (sở thích/năng lực/tồn tại), を (tân ngữ), に (thời điểm/nơi tồn tại/đích đến), で (nơi hành động/phương tiện), へ (hướng di chuyển), と (cùng với/và), の (sở hữu).',
        highlight_jp: 'は ・ が ・ を ・ に ・ で ・ へ ・ と ・ の',
      },
    ],
    key_expressions: [
      {
        jp: '誰と いきましたか。 ― 友だちと いきました。',
        furigana: 'だれと いきましたか。 ― ともだちと いきました。',
        romaji: 'Dare to ikimashita ka. — Tomodachi to ikimashita.',
        vn: 'Bạn đã đi cùng với ai? — Tôi đã đi cùng bạn bè.',
        usage_note: '「だれと」 dùng để hỏi làm việc gì đó cùng với ai.',
      },
      {
        jp: 'いい ところですね。わたしも いきたいです。',
        furigana: 'いい ところですね。わたしも いきたいです。',
        romaji: 'Ii tokoro desu ne. Watashi mo ikitai desu.',
        vn: 'Nơi đó tuyệt quá nhỉ. Tôi cũng muốn đi.',
        usage_note: 'Câu phản hồi tự nhiên khi xem ảnh du lịch của bạn bè.',
      },
    ],
    cultural_notes: [
      'Khi đi du lịch về, người Nhật có văn hóa mua quà đặc sản địa phương (Omiyage - お土産, thường là bánh kẹo đóng gói từng chiếc nhỏ) để tặng đồng nghiệp và bạn bè.',
    ],
  },
};

export const MARUGOTO_OVERVIEW_SEED: Record<number, LessonOverview> =
  Object.fromEntries(
    Object.entries(RAW_OVERVIEW_BY_LESSON).map(([lessonKey, item]) => {
      const lessonId = Number(lessonKey);
      return [
        lessonId,
        {
          id: lessonId,
          lesson_id: lessonId,
          ...item,
        },
      ];
    })
  );
