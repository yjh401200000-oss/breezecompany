// ============================================================
//  브리즈컴퍼니 상품 목록 (products.js)
//  ※ 직접 수정하지 말고 관리자 페이지(admin.html)를 이용하세요.
// ============================================================

window.BZ_PRODUCTS = [
  {
    emoji: '🌺',
    group: '란',
    desc: '서양란 · 동양란',
    items: [
      { name: '서양란 화이트', use: '개업 · 이사 · 취임 · 축하', price: 99000,  price2: 109000 },
      { name: '서양란 핑크',   use: '개업 · 이사 · 취임 · 축하', price: 99000,  price2: 109000 },
      { name: '서양란 옐로우', use: '개업 · 이사 · 취임 · 축하', price: 99000,  price2: 109000 },
      { name: '동양란 A',     use: '축하 · 감사 · 선물',         price: 69000,  price2: null   },
      { name: '동양란 B',     use: '축하 · 감사 · 선물',         price: 79000,  price2: null   }
    ]
  },
  {
    emoji: '🌿',
    group: '관엽식물 & 테이블용',
    desc: '공기정화식물 · 계절꽃',
    items: [
      { name: '관엽식물 기본형', use: '인테리어 · 공기정화 · 선물',  price: 99000,  price2: null },
      { name: '관엽식물 고급형', use: '인테리어 · 공기정화 · 선물',  price: 109000, price2: null },
      { name: '테이블용',        use: '생일 · 기념일 · 축하 · 감사', price: 65000,  price2: null }
    ]
  },
  {
    emoji: '🎋',
    group: '화환 & 근조',
    desc: '3단 화환 · 근조 화환',
    items: [
      { name: '3단 화환 A',     use: '개업 · 취임 · 축하',       price: 69000, price2: null },
      { name: '3단 화환 고급형', use: '개업 · 취임 · 고급 행사', price: 89000, price2: null },
      { name: '3단 근조 A',     use: '조문 · 격식 행사',         price: 69000, price2: null },
      { name: '3단 근조 고급형', use: '조문 · 격식 고급 행사',   price: 89000, price2: null }
    ]
  }
];
