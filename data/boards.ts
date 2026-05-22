export type BoardCategory = "공지" | "자유" | "질문" | "팁/연구";

export type BoardPost = {
  id: number;
  category: BoardCategory;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  views: number;
  likes: number;
  comments: {
    author: string;
    body: string;
    time: string;
  }[];
};

export const boardCategories: Array<"전체" | BoardCategory> = [
  "전체",
  "공지",
  "자유",
  "질문",
  "팁/연구",
];

export const boardPosts: BoardPost[] = [
  {
    id: 1,
    category: "공지",
    title: "프롬포트랩 업로드 가이드",
    body: "이미지 글에는 결과 이미지, 사용 모델, 비율, 프롬프트 원문을 같이 올려주세요. 영어 원문만 있어도 괜찮지만, 한국어 설명을 함께 적으면 다른 사용자가 더 쉽게 따라 할 수 있습니다.",
    author: "admin",
    createdAt: "방금 전",
    views: 428,
    likes: 31,
    comments: [
      {
        author: "visual_user",
        body: "모델명 적는 규칙도 있으면 좋겠습니다.",
        time: "10분 전",
      },
    ],
  },
  {
    id: 2,
    category: "질문",
    title: "손가락 깨지는 거 줄이려면 네거티브 뭐 넣나요?",
    body: "인물 이미지 만들 때 손이 계속 이상하게 나옵니다. bad hands, extra fingers 정도는 넣고 있는데 더 먹히는 네거티브 프롬프트가 있을까요?",
    author: "hand_fix",
    createdAt: "12분 전",
    views: 182,
    likes: 14,
    comments: [
      {
        author: "negative_note",
        body: "distorted fingers, fused fingers, malformed hands도 같이 넣어보세요.",
        time: "8분 전",
      },
      {
        author: "pose_maker",
        body: "손을 화면 밖으로 빼는 구도가 생각보다 효과가 큽니다.",
        time: "5분 전",
      },
    ],
  },
  {
    id: 3,
    category: "팁/연구",
    title: "같은 프롬프트로 1:1, 4:5, 16:9 돌려본 후기",
    body: "제품 사진은 1:1이 제일 안정적이고, 인물 화보는 4:5가 좋았습니다. 16:9는 배경까지 살릴 수 있지만 피사체가 작아지는 경우가 많았습니다.",
    author: "ratio_lab",
    createdAt: "34분 전",
    views: 311,
    likes: 43,
    comments: [
      {
        author: "ad_prompt",
        body: "상세페이지용은 4:5가 확실히 쓰기 편하더라고요.",
        time: "19분 전",
      },
    ],
  },
  {
    id: 4,
    category: "자유",
    title: "요즘 이미지 생성 퀄리티 진짜 많이 올라간 듯",
    body: "예전에는 프롬프트 잘 써도 어색한 부분이 많았는데, 요즘은 조명이나 질감까지 꽤 잘 잡히네요. 좋은 프롬프트 찾는 게 아직 제일 어렵습니다.",
    author: "daily_ai",
    createdAt: "1시간 전",
    views: 224,
    likes: 26,
    comments: [
      {
        author: "studio_prompt",
        body: "그래서 결과 이미지랑 프롬프트가 같이 있는 게 중요한 것 같습니다.",
        time: "43분 전",
      },
      {
        author: "image_maker",
        body: "모델별로 잘 먹히는 표현을 따로 정리하면 좋겠어요.",
        time: "38분 전",
      },
    ],
  },
  {
    id: 5,
    category: "질문",
    title: "영어 프롬프트랑 한국어 프롬프트 결과 차이 큰가요?",
    body: "한국어로 써도 어느 정도 되긴 하는데, 영어로 바꾸면 더 좋아지는 느낌이 있습니다. 실제로 차이가 큰지 궁금합니다.",
    author: "translate_q",
    createdAt: "2시간 전",
    views: 156,
    likes: 11,
    comments: [
      {
        author: "prompt_user",
        body: "복잡한 스타일 묘사는 영어가 아직 더 안정적인 것 같습니다.",
        time: "1시간 전",
      },
    ],
  },
  {
    id: 6,
    category: "팁/연구",
    title: "제품 사진 프롬프트에 자주 넣는 단어들",
    body: "premium product photography, soft diffused studio light, realistic reflections, clean composition, no logo, no readable text 조합을 자주 씁니다.",
    author: "product_view",
    createdAt: "3시간 전",
    views: 276,
    likes: 37,
    comments: [],
  },
  {
    id: 7,
    category: "자유",
    title: "프롬프트 공유할 때 실패작도 같이 올리면 도움 될 듯",
    body: "성공한 이미지도 중요하지만 어떤 문장을 넣었을 때 망했는지 같이 보면 더 빨리 배울 수 있을 것 같습니다.",
    author: "fail_archive",
    createdAt: "4시간 전",
    views: 198,
    likes: 22,
    comments: [
      {
        author: "lab_user",
        body: "실패 이유 태그 같은 것도 있으면 좋겠네요.",
        time: "2시간 전",
      },
    ],
  },
  {
    id: 8,
    category: "질문",
    title: "Midjourney랑 GPT Image 결과를 한 글에 비교해도 되나요?",
    body: "같은 프롬프트를 두 모델에 넣어서 비교해보고 싶은데 이미지가 여러 장이면 글이 너무 길어질지 고민입니다.",
    author: "model_compare",
    createdAt: "5시간 전",
    views: 243,
    likes: 19,
    comments: [
      {
        author: "admin",
        body: "비교글은 오히려 좋습니다. 모델명만 확실히 적어주세요.",
        time: "3시간 전",
      },
    ],
  },
];
