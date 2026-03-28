# MMCA 인트로 구현 - 작업 현황

## ✅ 완료된 작업

### 코드 컨벤션 정리
- [x] `test/index.html` 내의 모든 CSS 클래스명 및 HTML ID를 `snake_case`로 변환 완료 (예: `intro-wrapper` → `intro_wrapper`)

### 기본 세팅
- [x] Lenis smooth scroll + GSAP ScrollTrigger 연동
- [x] 스크롤바 숨김 (`scrollbar-width: none`, `::-webkit-scrollbar`)
- [x] 700vh 스크롤 스페이서 (가상 스크롤)
- [x] `position: fixed` 100vh 인트로 래퍼

### Stage 1: MMCA 아웃라인 드로잉
- [x] 4컬럼 레이아웃 (각 25vw)
- [x] 1~3번째 컬럼 우측 보더 (`border-right: 1px solid rgba(255,255,255,0.12)`)
- [x] SVG `<text>` 요소에 **Inter 900** 폰트 사용
- [x] `stroke-dasharray` / `stroke-dashoffset`으로 드로잉 애니메이션
- [x] stroke 1px
- [x] M 글자 내부 삼각형 겹침 → `fill: #1e1e1e` (배경색 마스킹)으로 해결
- [x] C, A 컬럼 SVG → `right: 0` 으로 우측 정렬
- [x] MM 컬럼 SVG → 센터 정렬

### Stage 2: 색 채움
- [x] stroke → 흰색 fill 전환 (`fill: white, stroke: white`)

### Stage 3: 2번째/4번째 글자 하강 + 색상 반전
- [x] col-2(M), col-4(A) → `y: 40vh` 아래로 이동
- [x] 배경 `#1e1e1e` → `#ffffff` 전환
- [x] 글자 fill/stroke → `#1a1a1a` (검정)
- [x] 보더 fade out

### Stage 4: 한 줄 텍스트
- [x] columns-layer fade out + scale down
- [x] "MMCA" 18vw 텍스트 fade in

### Stage 5: 2줄 분리
- [x] "MM" / "CA" 13vw 텍스트 (flex column)

### Stage 6: 기하 도형
- [x] 2×2 그리드: 사각형(회색), 사각형(검정), 원, 삼각형
- [x] scale 0.7 → 1 등장 애니메이션

---

## 🛠️ 기술 스택

| 항목 | 사용 |
|------|------|
| 스크롤 | Lenis 1.1.18 |
| 애니메이션 | GSAP 3.12.5 + ScrollTrigger |
| 폰트 | Google Fonts Inter (wght 900) |
| 드로잉 효과 | SVG text + stroke-dasharray/dashoffset |
| 레이아웃 | CSS flex (4컬럼) |

---

## 📁 파일 구조

```
test/
├── index.html   ← 메인 (HTML + CSS + JS 인라인)
└── test.md      ← 이 문서
```

---

## 🎬 애니메이션 타임라인

```
스크롤 0~100vh    → Stage 1: 아웃라인 드로잉 (stroke-dashoffset)
스크롤 100~200vh  → Stage 2: 흰색 fill 채움
스크롤 200~300vh  → Stage 3: M2/A 하강 + 배경 흰색 + 글자 검정
스크롤 300~400vh  → Stage 4: MMCA 한 줄 텍스트
스크롤 400~500vh  → Stage 5: MM / CA 2줄 분리
스크롤 500~600vh  → Stage 6: 기하 도형
```

---

## 📌 핵심 구현 포인트

### M 삼각형 겹침 해결
- SVG text에 `fill: none`이면 내부 카운터(삼각형) 스트로크가 보임
- `fill: #1e1e1e` (배경색)으로 설정 → 내부를 배경색으로 채워서 마스킹
- `paint-order: stroke fill` → stroke를 먼저 그리고 fill로 덮음

### 스크롤바 없는 스크롤
- `html { scrollbar-width: none }` + `::-webkit-scrollbar { display: none }`
- 실제 스크롤은 `.scroll-spacer { height: 700vh }`로 생성
- Lenis가 부드러운 관성 스크롤 처리

### SVG text 드로잉
- `getComputedTextLength() * 4` 로 대략적 path 길이 계산
- `stroke-dasharray: len`, `stroke-dashoffset: len` → 숨김
- GSAP로 `strokeDashoffset: 0` 애니메이션 → 그려지는 효과
