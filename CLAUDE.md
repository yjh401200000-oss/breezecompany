# 브리즈컴퍼니 홈페이지 — 작업 규칙

이 파일은 Claude Code 세션에서 자동으로 읽힙니다. 새 세션에서도 동일한 규칙이 적용됩니다.

## 프로젝트 개요

- **사이트**: 브리즈컴퍼니 (화환·꽃·난·관엽식물 배송)
- **구조**: 정적 HTML/CSS/JS (빌드 도구 없음)
- **주요 페이지**: `index.html`, `products.html`, `price.html`, `order.html`, `gallery.html`, `admin.html`
- **공용 CSS**: `style.css`
- **배포**: GitHub Pages (`yjh401200000-oss/breezecompany`, `main` 브랜치)

## 디자인 작업 규칙

### 🟢 큰 디자인 결정 → Gemini에게 먼저 의견 받기 (필수)

다음 경우엔 코드를 짜기 전에 Gemini CLI로 분석/제안을 받아 사용자에게 정리해서 보여준 다음 진행한다:

- 새 섹션 추가 (예: 고객 후기, FAQ, 회사 소개 등)
- 페이지 레이아웃의 큰 변경 (히어로 교체, 컬럼 구조 변경)
- 색감/타이포/디자인 시스템 전반 개편
- 새 페이지 신규 제작

**Gemini 호출 방법** (MCP 도구는 인자 충돌 버그가 있어서 PowerShell 직접 호출):

```powershell
gemini -p "여기에 프롬프트. @filename.html 로 파일 참조 가능" -m gemini-2.5-flash --skip-trust
```

- 무료 쿼터: `gemini-2.5-pro`는 이미 소진된 상태일 수 있음 → 기본 `gemini-2.5-flash` 사용
- 응답이 길면 자동으로 임시 파일에 저장됨 → `Read`로 읽어서 사용자에게 요약 전달
- Gemini 응답은 그대로 적용하지 말고 **반드시 사용자에게 정리해서 보여준 뒤 동의를 받고** 반영

### 🟡 작은 작업 → 바로 진행 (Gemini 안 거침)

- 텍스트/문구 수정
- 명확한 버그 수정 (예: 안 보이는 버튼 색)
- 이미지 교체
- 줄간격/여백 미세 조정

## 디자인 토큰 (style.css 상단)

코드 작성 시 **하드코딩된 색상/사이즈 대신 CSS 변수 사용**:

- 컬러: `--bz-green`, `--bz-green-deep`, `--bz-green-pale`, `--bz-pink`, `--bz-pink-light`, `--bz-cream`, `--bz-ink`, `--bz-ink-soft`, `--bz-surface`, `--bz-surface-2`, `--bz-line`, `--bz-gray-light`
- 폰트: `--bz-font-kr` (Noto Sans KR), `--bz-font-en`, `--bz-font-display` (Playfair Display)
- 텍스트 크기: `--bz-text-xs/sm/base/md/lg/xl/2xl/3xl/4xl`
- 간격: `--bz-sp-1` ~ `--bz-sp-9`
- 라운드: `--bz-radius-sm/md/lg/xl/pill`
- 그림자: `--bz-shadow-xs/sm/md/lg/cta`
- 트랜지션: `--bz-ease`, `--bz-dur`
- 컨테이너: `--bz-container` (1100px), `--bz-gutter`

## 코드 스타일

- HTML 인덴트: 2칸
- 한국어 카피 그대로, 영문 라벨은 `section-eyebrow` 클래스로 작은 보조 텍스트
- 새 섹션은 다른 섹션처럼 `.reveal` 클래스 붙여 스크롤 페이드인 적용
- 반응형 브레이크포인트: 1024px (태블릿), 900px (히어로 등), 640px (모바일)

## Git / 배포

- 커밋 메시지: 한국어, 대괄호로 카테고리 시작 (예: `[홈 개선] ...`, `[버튼 가시성 수정] ...`)
- 작업 무관 파일은 add 하지 말 것: `.claude/`, `.mcp.json`, 윈도우 다운로드본 등
- 푸시는 사용자가 명시적으로 요청할 때만 (`git push origin main`)
- 강제 푸시·rebase·amend 금지 (사용자가 명시 요청 시 제외)

## 검증

- HTML/CSS 수정 후엔 `mcp__Claude_Preview__preview_start` 로 로컬 프리뷰 띄우고 스크린샷·DOM inspect로 확인
- 모바일은 `preview_resize` 의 `mobile` 프리셋(375x812)로 같이 검증
- 콘솔 에러도 `preview_console_logs` 로 확인
