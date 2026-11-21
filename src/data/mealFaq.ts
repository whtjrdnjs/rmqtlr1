/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MealFaqItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

// 질문과 답 목록 (12개)
export const MEAL_FAQ_LIST: MealFaqItem[] = [
  {
    id: 'lunch-time',
    question: '점심시간 몇 시인가요?',
    keywords: ['점심시간', '시간', '몇시', '배식', '시작', '언제', '종료'],
    answer:
      '세종다정고등학교 점심시간은 오후 12시 30분부터 1시 30분까지입니다. 앱 상단의 실시간 카운트다운에서 점심시간까지 남은 시간을 확인할 수 있습니다.',
  },
  {
    id: 'allergy-numbers',
    question: '알레르기 번호는 무슨 뜻인가요?',
    keywords: ['알레르기', '번호', '숫자', '표시', '유발', '물질', '19종'],
    answer:
      '식단표의 숫자는 교육부 공식 알레르기 유발 식품 19종을 뜻합니다. ①난류 ②우유 ③메밀 ④땅콩 ⑤대두 ⑥밀 ⑦고등어 ⑧게 ⑨새우 ⑩돼지고기 ⑪복숭아 ⑫토마토 ⑬아황산류 ⑭호두 ⑮닭고기 ⑯쇠고기 ⑰오징어 ⑱조개류 ⑲잣 입니다.',
  },
  {
    id: 'allergy-milk-egg',
    question: '우유나 계란 알레르기 주의하는 날은 어떻게 보나요?',
    keywords: ['우유', '계란', '난류', '주의', '알림', '필터', '안심', '피해야'],
    answer:
      '상단의 [알레르기] 버튼이나 퀵 선택 칩에서 우유·계란 등 주의할 음식을 선택하면, 이번 주 주의해야 하는 요일에 붉은색 ⚠️주의 배지가 표시되고 안심 메뉴만 골라볼 수 있습니다.',
  },
  {
    id: 'tier-rule',
    question: '급식 티어 기준은 어떻게 정해지나요?',
    keywords: ['티어', '등급', '순위', '기준', '점수', '레전드', '밥도둑'],
    answer:
      '돈가스·치킨·수육·탕수육 등 인기 메뉴 비중을 바탕으로 S·A·B·C·F 기본 티어가 자동 계산되며, [급식 티어] 탭에서 내 취향대로 티어를 직접 바꾸고 친구들과 투표할 수 있습니다.',
  },
  {
    id: 'weekend-menu',
    question: '주말이나 방학에는 왜 월요일 식단이 보이나요?',
    keywords: ['주말', '토요일', '일요일', '방학', '휴일', '월요일', '안나와요'],
    answer:
      '토·일요일에는 학교 급식이 운영되지 않기 때문에 앱을 열면 자동으로 월요일 식단이 선택됩니다. 나이스에 식단이 등록되지 않은 휴일에도 대표 주간 식단이나 이전/다음 주 이동으로 식단을 확인할 수 있습니다.',
  },
  {
    id: 'protein-macro',
    question: '단백질이나 칼로리 정보는 어디서 보나요?',
    keywords: ['단백질', '칼로리', '열량', '탄단지', '탄수화물', '지방', '득근', '영양'],
    answer:
      '식단 목록 아래의 [탄·단·지 득근 지표] 카드에서 오늘 급식의 단백질 함량(계란 몇 개 분량인지)과 탄수화물·단백질·지방 비율, 총 열량(Kcal)을 바로 볼 수 있습니다.',
  },
  {
    id: 'origin-info',
    question: '식재료 원산지 정보는 어디서 확인하나요?',
    keywords: ['원산지', '국내산', '한우', '돼지고기', '쌀', '재료', '출처'],
    answer:
      '식단표 아래쪽의 [원산지 정보] 버튼을 누르면 그날 급식에 사용된 쇠고기·돼지고기·닭고기·쌀·배추 등의 상세 원산지와 영양 성분표를 확인할 수 있습니다.',
  },
  {
    id: 'favorite-menu',
    question: '좋아하는 최애 메뉴 찜은 어떻게 하나요?',
    keywords: ['최애', '찜', '하트', '좋아하는', '즐겨찾기', '알림'],
    answer:
      '각 반찬 오른쪽에 있는 하트(❤️) 버튼을 누르면 최애 메뉴로 저장됩니다. 이번 주 식단에 최애 메뉴가 들어 있는 날에는 상단에 알림 배너가 자동으로 뜹니다.',
  },
  {
    id: 'menu-search',
    question: '치킨이나 돈가스 나오는 날 검색할 수 있나요?',
    keywords: ['검색', '찾기', '치킨', '돈가스', '언제', '메뉴', '스팸'],
    answer:
      '상단의 [검색] 버튼이나 검색바를 누른 뒤 원하는 메뉴 이름을 입력하면, 이번 달에 해당 메뉴가 나오는 날짜를 한눈에 찾아 해당 날짜로 바로 이동할 수 있습니다.',
  },
  {
    id: 'weekly-grid',
    question: '월요일부터 금요일까지 한 번에 볼 수 있나요?',
    keywords: ['한눈에', '주간', '전체', '월화수목금', '5일', '복사', '공유'],
    answer:
      '상단 탭에서 [5일 한눈에]를 누르면 월~금요일 전체 식단을 한 화면에 펼쳐서 볼 수 있으며, [주간 식단 복사] 버튼으로 단톡방에 공유할 수도 있습니다.',
  },
  {
    id: 'school-location',
    question: '세종다정고등학교 위치와 연락처가 궁금해요',
    keywords: ['위치', '주소', '전화', '연락처', '다정동', '교무실', '학교'],
    answer:
      '세종다정고등학교는 세종특별자치시 다정남로 15(다정동)에 위치해 있으며, 교무실 연락처는 044-410-3400입니다.',
  },
  {
    id: 'wish-menu',
    question: '먹고 싶은 희망 급식 메뉴는 어떻게 신청하나요?',
    keywords: ['희망', '신청', '건의', '원하는', '투표', '의견'],
    answer:
      '현재 보고 계신 [질문·신청] 탭 아래의 «우리 학교 희망 급식 신청함»에 원하는 메뉴와 이유를 입력해 남기실 수 있습니다. 단, 이름·학번·연락처 같은 개인정보는 절대 적지 마세요.',
  },
];

// 입력 칸 위에 띄울 자주 묻는 질문 버튼 4개
export const FAQ_QUICK_QUESTIONS: string[] = [
  '점심시간 몇 시인가요?',
  '알레르기 번호는 무슨 뜻인가요?',
  '급식 티어 기준은 어떻게 정해지나요?',
  '단백질이나 칼로리 정보는 어디서 보나요?',
];

const PARTICLES = ['은', '는', '이', '가', '을', '를', '에', '의', '도'];

function stripParticles(word: string): string {
  let cleaned = word.replace(/[?!.,~'"()\[\]·]/g, '').trim();
  if (!cleaned) return '';
  for (const p of PARTICLES) {
    if (cleaned.length >= 3 && cleaned.endsWith(p)) {
      cleaned = cleaned.slice(0, -p.length);
      break;
    }
  }
  return cleaned;
}

function tokenizeKorean(text: string): string[] {
  const rawTokens = text
    .toLowerCase()
    .split(/\s+/)
    .map(stripParticles)
    .filter((t) => t.length >= 2);
  return Array.from(new Set(rawTokens));
}

function hasTwoCharMatch(a: string, b: string): boolean {
  if (a.length < 2 || b.length < 2) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Check any 2-character substring overlap
  for (let i = 0; i <= a.length - 2; i++) {
    const sub = a.slice(i, i + 2);
    if (b.includes(sub)) {
      return true;
    }
  }
  return false;
}

/**
 * 은·는·이·가·을·를·에·의·도 조사를 떼고, 두 글자 이상 같은 낱말이 있으면 비슷한 질문으로 판정해 가장 적절한 답 반환
 */
export function findBestFaqAnswer(input: string): MealFaqItem | null {
  const inputTokens = tokenizeKorean(input);
  if (inputTokens.length === 0) return null;

  let bestItem: MealFaqItem | null = null;
  let bestScore = 0;

  for (const item of MEAL_FAQ_LIST) {
    const targetTokens = [
      ...tokenizeKorean(item.question),
      ...item.keywords.map((k) => stripParticles(k.toLowerCase())).filter((k) => k.length >= 2),
    ];

    let score = 0;
    for (const inTok of inputTokens) {
      for (const tgtTok of targetTokens) {
        if (inTok === tgtTok) {
          score += 3;
        } else if (hasTwoCharMatch(inTok, tgtTok)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore > 0 ? bestItem : null;
}
