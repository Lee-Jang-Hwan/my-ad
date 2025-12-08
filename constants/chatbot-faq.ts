/**
 * FAQ 챗봇 데이터
 * FAQ.md 기반으로 구성된 챗봇용 데이터
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  icon: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "service",
    label: "서비스 소개",
    icon: "Info",
    items: [
      {
        id: "service-1",
        question: "삽가능 스튜디오는 어떤 서비스인가요?",
        answer:
          "삽가능 스튜디오는 AI를 활용한 광고 영상 및 이미지 생성 서비스입니다. 상품 이미지와 상품명만 업로드하면, AI가 자동으로 광고 문구를 생성하고, 고품질의 광고 영상과 이미지를 만들어 드립니다.",
      },
      {
        id: "service-2",
        question: "어떤 AI 기술을 사용하나요?",
        answer:
          "광고 문구 생성에는 Google Gemini 3.0을, 이미지 정제에는 Nano Banana Pro를, 영상 생성에는 OpenAI Sora 2 Pro를 사용합니다.",
      },
      {
        id: "service-3",
        question: "영상 생성에 얼마나 걸리나요?",
        answer:
          "전체 영상 생성 과정은 약 5~8분 정도 소요됩니다. (광고 문구 생성 30초, 이미지 정제 40초, 영상 생성 약 5분) 서버 상황에 따라 다소 차이가 있을 수 있습니다.",
      },
      {
        id: "service-4",
        question: "이미지 생성에 얼마나 걸리나요?",
        answer: "이미지 생성은 약 3분 정도 소요됩니다.",
      },
    ],
  },
  {
    id: "account",
    label: "회원가입 및 계정",
    icon: "User",
    items: [
      {
        id: "account-1",
        question: "회원가입은 어떻게 하나요?",
        answer:
          "홈페이지 좌측 하단의 로그인 버튼을 클릭하면 회원가입 및 로그인이 가능합니다. 이메일, Google, Tiktok, Github 계정으로 간편하게 가입할 수 있습니다.",
      },
      {
        id: "account-2",
        question: "비밀번호를 잊어버렸어요.",
        answer:
          "로그인 페이지에서 비밀번호 찾기를 클릭하시면, 가입 시 사용한 이메일로 비밀번호 재설정 링크를 받을 수 있습니다.",
      },
      {
        id: "account-3",
        question: "회원 탈퇴는 어떻게 하나요?",
        answer:
          "오른쪽 하단 회원탈퇴에서 회원 탈퇴를 진행할 수 있습니다. 탈퇴 시 모든 데이터(생성된 영상, 이미지, 잔여 크레딧)가 삭제되며 복구가 불가능하니 신중하게 결정해 주세요.",
      },
      {
        id: "account-4",
        question: "여러 기기에서 동시에 로그인할 수 있나요?",
        answer:
          "네, 가능합니다. PC, 모바일, 태블릿 등 여러 기기에서 동일 계정으로 로그인하여 서비스를 이용할 수 있습니다.",
      },
    ],
  },
  {
    id: "credit",
    label: "크레딧 및 결제",
    icon: "CreditCard",
    items: [
      {
        id: "credit-1",
        question: "크레딧이란 무엇인가요?",
        answer:
          "크레딧은 삽가능 스튜디오에서 영상 및 이미지를 생성할 때 사용되는 서비스 내 재화입니다. 크레딧을 충전한 후 원하는 만큼 콘텐츠를 생성할 수 있습니다.",
      },
      {
        id: "credit-2",
        question: "크레딧은 어떻게 충전하나요?",
        answer:
          "로그인 후 크레딧 충전 메뉴로 이동하여 원하는 크레딧 패키지를 선택하고 결제를 완료하면 즉시 크레딧이 충전됩니다.",
      },
      {
        id: "credit-3",
        question: "어떤 결제 수단을 지원하나요?",
        answer:
          "토스페이먼츠를 통해 신용/체크카드, 계좌이체, 간편결제(토스페이, 카카오페이, 네이버페이 등)를 지원합니다.",
      },
      {
        id: "credit-4",
        question: "크레딧의 유효기간이 있나요?",
        answer:
          "네, 크레딧의 유효기간은 충전일로부터 6개월입니다. 유효기간이 지난 크레딧은 자동으로 소멸되니, 기간 내에 사용해 주세요.",
      },
      {
        id: "credit-5",
        question: "환불이 가능한가요?",
        answer:
          "크레딧 충전일로부터 7일 이내에, 충전한 크레딧을 단 1크레딧도 사용하지 않은 경우에만 전액 환불이 가능합니다. 결제일로부터 7일이 경과했거나 크레딧을 1회 이상 사용한 경우 환불이 불가능합니다.",
      },
    ],
  },
  {
    id: "video",
    label: "영상 생성",
    icon: "Video",
    items: [
      {
        id: "video-1",
        question: "어떤 형식의 이미지를 업로드할 수 있나요?",
        answer:
          "JPG, JPEG, PNG, WebP 형식을 지원하며, 권장 크기는 1024x1024 픽셀 이상, 최대 용량은 10MB입니다. 고화질 이미지를 업로드할수록 더 좋은 결과물을 얻을 수 있습니다.",
      },
      {
        id: "video-2",
        question: "상품명은 어떻게 입력하면 좋을까요?",
        answer:
          '상품의 특징이 잘 드러나도록 구체적으로 입력해 주세요. 예: "프리미엄 오가닉 그린티 세트", "초경량 방수 캠핑 백팩 30L"',
      },
      {
        id: "video-3",
        question: "광고 문구는 어떻게 선택하나요?",
        answer:
          "AI가 여러 개의 광고 문구를 생성하면, 그 중에서 가장 마음에 드는 문구 하나를 선택하거나 직접입력하시면 됩니다. 선택한 문구가 영상에 적용됩니다.",
      },
      {
        id: "video-4",
        question: "생성된 영상의 길이는 얼마나 되나요?",
        answer:
          "생성되는 영상의 길이는 약 12초입니다. 짧고 임팩트 있는 광고 영상에 최적화되어 있습니다.",
      },
      {
        id: "video-5",
        question: "영상 생성 중에 브라우저를 닫아도 되나요?",
        answer:
          "네, 괜찮습니다. 영상 생성은 서버에서 진행되므로 브라우저를 닫아도 생성이 계속 진행됩니다. 나중에 마이 페이지에서 완성된 영상을 확인하실 수 있습니다.",
      },
    ],
  },
  {
    id: "image",
    label: "이미지 생성",
    icon: "Image",
    items: [
      {
        id: "image-1",
        question: "이미지 생성과 영상 생성의 차이점은 무엇인가요?",
        answer:
          "이미지 생성은 정적인 광고 이미지를, 영상 생성은 움직이는 광고 영상을 만듭니다. SNS 포스팅에는 이미지를, 릴스나 숏폼에는 영상을 추천드립니다.",
      },
      {
        id: "image-2",
        question: "이미지는 어떤 크기로 생성되나요?",
        answer:
          "생성되는 이미지는 다양한 플랫폼에 적합한 크기로 제공됩니다. 정사각형(1:1) 비율을 지원합니다.",
      },
    ],
  },
  {
    id: "result",
    label: "생성 결과물",
    icon: "FolderOpen",
    items: [
      {
        id: "result-1",
        question: "생성된 영상/이미지는 어디서 확인하나요?",
        answer:
          "로그인 후 마이 페이지에서 모든 생성 결과물을 확인할 수 있습니다. 영상 탭과 이미지 탭으로 구분되어 있어 쉽게 찾을 수 있습니다.",
      },
      {
        id: "result-2",
        question: "생성된 콘텐츠의 소유권은 누구에게 있나요?",
        answer:
          "생성된 광고 영상 및 이미지의 소유권은 회원에게 있습니다. 자유롭게 상업적 용도로 활용하실 수 있습니다.",
      },
      {
        id: "result-3",
        question: "생성된 콘텐츠를 다운로드할 수 있나요?",
        answer:
          "네, 마이 페이지에서 생성된 영상과 이미지를 무제한 다운로드할 수 있습니다.",
      },
      {
        id: "result-4",
        question: "워터마크가 있나요?",
        answer:
          "아니요, 생성된 모든 콘텐츠에는 워터마크가 없습니다. 바로 상업적 용도로 활용하실 수 있습니다.",
      },
    ],
  },
  {
    id: "trouble",
    label: "문제 해결",
    icon: "AlertCircle",
    items: [
      {
        id: "trouble-1",
        question: "이미지 업로드가 안 돼요.",
        answer:
          "이미지 형식이 JPG, PNG, WebP인지, 파일 크기가 10MB 이하인지 확인해 주세요. 인터넷 연결 상태를 확인하고 브라우저 캐시를 삭제 후 재시도해 보세요.",
      },
      {
        id: "trouble-2",
        question: "영상/이미지가 생성되지 않아요.",
        answer:
          '마이 페이지에서 생성 상태를 확인해 주세요. "처리 중" 상태라면 잠시 기다려 주시고, "실패" 상태라면 다시 시도해 주세요. 문제가 지속되면 고객센터로 문의해 주세요.',
      },
      {
        id: "trouble-3",
        question: "결제했는데 크레딧이 충전되지 않았어요.",
        answer:
          "마이 페이지에서 크레딧 잔액과 결제 상태를 확인해 주세요. 10분이 지나도 충전되지 않으면 결제 영수증과 함께 고객센터로 문의해 주세요.",
      },
      {
        id: "trouble-4",
        question: "모바일에서 영상이 재생되지 않아요.",
        answer:
          "영상 썸네일을 터치하면 재생됩니다. 재생되지 않는 경우 브라우저를 최신 버전으로 업데이트하거나 다른 브라우저(Chrome, Safari)로 시도해 주세요.",
      },
    ],
  },
  {
    id: "etc",
    label: "기타",
    icon: "HelpCircle",
    items: [
      {
        id: "etc-1",
        question: "서비스 이용에 제한이 있나요?",
        answer:
          "불법적인 목적으로 서비스를 사용하거나, 타인의 권리를 침해하거나 부적절한 콘텐츠를 생성하거나, 서비스의 안정적 운영을 방해하는 경우 이용이 제한될 수 있습니다.",
      },
      {
        id: "etc-2",
        question: "저작권에 문제가 있는 이미지를 업로드하면 어떻게 되나요?",
        answer:
          "회원은 업로드하는 이미지의 저작권에 대한 책임을 집니다. 타인의 저작물을 무단으로 사용하여 발생하는 모든 법적 책임은 회원에게 있습니다.",
      },
      {
        id: "etc-3",
        question: "API를 제공하나요?",
        answer:
          "현재 API는 제공하지 않습니다. 향후 API 제공 계획이 있으며, 관련 업데이트는 공지사항을 통해 안내드리겠습니다.",
      },
    ],
  },
];

export const CUSTOMER_SERVICE = {
  email: "sappable@gmail.com",
  phone: "010-7266-0807",
  hours: "평일 09:00 ~ 18:00 (주말/공휴일 휴무)",
};

export const CHATBOT_MESSAGES = {
  greeting: "안녕하세요! 무엇을 도와드릴까요?",
  selectCategory: "궁금한 카테고리를 선택해 주세요.",
  selectQuestion: "어떤 것이 궁금하신가요?",
  askFeedback: "문제가 해결되셨나요?",
  resolved: "감사합니다! 더 궁금한 점이 있으시면 말씀해주세요.",
  notResolved: "죄송합니다. 고객센터로 문의해 주시면 더 자세히 안내해 드리겠습니다.",
  contactInfo: "고객센터 정보입니다.",
  backToCategories: "다른 질문이 있으시면 카테고리를 선택해 주세요.",
};
