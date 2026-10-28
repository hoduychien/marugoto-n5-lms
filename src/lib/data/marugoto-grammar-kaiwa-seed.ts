export interface GrammarExample {
  jp: string;
  romaji: string;
  vn: string;
}

export interface GrammarPoint {
  id: number;
  lesson_id: number;
  pattern: string;
  meaning_vn: string;
  explanation_vn: string;
  examples: GrammarExample[];
}

export interface KaiwaLine {
  speaker: string;
  kanji: string;
  furigana?: string;
  romaji: string;
  meaning_vn: string;
}

export interface KaiwaDialogue {
  id: number;
  lesson_id: number;
  title: string;
  situation_vn: string;
  lines: KaiwaLine[];
}

type RawGrammarPoint = Omit<GrammarPoint, 'id' | 'lesson_id'>;
type RawKaiwaDialogue = Omit<KaiwaDialogue, 'id' | 'lesson_id'>;

/**
 * Ngữ pháp chuẩn giáo trình Marugoto A1 cho toàn bộ 18 bài học
 */
const RAW_GRAMMAR_BY_LESSON: Record<number, RawGrammarPoint[]> = {
  1: [
    {
      pattern: 'N1 は N2 です',
      meaning_vn: 'N1 là N2 (Câu khẳng định danh từ)',
      explanation_vn:
        'Trợ từ 「は」(đọc là wa) đứng sau chủ ngữ N1. 「です」đứng cuối câu thể hiện sự lịch sự.',
      examples: [
        {
          jp: 'わたしは 学生です。',
          romaji: 'Watashi wa gakusee desu.',
          vn: 'Tôi là sinh viên.',
        },
        {
          jp: '佐藤さんは 先生です。',
          romaji: 'Satoo-san wa sensee desu.',
          vn: 'Anh/Chị Sato là giáo viên.',
        },
      ],
    },
    {
      pattern: 'これは N ですか',
      meaning_vn: 'Đây là N phải không?',
      explanation_vn:
        'Thêm trợ từ nghi vấn 「か」vào cuối câu để tạo câu hỏi trong tiếng Nhật.',
      examples: [
        {
          jp: 'これは 日本語の 本ですか。',
          romaji: 'Kore wa nihongo no hon desu ka.',
          vn: 'Đây là sách tiếng Nhật phải không?',
        },
        {
          jp: 'はい、そうです。',
          romaji: 'Hai, soo desu.',
          vn: 'Vâng, đúng vậy.',
        },
      ],
    },
  ],
  2: [
    {
      pattern: 'V-て ください',
      meaning_vn: 'Hãy làm V ~ (Câu yêu cầu lịch sự trong lớp học)',
      explanation_vn:
        'Dùng để nhờ hoặc hướng dẫn người nghe thực hiện hành động (nghe, nhìn, đọc, nói lại...).',
      examples: [
        {
          jp: 'もういちど いって ください。',
          romaji: 'Moo ichido itte kudasai.',
          vn: 'Vui lòng nói lại một lần nữa.',
        },
        {
          jp: '教科書を みて ください。',
          romaji: 'Kyookasho o mite kudasai.',
          vn: 'Hãy nhìn vào sách giáo khoa.',
        },
      ],
    },
    {
      pattern: '「～」って どういう いみですか',
      meaning_vn: '"~" có nghĩa là gì?',
      explanation_vn:
        'Mẫu câu rất thông dụng khi bạn muốn hỏi nghĩa của một từ hoặc câu tiếng Nhật chưa biết.',
      examples: [
        {
          jp: '「しゅくだい」って どういう いみですか。',
          romaji: '"Shukudai" tte doo yuu imi desu ka.',
          vn: '"Shukudai" có nghĩa là gì ạ?',
        },
      ],
    },
  ],
  3: [
    {
      pattern: 'N1 は N2 じゃないです',
      meaning_vn: 'N1 không phải là N2 (Phủ định danh từ)',
      explanation_vn:
        'Dạng phủ định lịch sự trong hội thoại hàng ngày của 「です」là 「じゃないです」(hoặc 「ではありません」).',
      examples: [
        {
          jp: 'わたしは 会社員じゃないです。学生です。',
          romaji: 'Watashi wa kaishain janai desu. Gakusee desu.',
          vn: 'Tôi không phải là nhân viên công ty. Tôi là sinh viên.',
        },
      ],
    },
    {
      pattern: 'N1 も N2 です',
      meaning_vn: 'N1 cũng là N2',
      explanation_vn:
        'Trợ từ 「も」thay thế cho 「は」khi muốn diễn đạt ý tương đồng "cũng".',
      examples: [
        {
          jp: 'わたしも ベトナム人です。',
          romaji: 'Watashi mo Betonamu-jin desu.',
          vn: 'Tôi cũng là người Việt Nam.',
        },
      ],
    },
  ],
  4: [
    {
      pattern: 'N（Place）に すんで います',
      meaning_vn: 'Đang sống ở N',
      explanation_vn:
        'Trợ từ 「に」chỉ địa điểm cư trú đi với động từ 「すんでいます」(đang sinh sống).',
      examples: [
        {
          jp: '父は ハノイに すんで います。',
          romaji: 'Chichi wa Hanoi ni sunde imasu.',
          vn: 'Bố tôi đang sống ở Hà Nội.',
        },
        {
          jp: '兄は 東京に すんで います。',
          romaji: 'Ani wa Tookyoo ni sunde imasu.',
          vn: 'Anh trai tôi đang sống ở Tokyo.',
        },
      ],
    },
    {
      pattern: 'N（Ngôn ngữ）が できます',
      meaning_vn: 'Có thể nói / biết tiếng N',
      explanation_vn:
        'Dùng trợ từ 「が」trước 「できます」để diễn tả năng lực ngoại ngữ hoặc kỹ năng.',
      examples: [
        {
          jp: 'わたしは 日本語と 英語が できます。',
          romaji: 'Watashi wa nihongo to eego ga dekimasu.',
          vn: 'Tôi biết tiếng Nhật và tiếng Anh.',
        },
      ],
    },
  ],
  5: [
    {
      pattern: 'N を たべます／のみます',
      meaning_vn: 'Ăn / Uống N',
      explanation_vn:
        'Trợ từ 「を」(đọc là o) đánh dấu tân ngữ trực tiếp của hành động ăn hoặc uống.',
      examples: [
        {
          jp: 'まいあさ パンを たべます。',
          romaji: 'Maiasa pan o tabemasu.',
          vn: 'Mỗi sáng tôi ăn bánh mì.',
        },
        {
          jp: 'あさ コーヒーを のみます。',
          romaji: 'Asa koohii o nomimasu.',
          vn: 'Buổi sáng tôi uống cà phê.',
        },
      ],
    },
    {
      pattern: 'N を たべません／のみません',
      meaning_vn: 'Không ăn / Không uống N',
      explanation_vn:
        'Đổi đuôi 「～ます」thành 「～ません」để tạo câu phủ định ở hiện tại/tương lai.',
      examples: [
        {
          jp: 'あさごはんを たべません。',
          romaji: 'Asa-gohan o tabemasen.',
          vn: 'Tôi không ăn bữa sáng.',
        },
      ],
    },
  ],
  6: [
    {
      pattern: 'N が すきです',
      meaning_vn: 'Thích N',
      explanation_vn:
        'Với tính từ đuôi NA chỉ sở thích như 「すき」(thích) và 「きらい」(ghét), đối tượng được đánh dấu bằng trợ từ 「が」.',
      examples: [
        {
          jp: 'わたしは おすしが すきです。',
          romaji: 'Watashi wa osushi ga suki desu.',
          vn: 'Tôi thích món Sushi.',
        },
        {
          jp: 'どんな りょうりが すきですか。',
          romaji: 'Donna ryoori ga suki desu ka.',
          vn: 'Bạn thích món ăn như thế nào?',
        },
      ],
    },
    {
      pattern: 'N を ください',
      meaning_vn: 'Cho tôi gọi món N',
      explanation_vn:
        'Dùng khi gọi đồ ăn, thức uống tại nhà hàng hoặc quán cà phê.',
      examples: [
        {
          jp: 'すみません、カレーと みずを ください。',
          romaji: 'Sumimasen, karee to mizu o kudasai.',
          vn: 'Xin lỗi, cho tôi một phần cà ri và nước lọc.',
        },
      ],
    },
  ],
  7: [
    {
      pattern: 'N1 に N2 が あります／います',
      meaning_vn: 'Ở N1 có N2',
      explanation_vn:
        'Dùng 「あります」cho đồ vật, cây cối (không cử động) và 「います」cho người, động vật.',
      examples: [
        {
          jp: 'へやに テレビと エアコンが あります。',
          romaji: 'Heya ni terebi to eakon ga arimasu.',
          vn: 'Trong phòng có tivi và máy điều hòa.',
        },
        {
          jp: 'にわに いぬが います。',
          romaji: 'Niwa ni inu ga imasu.',
          vn: 'Ngoài sân vườn có chú chó.',
        },
      ],
    },
  ],
  8: [
    {
      pattern: 'N1 の うえ／した／なかに N2 が あります',
      meaning_vn: 'Ở trên / dưới / trong N1 có N2',
      explanation_vn:
        'Dùng các danh từ chỉ vị trí (うえ: trên, した: dưới, なか: trong, ちかく: gần) để miêu tả nơi để đồ vật.',
      examples: [
        {
          jp: 'つくえの うえに 本が あります。',
          romaji: 'Tsukue no ue ni hon ga arimasu.',
          vn: 'Trên bàn có quyển sách.',
        },
        {
          jp: 'いえの ちかくに 公園が あります。',
          romaji: 'Ie no chikaku ni kooen ga arimasu.',
          vn: 'Gần nhà có công viên.',
        },
      ],
    },
  ],
  9: [
    {
      pattern: '～じ（～ふん）に V-ます',
      meaning_vn: 'Làm V vào lúc ~ giờ (~ phút)',
      explanation_vn:
        'Trợ từ 「に」đặt sau mốc thời gian cụ thể có con số (giờ, phút, ngày tháng) để chỉ thời điểm hành động diễn ra.',
      examples: [
        {
          jp: 'まいあさ 6時半に おきます。',
          romaji: 'Maiasa roku-ji han ni okimasu.',
          vn: 'Mỗi sáng tôi thức dậy lúc 6 giờ rưỡi.',
        },
        {
          jp: 'よる 11時に ねます。',
          romaji: 'Yoru juu-ichi-ji ni nemasu.',
          vn: 'Buổi tối tôi ngủ lúc 11 giờ.',
        },
      ],
    },
  ],
  10: [
    {
      pattern: 'いつ／何よう日に V-ますか',
      meaning_vn: 'Khi nào / Vào thứ mấy bạn làm V?',
      explanation_vn:
        'Dùng 「いつ」(khi nào) hoặc 「何よう日に」(vào thứ mấy) để hỏi lịch trình, kế hoạch.',
      examples: [
        {
          jp: '日よう日に ともだちと テニスを します。',
          romaji: 'Nichiyoobi ni tomodachi to tenisu o shimasu.',
          vn: 'Vào Chủ nhật tôi chơi Tennis cùng bạn.',
        },
      ],
    },
  ],
  11: [
    {
      pattern: 'やすみのひに V-ます',
      meaning_vn: 'Vào ngày nghỉ tôi làm V (Kể về sở thích)',
      explanation_vn:
        'Kết hợp các trạng từ chỉ tần suất như 「よく」(thường xuyên), 「ときどき」(thỉnh thoảng), 「あまり～ません」(không ~ lắm).',
      examples: [
        {
          jp: 'よく えいがを みます。',
          romaji: 'Yoku eega o mimasu.',
          vn: 'Tôi thường xuyên xem phim.',
        },
        {
          jp: 'あまり スポーツを しません。',
          romaji: 'Amari supootsu o shimasen.',
          vn: 'Tôi không chơi thể thao nhiều lắm.',
        },
      ],
    },
  ],
  12: [
    {
      pattern: 'いっしょに V-ませんか',
      meaning_vn: 'Cùng làm V với tôi nhé? (Lời rủ lịch sự)',
      explanation_vn:
        'Dùng 「V-ませんか」để mời/rủ ai đó cùng tham gia một hoạt động hoặc sự kiện.',
      examples: [
        {
          jp: '土よう日に いっしょに はなびを みませんか。',
          romaji: 'Doyoobi ni issho ni hanabi o mimasen ka.',
          vn: 'Thứ Bảy này cùng đi ngắm pháo hoa nhé?',
        },
        {
          jp: 'いいですね。いきましょう。',
          romaji: 'Ii desu ne. Ikimashoo.',
          vn: 'Hay quá. Chúng mình cùng đi nhé.',
        },
      ],
    },
  ],
  13: [
    {
      pattern: 'N（Phương tiện）で Place へ いきます',
      meaning_vn: 'Đi đến Place bằng phương tiện N',
      explanation_vn:
        'Trợ từ 「で」đứng sau phương tiện giao thông (でんしゃ, バス, タクシー...). Riêng đi bộ dùng 「あるいて」không có 「で」.',
      examples: [
        {
          jp: 'まいにち 電車で 会社へ いきます。',
          romaji: 'Mainichi densha de kaisha e ikimasu.',
          vn: 'Mỗi ngày tôi đi đến công ty bằng tàu điện.',
        },
        {
          jp: '駅まで あるいて いきます。',
          romaji: 'Eki made aruite ikimasu.',
          vn: 'Tôi đi bộ đến nhà ga.',
        },
      ],
    },
  ],
  14: [
    {
      pattern: 'A1-くて A2 です ／ N1 で N2 です',
      meaning_vn: 'Vừa A1 vừa A2 (Nối 2 tính từ miêu tả địa điểm)',
      explanation_vn:
        'Tính từ đuôi I đổi 「～い」thành 「～くて」; Tính từ đuôi NA thêm 「～で」để nối 2 vế cùng chiều.',
      examples: [
        {
          jp: 'この 町は しずかで きれいです。',
          romaji: 'Kono machi wa shizuka de kiree desu.',
          vn: 'Thị trấn này vừa yên tĩnh vừa đẹp.',
        },
        {
          jp: 'あたらしくて 大きい ビルです。',
          romaji: 'Atarashikute ookii biru desu.',
          vn: 'Là tòa nhà vừa mới vừa to lớn.',
        },
      ],
    },
  ],
  15: [
    {
      pattern: 'N が ほしいです',
      meaning_vn: 'Tôi muốn có N',
      explanation_vn:
        'Dùng 「N が ほしいです」để bày tỏ mong muốn sở hữu một món đồ hoặc quà tặng.',
      examples: [
        {
          jp: 'あたらしい カメラが ほしいです。',
          romaji: 'Atarashii kamera ga hoshii desu.',
          vn: 'Tôi muốn có một chiếc máy ảnh mới.',
        },
      ],
    },
    {
      pattern: 'Person に N を あげます／もらいます',
      meaning_vn: 'Tặng N cho Person / Nhận N từ Person',
      explanation_vn:
        'Trợ từ 「に」đánh dấu người nhận (với あげます) hoặc người tặng (với もらいます).',
      examples: [
        {
          jp: '母に はなを あげました。',
          romaji: 'Haha ni hana o agemashita.',
          vn: 'Tôi đã tặng hoa cho mẹ.',
        },
      ],
    },
  ],
  16: [
    {
      pattern: 'これ／それ／あれは いくらですか',
      meaning_vn: 'Cái này / đó / kia giá bao nhiêu tiền?',
      explanation_vn:
        '「これ」(cái này - gần người nói), 「それ」(cái đó - gần người nghe), 「あれ」(cái kia - xa cả hai).',
      examples: [
        {
          jp: 'すみません、この シャツは いくらですか。',
          romaji: 'Sumimasen, kono shatsu wa ikura desu ka.',
          vn: 'Xin lỗi, chiếc áo sơ mi này giá bao nhiêu tiền ạ?',
        },
        {
          jp: '二千五百円です。',
          romaji: 'Ni-sen go-hyaku en desu.',
          vn: 'Giá 2,500 Yên ạ.',
        },
      ],
    },
  ],
  17: [
    {
      pattern: 'A-かったです ／ NA-でした（Quá khứ của tính từ）',
      meaning_vn: 'Đã rất A (Bày tỏ cảm xúc về sự việc đã qua)',
      explanation_vn:
        'Tính từ đuôi I đổi 「～い」thành 「～かったです」. Tính từ đuôi NA đổi 「です」thành 「でした」.',
      examples: [
        {
          jp: 'きのうの パーティーは とても たのしかったです。',
          romaji: 'Kinoo no paathii wa totemo tanoshikatta desu.',
          vn: 'Bữa tiệc hôm qua đã rất vui.',
        },
        {
          jp: 'りょうりは おいしかったです。',
          romaji: 'Ryoori wa oishikatta desu.',
          vn: 'Món ăn đã rất ngon.',
        },
      ],
    },
  ],
  18: [
    {
      pattern: 'V-ました ／ V-ませんでした（Quá khứ của động từ）',
      meaning_vn: 'Đã làm V / Đã không làm V (Kể về chuyến du lịch)',
      explanation_vn:
        'Dùng để kể lại chuỗi hoạt động trong kỳ nghỉ hoặc chuyến du lịch đã qua, nối câu bằng 「それから」(sau đó).',
      examples: [
        {
          jp: '先月、東京へ いきました。それから、富士山を みました。',
          romaji:
            'Sengetsu, Tookyoo e ikimashita. Sorekara, Fujisan o mimashita.',
          vn: 'Tháng trước tôi đã đi Tokyo. Sau đó tôi đã ngắm núi Phú Sĩ.',
        },
      ],
    },
  ],
};

/**
 * Hội thoại Kaiwa chuẩn giáo trình Marugoto A1 cho toàn bộ 18 bài học
 */
const RAW_KAIWA_BY_LESSON: Record<number, RawKaiwaDialogue> = {
  1: {
    title: 'Chào hỏi trong lớp học tiếng Nhật',
    situation_vn:
      'Buổi học đầu tiên tại lớp tiếng Nhật, học viên Nam chào hỏi cô giáo Sato và các bạn cùng lớp.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: '先生、おはようございます。',
        furigana: 'せんせい、おはようございます。',
        romaji: 'Sensee, ohayoo gozaimasu.',
        meaning_vn: 'Em chào buổi sáng cô giáo ạ.',
      },
      {
        speaker: '佐藤先生 (Cô Sato)',
        kanji: 'おはようございます、ナムさん。',
        furigana: 'おはようございます、ナムさん。',
        romaji: 'Ohayoo gozaimasu, Namu-san.',
        meaning_vn: 'Chào buổi sáng em Nam.',
      },
      {
        speaker: '佐藤先生 (Cô Sato)',
        kanji: 'みなさん、こんにちは。授業をはじめます。',
        furigana: 'みなさん、こんにちは。じゅぎょうをはじめます。',
        romaji: 'Minasan, konnichiwa. Jugyoo o hajimemasu.',
        meaning_vn: 'Chào cả lớp. Chúng ta bắt đầu giờ học nhé.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'よろしくお願いします。',
        furigana: 'よろしくおねがいします。',
        romaji: 'Yoroshiku onegaishimasu.',
        meaning_vn: 'Mong cô và các bạn giúp đỡ ạ.',
      },
    ],
  },
  2: {
    title: 'Hỏi nghĩa từ mới trong giờ học',
    situation_vn:
      'Trong giờ học, Nam chưa nghe rõ câu nói của cô giáo và hỏi lại nghĩa tiếng Nhật.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: 'すみません、もういちど 言ってください。',
        furigana: 'すみません、もういちど いってください。',
        romaji: 'Sumimasen, moo ichido itte kudasai.',
        meaning_vn: 'Xin lỗi cô, vui lòng nói lại một lần nữa ạ.',
      },
      {
        speaker: '佐藤先生 (Cô Sato)',
        kanji: '10ページを 見てください。',
        furigana: '10ページを みてください。',
        romaji: 'Jup-peeji o mite kudasai.',
        meaning_vn: 'Các em hãy nhìn vào trang số 10.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '先生、「しゅくだい」って どういう意味ですか。',
        furigana: 'せんせい、「しゅくだい」って どういういみですか。',
        romaji: 'Sensee, "shukudai" tte doo yuu imi desu ka.',
        meaning_vn: 'Thưa cô, "shukudai" có nghĩa là gì ạ?',
      },
      {
        speaker: '佐藤先生 (Cô Sato)',
        kanji: '「Homework」です。わかりましたか。',
        furigana: '「Homework」です。わかりましたか。',
        romaji: '"Homework" desu. Wakarimashita ka.',
        meaning_vn: 'Là "Bài tập về nhà". Em đã hiểu chưa?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'はい、わかりました。ありがとうございます。',
        furigana: 'はい、わかりました。ありがとうございます。',
        romaji: 'Hai, wakarimashita. Arigatoo gozaimasu.',
        meaning_vn: 'Vâng, em hiểu rồi ạ. Em cảm ơn cô.',
      },
    ],
  },
  3: {
    title: 'Tự giới thiệu bản thân (Jikoshoukai)',
    situation_vn:
      'Nam và Tanaka làm quen, giới thiệu tên, quốc tịch và công việc của mình.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: 'はじめまして。わたしは グエン・ナムです。',
        furigana: 'はじめまして。わたしは グエン・ナムです。',
        romaji: 'Hajimemashite. Watashi wa Guen Namu desu.',
        meaning_vn: 'Rất vui được gặp bạn. Tôi là Nguyễn Nam.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'ナムと よんでください。ベトナム人です。',
        furigana: 'ナムと よんでください。ベトナムじんです。',
        romaji: 'Namu to yonde kudasai. Betonamu-jin desu.',
        meaning_vn: 'Hãy gọi tôi là Nam. Tôi là người Việt Nam.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'はじめまして、田中です。おしごとは なんですか。',
        furigana: 'はじめまして、たなかです。おしごとは なんですか。',
        romaji: 'Hajimemashite, Tanaka desu. Oshigoto wa nan desu ka.',
        meaning_vn: 'Chào bạn, tôi là Tanaka. Công việc của bạn là gì?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'わたしは エンジニアです。どうぞ よろしく。',
        furigana: 'わたしは エンジニアです。どうぞ よろしく。',
        romaji: 'Watashi wa enjinia desu. Doozo yoroshiku.',
        meaning_vn: 'Tôi là kỹ sư. Rất mong được giúp đỡ.',
      },
    ],
  },
  4: {
    title: 'Giới thiệu về gia đình qua tấm ảnh',
    situation_vn:
      'Nam cho Tanaka xem bức ảnh gia đình của mình đang sống tại Việt Nam.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'これは ナムさんの 家族ですか。',
        furigana: 'これは ナムさんの かぞくですか。',
        romaji: 'Kore wa Namu-san no kazoku desu ka.',
        meaning_vn: 'Đây là gia đình của bạn Nam phải không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'はい、父と 母と 妹です。4人家族です。',
        furigana: 'はい、ちちと ははと いもうとです。よにんかぞくです。',
        romaji: 'Hai, chichi to haha to imooto desu. Yo-nin kazoku desu.',
        meaning_vn: 'Vâng, đây là bố, mẹ và em gái tôi. Gia đình tôi có 4 người.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '妹さんは 何さいですか。',
        furigana: 'いもうとさんは なんさいですか。',
        romaji: 'Imooto-san wa nan-sai desu ka.',
        meaning_vn: 'Em gái bạn bao nhiêu tuổi vậy?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '18さいです。大学生です。日本語が できます。',
        furigana: '18さいです。だいがくせいです。にほんごが できます。',
        romaji: 'Juu-hachi-sai desu. Daigakusee desu. Nihongo ga dekimasu.',
        meaning_vn: '18 tuổi. Em ấy là sinh viên đại học và biết tiếng Nhật.',
      },
    ],
  },
  5: {
    title: 'Thói quen ăn sáng hàng ngày',
    situation_vn:
      'Tanaka và Nam trò chuyện về món ăn và đồ uống thường dùng vào bữa sáng.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさんは まいあさ 朝ご飯を 食べますか。',
        furigana: 'ナムさんは まいあさ あさごはんを たべますか。',
        romaji: 'Namu-san wa maiasa asa-gohan o tabemasu ka.',
        meaning_vn: 'Bạn Nam mỗi sáng có ăn sáng không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'はい、パンと 卵を 食べます。',
        furigana: 'はい、パンと たまごを たべます。',
        romaji: 'Hai, pan to tamago o tabemasu.',
        meaning_vn: 'Có, tôi ăn bánh mì và trứng.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'なにを 飲みますか。',
        furigana: 'なにを のみますか。',
        romaji: 'Nani o nomimasu ka.',
        meaning_vn: 'Bạn uống gì?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'コーヒーと 水を 飲みます。',
        furigana: 'コーヒーと みずを のみます。',
        romaji: 'Koohii to mizu o nomimasu.',
        meaning_vn: 'Tôi uống cà phê và nước lọc.',
      },
    ],
  },
  6: {
    title: 'Gọi món ăn trưa tại nhà hàng',
    situation_vn:
      'Nam và Tanaka vào quán ăn Nhật Bản vào giờ nghỉ trưa và gọi món với nhân viên.',
    lines: [
      {
        speaker: '店員 (Nhân viên)',
        kanji: 'いらっしゃいませ。メニューを どうぞ。',
        furigana: 'いらっしゃいませ。メニューを どうぞ。',
        romaji: 'Irasshaimase. Menyuu o doozo.',
        meaning_vn: 'Xin kính chào quý khách. Xin mời xem thực đơn ạ.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさんは なにが 好きですか。',
        furigana: 'ナムさんは なにが すきですか。',
        romaji: 'Namu-san wa nani ga suki desu ka.',
        meaning_vn: 'Nam thích món gì?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'わたしは うどんが 好きです。すみません、うどんを ください。',
        furigana: 'わたしは うどんが すきです。すみません、うどんを ください。',
        romaji: 'Watashi wa udon ga suki desu. Sumimasen, udon o kudasai.',
        meaning_vn: 'Tôi thích mì Udon. Xin lỗi, cho tôi một phần mì Udon ạ.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'わたしは カレーと 冷たいお茶を ください。',
        furigana: 'わたしは カレーと つめたいおちゃを ください。',
        romaji: 'Watashi wa karee to tsumetai ocha o kudasai.',
        meaning_vn: 'Cho tôi một phần cà ri và trà lạnh.',
      },
    ],
  },
  7: {
    title: 'Giới thiệu căn hộ đang ở',
    situation_vn:
      'Nam kể cho Tanaka nghe về căn hộ và các đồ nội thất trong phòng của mình.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさんの 家は アパートですか。',
        furigana: 'ナムさんの いえは アパートですか。',
        romaji: 'Namu-san no ie wa apaato desu ka.',
        meaning_vn: 'Nhà của Nam là căn hộ chung cư phải không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'はい、アパートです。部屋が ふたつ あります。',
        furigana: 'はい、アパートです。へやが ふたつ あります。',
        romaji: 'Hai, apaato desu. Heya ga futatsu arimasu.',
        meaning_vn: 'Vâng, là căn hộ. Có 2 phòng.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '部屋に なにが ありますか。',
        furigana: 'へやに なにが ありますか。',
        romaji: 'Heya ni nani ga arimasu ka.',
        meaning_vn: 'Trong phòng có những gì?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'ベッドと テーブルと エアコンが あります。',
        furigana: 'ベッドと テーブルと エアコンが あります。',
        romaji: 'Beddo to teeburu to eakon ga arimasu.',
        meaning_vn: 'Có giường ngủ, bàn và máy điều hòa.',
      },
    ],
  },
  8: {
    title: 'Mời bạn đến chơi nhà mới',
    situation_vn:
      'Tanaka đến thăm căn phòng mới sáng sủa của Nam ở gần công viên.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: '新しくて 明るい 部屋ですね。',
        furigana: 'あたらしくて あかるい へやですね。',
        romaji: 'Atarashikute akarui heya desu ne.',
        meaning_vn: 'Căn phòng vừa mới vừa sáng sủa quá nhỉ.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'ありがとうございます。家の 近くに 大きい公園が あります。',
        furigana: 'ありがとうございます。いえの ちかくに おおきいこうえんが あります。',
        romaji: 'Arigatoo gozaimasu. Ie no chikaku ni ookii kooen ga arimasu.',
        meaning_vn: 'Cảm ơn bạn. Ở gần nhà có một công viên lớn.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '本棚の 上の 人形は かわいいですね。',
        furigana: 'ほんだなの うえの にんぎょうは かわいいですね。',
        romaji: 'Hon-dana no ue no ningyoo wa kawaii desu ne.',
        meaning_vn: 'Con búp bê trên giá sách dễ thương quá.',
      },
    ],
  },
  9: {
    title: 'Nhịp sinh hoạt hàng ngày',
    situation_vn:
      'Nam và Tanaka chia sẻ về giờ thức dậy, đi làm và đi ngủ mỗi ngày.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさんは まいあさ 何時に 起きますか。',
        furigana: 'ナムさんは まいあさ なんじに おきますか。',
        romaji: 'Namu-san wa maiasa nan-ji ni okimasu ka.',
        meaning_vn: 'Mỗi sáng Nam thức dậy lúc mấy giờ?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '6時半に 起きます。それから、公園を 散歩します。',
        furigana: 'ろくじはんに おきます。それから、こうえんを さんぽします。',
        romaji: 'Roku-ji han ni okimasu. Sorekara, kooen o sanpo shimasu.',
        meaning_vn: 'Tôi dậy lúc 6 giờ rưỡi. Sau đó tôi đi dạo ở công viên.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '夜は 何時に 寝ますか。',
        furigana: 'よるは なんじに ねますか。',
        romaji: 'Yoru wa nan-ji ni nemasu ka.',
        meaning_vn: 'Buổi tối bạn đi ngủ lúc mấy giờ?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '11時ごろ 寝ます。',
        furigana: 'じゅういちじごろ ねます。',
        romaji: 'Juu-ichi-ji goro nemasu.',
        meaning_vn: 'Tôi ngủ vào khoảng 11 giờ.',
      },
    ],
  },
  10: {
    title: 'Kế hoạch cuối tuần này',
    situation_vn:
      'Hỏi thăm lịch trình rảnh rỗi vào thứ Bảy và Chủ nhật tuần này.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: '今週の 日よう日は 暇ですか。',
        furigana: 'こんしゅうの にちようびは ひまですか。',
        romaji: 'Konshuu no nichiyoobi wa hima desu ka.',
        meaning_vn: 'Chủ nhật tuần này bạn có rảnh không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '日よう日は 友だちの 誕生日パーティーが あります。',
        furigana: 'にちようびは ともだちの たんじょうびパーティーが あります。',
        romaji: 'Nichiyoobi wa tomodachi no tanjoobi paathii ga arimasu.',
        meaning_vn: 'Chủ nhật này có tiệc sinh nhật của bạn tôi.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '土よう日は どうですか。',
        furigana: 'どようびは どうですか。',
        romaji: 'Doyoobi wa doo desu ka.',
        meaning_vn: 'Thế còn thứ Bảy thì sao?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '土よう日は 大丈夫です。美術館へ 行きましょう。',
        furigana: 'どようびは だいじょうぶです。びじゅつかんへ いきましょう。',
        romaji: 'Doyoobi wa daijoobu desu. Bijutsukan e ikimashoo.',
        meaning_vn: 'Thứ Bảy thì được đấy. Chúng mình đi bảo tàng mỹ thuật nhé.',
      },
    ],
  },
  11: {
    title: 'Trò chuyện về sở thích ngày nghỉ',
    situation_vn:
      'Nam và Tanaka chia sẻ về sở thích nghe nhạc, đọc sách và thể thao.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさんの 趣味は なんですか。',
        furigana: 'ナムさんの しゅみは なんですか。',
        romaji: 'Namu-san no shumi wa nan desu ka.',
        meaning_vn: 'Sở thích của Nam là gì?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '音楽を 聞くことです。よく 日本の 歌を 聞きます。',
        furigana: 'おんがくを きくことです。よく にほんの うたを ききます。',
        romaji: 'Ongaku o kiku koto desu. Yoku Nihon no uta o kikimasu.',
        meaning_vn: 'Là nghe nhạc. Tôi thường nghe bài hát Nhật Bản.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'スポーツも しますか。',
        furigana: 'スポーツも しますか。',
        romaji: 'Supootsu mo shimasu ka.',
        meaning_vn: 'Bạn có chơi thể thao nữa không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'はい、ときどき 友だちと サッカーを します。',
        furigana: 'はい、ときどき ともだちと サッカーを します。',
        romaji: 'Hai, tokidoki tomodachi to sakkaa o shimasu.',
        meaning_vn: 'Có, thỉnh thoảng tôi đá bóng cùng bạn bè.',
      },
    ],
  },
  12: {
    title: 'Rủ bạn đi xem lễ hội pháo hoa',
    situation_vn:
      'Tanaka rủ Nam cùng đi xem lễ hội pháo hoa mùa hè vào thứ Bảy tuần sau.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: '来週の 土よう日に 花火大会が ありますよ。',
        furigana: 'らいしゅうの どようびに はなびたいかいが ありますよ。',
        romaji: 'Raishuu no doyoobi ni hanabi-taikai ga arimasu yo.',
        meaning_vn: 'Thứ Bảy tuần sau có lễ hội pháo hoa đấy.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'いっしょに 見に 行きませんか。',
        furigana: 'いっしょに みに いきませんか。',
        romaji: 'Issho ni mi ni ikimasen ka.',
        meaning_vn: 'Bạn có muốn cùng đi xem không?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'いいですね。何時に どこで 会いますか。',
        furigana: 'いいですね。なんじに どこで あいますか。',
        romaji: 'Ii desu ne. Nan-ji ni doko de aimasu ka.',
        meaning_vn: 'Tuyệt quá. Mấy giờ chúng mình gặp nhau ở đâu?',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '6時に 駅の 前で 会いましょう。',
        furigana: 'ろくじに えきの まえで あいましょう。',
        romaji: 'Roku-ji ni eki no mae de aimashoo.',
        meaning_vn: '6 giờ gặp nhau ở trước nhà ga nhé.',
      },
    ],
  },
  13: {
    title: 'Hỏi đường và phương tiện ra sân bay',
    situation_vn:
      'Nam hỏi nhân viên nhà ga cách đi từ ga hiện tại đến sân bay và cổng ra.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: 'すみません、空港まで どうやって 行きますか。',
        furigana: 'すみません、くうこうまで どうやって いきますか。',
        romaji: 'Sumimasen, kuukoo made doo yatte ikimasu ka.',
        meaning_vn: 'Xin lỗi, đi đến sân bay bằng cách nào ạ?',
      },
      {
        speaker: '駅員 (Nhân viên ga)',
        kanji: 'バスが 便利ですよ。駅の 東口に バス停が あります。',
        furigana: 'バスが べんりですよ。えきの ひがしぐちに バスていが あります。',
        romaji: 'Basu ga benri desu yo. Eki no higashiguchi ni basu-tee ga arimasu.',
        meaning_vn: 'Đi xe buýt rất tiện đấy ạ. Ở cổng Đông nhà ga có trạm xe buýt.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '東口ですね。どうも ありがとうございます。',
        furigana: 'ひがしぐちですね。どうも ありがとうございます。',
        romaji: 'Higashiguchi desu ne. Doomo arigatoo gozaimasu.',
        meaning_vn: 'Là cổng phía Đông phải không ạ. Xin cảm ơn rất nhiều.',
      },
    ],
  },
  14: {
    title: 'Chỉ đường đến bưu điện trong khu phố',
    situation_vn:
      'Nam hỏi thăm một người qua đường vị trí của bưu điện trong khu phố.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: 'すみません、この近くに 郵便局が ありますか。',
        furigana: 'すみません、このちかくに ゆうびんきょくが ありますか。',
        romaji: 'Sumimasen, kono chikaku ni yuubinkyoku ga arimasu ka.',
        meaning_vn: 'Xin lỗi, ở gần đây có bưu điện không ạ?',
      },
      {
        speaker: '町の人 (Người dân)',
        kanji: 'はい、あそこに 新しくて 白いビルが ありますね。',
        furigana: 'はい、あそこに あたらしくて しろいビルが ありますね。',
        romaji: 'Hai, asoko ni atarashikute shiroi biru ga arimasu ne.',
        meaning_vn: 'Có đấy, ở đằng kia có tòa nhà màu trắng mới xây đúng không.',
      },
      {
        speaker: '町の人 (Người dân)',
        kanji: '郵便局は あのビルの となりです。',
        furigana: 'ゆうびんきょくは あのビルの となりです。',
        romaji: 'Yuubinkyoku wa ano biru no tonari desu.',
        meaning_vn: 'Bưu điện nằm ngay bên cạnh tòa nhà đó.',
      },
    ],
  },
  15: {
    title: 'Chọn quà lưu niệm tặng bạn',
    situation_vn:
      'Nam và Tanaka cùng đi chọn quà lưu niệm Nhật Bản để tặng người thân.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'この ティーカップは すてきですね。',
        furigana: 'この ティーカップは すてきですね。',
        romaji: 'Kono thiikappu wa suteki desu ne.',
        meaning_vn: 'Tách uống trà này trông thanh lịch tuyệt vời nhỉ.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'ええ、でも ちょっと 重いです。',
        furigana: 'ええ、でも ちょっと おもいです。',
        romaji: 'Ee, demo chotto omoi desu.',
        meaning_vn: 'Vâng, nhưng hơi nặng một chút.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'じゃあ、この 日本の ハンカチは どうですか。軽くて かわいいですよ。',
        furigana: 'じゃあ、この にほんの ハンカチは どうですか。かるくて かわいいですよ。',
        romaji: 'Jaa, kono Nihon no hankachi wa doo desu ka. Karukute kawaii desu yo.',
        meaning_vn: 'Vậy chiếc khăn tay Nhật này thì sao? Vừa nhẹ vừa dễ thương đấy.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'いいですね。妹に これを あげます。',
        furigana: 'いいですね。いもうとに これを あげます。',
        romaji: 'Ii desu ne. Imooto ni kore o agemasu.',
        meaning_vn: 'Hay quá. Tôi sẽ tặng cái này cho em gái.',
      },
    ],
  },
  16: {
    title: 'Hỏi giá và mua áo tại cửa hàng thời trang',
    situation_vn:
      'Nam hỏi giá và chọn kích cỡ áo sơ mi tại trung tâm thương mại.',
    lines: [
      {
        speaker: 'ナム (Nam)',
        kanji: 'すみません、この 白いシャツは いくらですか。',
        furigana: 'すみません、この しろいシャツは いくらですか。',
        romaji: 'Sumimasen, kono shiroi shatsu wa ikura desu ka.',
        meaning_vn: 'Xin lỗi, chiếc áo sơ mi trắng này giá bao nhiêu tiền ạ?',
      },
      {
        speaker: '店員 (Nhân viên)',
        kanji: '三千五百円です。Mサイズと Lサイズが あります。',
        furigana: 'さんぜんごひゃくえんです。Mサイズと Lサイズが あります。',
        romaji: 'San-zen go-hyaku en desu. Emu-saizu to Eru-saizu ga arimasu.',
        meaning_vn: 'Giá 3,500 Yên ạ. Có cỡ M và cỡ L.',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'じゃあ、Mサイズを ください。カードで 払います。',
        furigana: 'じゃあ、Mサイズを ください。カードで はらいます。',
        romaji: 'Jaa, Emu-saizu o kudasai. Kaado de haraimasu.',
        meaning_vn: 'Vậy lấy cho tôi cỡ M nhé. Tôi thanh toán bằng thẻ.',
      },
    ],
  },
  17: {
    title: 'Kể về ngày nghỉ cuối tuần trước',
    situation_vn:
      'Sáng thứ Hai, Tanaka hỏi thăm Nam về kỳ nghỉ cuối tuần vừa qua.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: 'ナムさん、週末は どうでしたか。',
        furigana: 'ナムさん、しゅうまつは どうでしたか。',
        romaji: 'Namu-san, shuumatsu wa doo deshita ka.',
        meaning_vn: 'Nam ơi, cuối tuần vừa rồi của bạn thế nào?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '友だちと 映画を 見ました。とても おもしろかったです。',
        furigana: 'ともだちと えいがを みました。とても おもしろかったです。',
        romaji: 'Tomodachi to eega o mimashita. Totemo omoshirokatta desu.',
        meaning_vn: 'Tôi đã đi xem phim cùng bạn. Bộ phim đã rất thú vị.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: 'それは よかったですね。',
        furigana: 'それは よかったですね。',
        romaji: 'Sore wa yokatta desu ne.',
        meaning_vn: 'Thế thì tuyệt quá nhỉ.',
      },
    ],
  },
  18: {
    title: 'Kỷ niệm chuyến du lịch Tokyo & Núi Phú Sĩ',
    situation_vn:
      'Nam kể lại trải nghiệm chuyến du lịch Tokyo và nghỉ tại lữ quán Ryokan.',
    lines: [
      {
        speaker: '田中 (Tanaka)',
        kanji: '夏休みに どこへ 行きましたか。',
        furigana: 'なつやすみに どこへ いきましたか。',
        romaji: 'Natsu-yasumi ni doko e ikimashita ka.',
        meaning_vn: 'Kỳ nghỉ hè vừa rồi bạn đã đi đâu?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: '家族と 東京へ 行きました。それから、富士山を 見ました。',
        furigana: 'かぞくと とうきょうへ いきました。それから、ふじさんを みました。',
        romaji: 'Kazoku to Tookyoo e ikimashita. Sorekara, Fujisan o mimashita.',
        meaning_vn: 'Tôi đã đi Tokyo cùng gia đình. Sau đó đã ngắm núi Phú Sĩ.',
      },
      {
        speaker: '田中 (Tanaka)',
        kanji: '天気は どうでしたか。',
        furigana: 'てんきは どうでしたか。',
        romaji: 'Tenki wa doo deshita ka.',
        meaning_vn: 'Thời tiết lúc đó thế nào?',
      },
      {
        speaker: 'ナム (Nam)',
        kanji: 'とても いい天気でした。日本の 旅館に 泊まりました。楽しかったです。',
        furigana: 'とても いいてんきでした。にほんの りょかんに とまりました。たのしかったです。',
        romaji: 'Totemo ii tenki deshita. Nihon no ryokan ni tomarimashita. Tanoshikatta desu.',
        meaning_vn: 'Thời tiết rất đẹp. Chúng tôi đã trọ lại ở lữ quán Nhật Bản. Đã rất vui.',
      },
    ],
  },
};

export const MARUGOTO_GRAMMAR_SEED: Record<number, GrammarPoint[]> =
  Object.fromEntries(
    Object.entries(RAW_GRAMMAR_BY_LESSON).map(([lessonKey, items]) => {
      const lessonId = Number(lessonKey);
      const mapped: GrammarPoint[] = items.map((item, idx) => ({
        id: lessonId * 100 + idx + 1,
        lesson_id: lessonId,
        ...item,
      }));
      return [lessonId, mapped];
    })
  );

export const MARUGOTO_KAIWA_SEED: Record<number, KaiwaDialogue> =
  Object.fromEntries(
    Object.entries(RAW_KAIWA_BY_LESSON).map(([lessonKey, item]) => {
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
