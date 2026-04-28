# Architecture Academy — SDD-v1.4 (Codex 3차 검토 반영)

> 책 『기술노트(With 알렉)』 기반 IT 지식 학습 서비스
> 서브도메인: `architecture.teachermate.co.kr`
> 작성: 2026-04-27 / **갱신: 2026-04-27**
> - v1.1: Codex 1차 REVISE 21건 반영
> - v1.2: AI 공급자 Gemini → Claude 전환 + prompt caching + 비용 재추정
> - v1.3: K1 캐시 결함 수정 + 비용 표 3단 + JSON 단발 + API 키 관리 + 저작권 후처리 + Sonnet 자동 승급 + A/B eval 단계
> - v1.4: **Codex 3차 REVISE 9건 반영** (토큰 실측 절차 / 작은 챕터 fallback / 비용 break-even 수식 / Sonnet 학생 단위 분배 / 후처리 인덱스 사전 빌드 / 재생성 비용 footnote / A/B eval 블라인드 프로토콜 / 층화 표본 / 예산 ladder / preflight 순서 A/B eval **전**으로 변경) + CLAUDE.md 동기화

---

## 변경 요약 (v1 → v1.1)

| Codex ID | 반영 위치 | 핵심 변경 |
|----------|----------|----------|
| A3 | §1.3 | 임시 명칭 = `Architecture` (영문) 고정. 변경 지점 3곳 명시 |
| B1 | §2.1 | 책 질문 제목 그대로 차용 → **개념 추출 후 새 제목 재작성** |
| B2 | §2.3, §9 | 통지 전 콘텐츠 PR 머지 **게이트** 신설 |
| C1, F1 | §9 | 본문/시연/퀴즈 분리 PR → **챕터당 1 PR 10개**로 통합 |
| C2 | §3.2, §12.6 | 퀴즈 검수 체크리스트 절차 신설 |
| D1 | §4 | `/teacher/new` 제거(모달화) + 404/forbidden/closed/invalid 추가 |
| D2 | §5.1, §10 | 100명 부하 모델 표 (read/write/chat 분리) |
| D3 | §5.4, §10 | **Gemini 무료 한도 가정 폐기** → 유료 tier + 강제 캐시 + 학생당 분당 1회 + 챗봇 P0 유지하되 강한 제한 |
| D4 | §5.6, §10 | 폴링 부하 모델 정정 (교사 1화면 6 RPM) |
| D5 | §6 | `progress` CHECK 제약 + 모드별 upsert 키 분리 |
| E1 | §6 | 인덱스 5종 명시 |
| E2 | §6 | **익명 학생 RLS = 서버 프록시 + 서명 참여 토큰** 패턴 고정 |
| F2 | §9 | PR #4 분리 → #4A(UI) + #4B(퀴즈/진도) |
| G2 | §12.2 | 1 Q&A = **단일 HTML + 내부 hash 전환** (2계층) |
| G3 | §12.3 | 파일명 컨벤션 단축 (`ch06/q03.html` + 내부 `#scenario`) |
| H1 | §10 | 위험 4건 추가 (iframe sandbox / 챗봇 본문 차단 / rate fallback / 모바일 시연 가시성) |
| I1 | §11 (新) | 운영 항목 5종 (a11y / analytics / 로그 / 재시도 / abuse throttling) |
| **(사용자 결정 v1.2)** | **§5.4, §8, §10, §13** | **AI 공급자 Gemini → Claude 전환** (Haiku 4.5 권장) + Anthropic prompt caching + 비용 표 |

### v1.2 → v1.3 (Codex 검토 17건 중 REVISE 16건 반영)

| Codex ID | 반영 위치 | 핵심 변경 |
|----------|----------|----------|
| K1 | §5.4.2 | **캐시 prefix 1300 → 4500 tok로 재설계** — Haiku 최소 4096 만족하기 위해 system 풍부화 + 챕터 전체(다른 Q&A 포함) 컨텍스트 |
| K2 | §5.4.2 | 5분 TTL 기본 + 평균 체류 8분 초과 시 1시간 TTL 옵션 |
| K3 | §5.4.2 | 직전 대화 3턴 캐시 미적용 가정 폐기 — Anthropic automatic multi-turn 캐싱 활용 |
| K4 | §5.4.2 | `cache_control` 위치 명시 — system 마지막 block + 챕터 컨텍스트 block에 explicit ephemeral |
| L1~L4 | §5.4.7 | **비용 표 3단** (uncached / Haiku+5m cache / Haiku+1h cache / Sonnet 부분 fallback) + DB 캐시 hit률 0/30/50% 시나리오 |
| M1 | §5.4.8 (新), §8 | **JSON 단발 응답** 정책 (streaming X — 4문장 이하라 불필요) |
| M2 | §11.6 (新) | API 키 관리 절차 (env / Render secret / 유출 시 revoke→reissue→재배포) |
| M3 | §5.4 주석 | "한국 region 한도" 표현 제거 → org tier 전역 |
| N1 | §9 PR #1 | architecture/CLAUDE.md AI 스택 갱신 작업 명시 |
| N2 | §11.7 (新) | 저작권 후처리 알고리즘 명세 — 8~12 token n-gram overlap + 80자 이상 substring 검출 |
| J1 | §13 (新) | **A/B eval 단계 신설** — preflight 전 Haiku vs Sonnet 20문항 비교, 통과 기준 명시 |
| J3 | §5.4.5 | Sonnet 자동 승급 트리거 — 재질문율 25% 초과 / 후처리 차단율 10% 초과 |
| J2, O1 | - | PASS — 변경 없음 |

### v1.3 → v1.4 (Codex 3차 검토 12건 중 REVISE 9건 반영)

| Codex ID | 반영 위치 | 핵심 변경 |
|----------|----------|----------|
| P1 | §5.4.2 | 캐시 prefix 토큰 수 **실측 절차** 명시 (PR #2 시작 시 71 Q&A에 tiktoken/anthropic tokenizer 돌려 챕터별 min/avg/p95 표 작성) |
| P2 | §5.4.2 | 작은 챕터(7장 3 Q&A·9장 4 Q&A) **3단 fallback** — few-shot/용어집 추가 → 인접 챕터 보강 → uncached 강등 |
| P3 | §5.4.7 | 단가 출처 각주 명시 (Haiku 4.5 base + 공식 cache multiplier) |
| P4 | §5.4.7 | **1h vs 5m break-even 수식** — `follow-up gap >5m && <1h가 1회 이상 발생 시 1h 유리, 아니면 5m 기본` |
| P5 | §5.4.5 | Sonnet 부분 fallback **학생 단위 고정 배정** — `hash(student_session_id) % 10 == 0 → 1주간 Sonnet` (요청 단위 랜덤 X, 실험 오염 방지) |
| P6 | §11.7 | 후처리 **인덱스 사전 빌드** (부팅 시 8-gram hash set + sentence set + normalized text) + p95 50ms 목표 |
| P7 | §5.4.7 | 비용표 footnote — `extra_calls = blocked_rate × retry_expectation` + blocked 5% × retry 2회 민감도 행 |
| P8 | §14.3 | A/B eval **블라인드 프로토콜** — 모델명 숨김 + 응답 순서 랜덤 + 2문항 rubric (이해 용이성 / 비유 자연스러움) |
| P9 | §14.3 | **층화 표본** — 5개 챕터군(컴퓨터 기초/개발/DB/네트워크/아키텍처·클라우드) × 4문항 = 20문항 |
| P10 | §11.6 | 예산 **ladder 액션** — 80% 경고 / 100% Sonnet fallback 일시중지 / 120% 신규 챗봇 차단 (DB 캐시 only) |
| 종합 | §14 | **preflight 순서 변경** — A/B eval **전**으로 (캐시 최소 토큰·모델 ID·비용식 확정 후 eval 돌려야 결과 해석 명확) |
| (추가) | architecture/CLAUDE.md | AI 행 + ai.ts 주석 Gemini → Claude 동기화 (v1.2~v1.3 누락 분) |

---

## §1 서비스 정체성

### 1.1
ai-app-builder의 **GuidePanel + ChatPanel + PreviewPanel 3컬럼** 구조를 그대로 재사용. **PreviewPanel 안에 사전 작성된 개념 시연 HTML을 iframe으로 띄우는** 학습용 변주. 학생이 매번 AI를 호출해 시연을 만들지 않는다.

### 1.2 모드·인원
- **세션 모드** (P0): 교사가 챕터 선택 → 6자리 코드/QR → 학생 참여
- **자율학습 모드** (P0): 로그인 사용자가 라이브러리에서 자유 열람
- 1세션 동시 인원: **100명** (read-heavy 기준 — §5.1 부하 모델 참조)

### 1.3 명칭 — **임시 고정**
- 임시 표기: **`Architecture`** (영문, 도메인 일치)
- 한국어 헤더 부속 표기: 없음 (헤더는 `Architecture`만)
- 정식 명칭 결정 시 **3곳만** 변경: `client/src/components/layout/ServiceHeader.tsx`, `client/index.html` (`<title>`/og), `pages/About.tsx`
- 목업 HTML 헤더의 "기술노트 아카데미" 표기는 PR #1에서 `Architecture`로 갱신

---

## §2 책 활용 정책

### 2.1 활용 범위 (저작권 방어선 강화)
- 책의 **목차 구조**: 학습 순서 참고 (10개 영역) — 표현은 차용 X
- **질문 제목**: 책 문구 그대로 X → **개념 추출 후 새 제목 재작성** (예: 책의 "프로그램, 프로세스, 프로세서의 차이가 뭔가요?" → "실행 중인 앱은 어떻게 표현될까")
- **본문**: 0% 인용
- **일러스트**: 0% 차용
- **출처 표기**: 푸터·about에 "참고 도서: 알렉 『기술노트』(2026)"

### 2.2 콘텐츠 생성 흐름
```
[1] 책 PDF (228p)
      ↓ Claude 오프라인 (PR #2~#11, 챕터당 1 PR)
[2] 챕터별 패키지 = 본문 Markdown + 시연 HTML(Q&A당 1개) + 퀴즈 JSON
      ↓ 검수 체크리스트 통과 시 머지
[3] /library 라이브러리에서 즉시 노출
```

### 2.3 알렉 작가 통지 — **머지 게이트**
- 사용자가 직접 통지·권리 조정
- **통지 회신 또는 사용자 명시적 리스크 승인 전에는 PR #2~#11 어떤 것도 머지 금지** (PR 본문에 게이트 체크박스)

---

## §3 콘텐츠 구조

### 3.1 챕터 트리 (Q&A 수는 책 기반, 실제 명칭은 §2.1대로 재작성)
| # | 챕터 | Q&A 수 |
|---|------|--------|
| 1 | 소프트웨어 개발 | 4 |
| 2 | 소프트웨어의 종류와 특징 | 4 |
| 3 | 개발 언어 및 프레임워크 | 12 |
| 4 | 개발 필수 지식 | 8 |
| 5 | 소프트웨어 공학 | 6 |
| 6 | 컴퓨터 구조와 운영체제 | 10 |
| 7 | 데이터베이스 기술 | 3 |
| 8 | 네트워크 기술 | 12 |
| 9 | 아키텍처 | 4 |
| 10 | 클라우드, 빅데이터, 인공지능 | 8 |
| **계** | | **71** |

### 3.2 한 Q&A 단위
- 재작성 제목 (자체 표현)
- 본문 4~6단락 (Claude)
- 키워드 칩 3~5
- **시연 1 HTML** (내부 hash로 4~5 시나리오, §12.2)
- 체크포인트 한 줄
- 퀴즈 3문항 (§12.6 검수 절차 통과)

---

## §4 페이지·라우팅 (D1 반영)

| 경로 | 화면 | 권한 |
|------|------|------|
| `/` | 랜딩 | 공개 |
| `/dev-login` | DEV 로그인 | 공개 |
| `/teacher` | 교사 대시보드 (내 세션 목록) — **새 세션 만들기는 모달** | 인증 |
| `/teacher/session/:id` | 세션 진행 (학생 진도 실시간) | owner |
| `/join` | 세션 참여 | 공개 |
| `/join?invalid=1` | 잘못된 코드 안내 | 공개 |
| `/join?closed=1` | 종료된 세션 안내 | 공개 |
| `/learn/:sessionId` | 학생 학습 (3컬럼) | 참여자 |
| `/library` | 자율학습 라이브러리 | 인증 |
| `/library/:chapterId/:qaId` | 자율학습 본문 (`/learn` 컴포넌트 재사용, mode=self) | 인증 |
| `/about` | 소개·출처 | 공개 |
| `/forbidden` | 권한 없음 | - |
| `*` | 404 | - |

`/teacher/new`는 BUILDER-UX-POLICY 정합 위해 제거, 대시보드 모달 사용.

---

## §5 핵심 기능 명세

### 5.1 교사 세션 + **부하 모델** (D2 반영)
- 챕터 1~10 다중 선택, 6자리 코드 + QR
- **100명 부하 모델 (P0 read-heavy 기준)**:
  | 트래픽 종류 | 추정 |
  |------------|------|
  | 학생 페이지 GET (본문/시연 정적 자산) | CDN/Render 정적 — 100명 × 평균 5 페이지 = 500 GET/세션 |
  | 학생 진도 PATCH (디바운스 0.6s) | 학생당 ≤10회/세션 = 1,000 write/세션, 분당 평균 ~30 write |
  | 학생 챗봇 POST | §5.4 강제 제한 |
  | 교사 대시보드 폴링 | 교사 1화면 = 6 GET/min |
- DB 동시 connection: 평균 < 20 (Supabase Free pooler 충분)

### 5.2 학생 참여 + 서명 토큰 (E2 반영)
1. `/join` → 코드 입력
2. 닉네임 입력
3. 서버가 `participant_id` 생성 + **서명 참여 토큰**(JWT) 발급 → 쿠키 + state
4. 이후 모든 학생 API 호출에 토큰 첨부 → **서버에서 검증 후 service_role로 DB 쓰기** (RLS는 service_role 통과)

### 5.3 학생 학습 화면 — 목업 v3 합의
(생략, 목업 그대로)

### 5.4 AI 챗봇 — **Claude API + 2계층 캐시** (v1.3 K1 결함 수정)

#### 5.4.1 모델 선택
- **기본**: **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)
  - 4문장 비유 답변 품질 충분, latency 짧음, 비용 합리적
  - 단가: input $1/1M, **5m cache write $1.25/1M**, **1h cache write $2.0/1M**, cache read $0.10/1M, output $5/1M
- **옵션 (자동 승급)**: §5.4.5 트리거 충족 시 Sonnet 4.6 (`claude-sonnet-4-6`)
  - 단가: 모든 항목 정확히 3배
- SDK: `@anthropic-ai/sdk`
- **rate limit 한도**: org tier 전역 (지역 한도 없음 — Anthropic 공식 문서 기준)

#### 5.4.2 Prompt Caching — **Haiku 최소 4096 토큰 만족 재설계** (K1 결정타 수정)

**Anthropic 공식 최소 캐시 가능 토큰**:
- Claude Haiku 4.5: **4,096 tokens**
- Claude Sonnet 4.6: **2,048 tokens**

**캐시 prefix 구성 (총 ~4,500 tok, Haiku 4096 충족)**:
```
[1] System block (~1,800 tok, cache_control: ephemeral 5m)
    - 저작권 차단 문구 (강) + 비유 규칙
    - 응답 형식 (4문장 이하, 한국어, 코드 X)
    - 모범 답변 예시 5개 + 금지 사례 5개 (학습 안정성)
    - "원작자 본문 복원 금지" 명시 (§11.7 후처리와 이중 안전장치)

[2] 챕터 컨텍스트 block (~2,700 tok, cache_control: ephemeral 5m)
    - 현재 챕터의 전체 Q&A 본문 (평균 7~10 Q&A) + 키워드 + 비유
    - 학생이 같은 챕터 안에서 다른 Q&A로 이동해도 재사용
```

**TTL 전략 (K2)**:
- 기본 5분 ephemeral
- **평균 학생 챕터 체류 8분 초과 또는 챗봇 평균 재호출 간격 5분 초과 측정 시 → 1시간 TTL** (`cache_control: { type: "ephemeral", ttl: "1h" }`)
- 운영 1주 후 analytics(§11.2 `chat_send` 이벤트)로 결정

**`cache_control` 위치 (K4)**:
- top-level automatic caching 대신 **explicit cache_control 채택** (제어 가능성)
- system 블록 마지막 + 챕터 컨텍스트 블록 두 곳에 `{ type: "ephemeral" }`
- messages 배열의 대화 히스토리는 Anthropic **automatic multi-turn caching에 위임** (대화 길어질수록 자동 prefix 전진, K3 반영)

**구현 예시**:
```ts
await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 300,
  system: [
    { type: "text", text: SYSTEM_PROMPT },
    { type: "text", text: chapterContext, cache_control: { type: "ephemeral" } },
  ],
  messages: [...history, { role: "user", content: question }],
});
```

**토큰 실측 절차 (P1 반영)**:
- §5.4.2의 "system 1,800 + 챕터 2,700 = 4,500" 은 **추정치**. PR #2 시작 시 **실측 필수**.
- 절차:
  1. PR #2에서 71 Q&A 본문 초안 작성 후
  2. `@anthropic-ai/tokenizer` 또는 Claude API `count_tokens` 엔드포인트로 챕터별 컨텍스트 토큰 수 측정
  3. 챕터별 표 작성: `chapter_id, qa_count, context_min/avg/p95_tokens`
  4. SDD §5.4.2 본문 추정치를 실측치로 교체 + 캐시 미달 챕터(< 4,096 - system) 표시

**작은 챕터 fallback 정책 (P2 반영)**:
챕터 컨텍스트가 verified min(=4,096 - system 1,800 = **2,296 tok**)에 미달 시 단계별 보강:
1. **1단계**: 챕터 전용 few-shot 답변 예시 3~5개 + 핵심 용어 사전 추가 (~500~1,000 tok 보충)
2. **2단계**: 1단계로도 미달 시 → 인접 챕터(같은 카테고리) 컨텍스트 일부 흡수
3. **3단계**: 위 2단계로도 미달 시 → 해당 챕터는 **uncached 경로로 강등** (캐시 적용 없이 매 호출 full input 단가)

작은 챕터 후보(추정): 7장 데이터베이스(3 Q&A), 9장 아키텍처(4 Q&A) — PR #2 실측 후 확정.

#### 5.4.3 자체 답변 캐시 (DB 레이어, 별개)
- 같은 `qa_id` + `question_hash`(SHA256(질문 정규화)) → DB 기존 답변 즉시 재사용 (LLM 호출 X)
- 표: `architecture_chats(qa_id, question_hash)` 인덱스
- 효과: "이거 다른 비유로" 같은 빈출 질문은 LLM 호출 0회

#### 5.4.4 강제 제한
- 학생당 **분당 1회**, 세션당 **누적 5회** (서버 큐+카운터)
- 세션 전체 **세마포어 max 3**

#### 5.4.5 Fallback + Sonnet 자동 승급 트리거 (J3)

**Fallback (rate limit / 장애)**:
- "잠시 후 다시" 토스트 + 30초 후 재시도 버튼
- DB 캐시 답변 자동 표시 (있으면)

**Sonnet 4.6 자동 승급 트리거** (운영 알림 → 운영자 결정):
- 최근 200건 챗봇 응답 중 **재질문율 25% 초과** ("다시 설명해줘", "이해 안 돼" 등 패턴 탐지)
- §11.7 후처리 차단율 **10% 초과** (Haiku가 책 본문을 자주 복원)
- 위 두 지표 중 하나라도 트리거 시 운영자 알림(이메일) → 1주 동안 Sonnet 부분 fallback (10%) 실측 → 결과 보고 → 전면 전환 결정

**Sonnet 부분 fallback 분배 단위 (P5 반영)**:
- **학생 단위 고정 배정** (요청 단위 랜덤 X — 같은 학생이 Haiku/Sonnet을 섞어 받으면 실험 오염)
- 알고리즘: `if (hash(student_session_id) % 10 === 0) → Sonnet for 1 week` (그 외 Haiku)
- 1주 후 Sonnet 그룹 vs Haiku 그룹의 재질문율·차단율·만족도 비교 → 전면 전환 여부 결정
- hash 함수: SHA256(participant_id || session_id) 첫 4바이트 정수화

#### 5.4.6 System Prompt 핵심
- "비전공자에게 일상 비유, 4문장 이하"
- "코드/명령어 X"
- **"원작자(알렉) 책 본문을 그대로 복원하지 않을 것. 자체 표현으로만"** (저작권 1차 방어)
- "모르면 모른다고"
- 모범 답변 5개 + 금지 사례 5개 few-shot (캐시 prefix에 포함됨, §5.4.2)

#### 5.4.7 비용 모델 — 3단 시나리오 (L1~L4 반영)

**가정**:
- 1회 호출: 학생 질문 ~50 tok + 직전 대화 ~600 tok = uncached input ~650 tok / output 200 tok
- 캐시 prefix 4,500 tok (system 1,800 + 챕터 2,700)
- 학생 1명당 5회 호출 (분당 1회 + 세션 누적 5회 제한)
- 100명 / 세션, 월 100세션 가정

**Haiku 4.5 + 5분 TTL 캐시**:
| 항목 | 계산 | 비용 |
|------|------|------|
| 첫 호출 (cache write) | 4,500 × $1.25/1M + 650 × $1/1M + 200 × $5/1M | $0.00728 |
| 이후 4회 (cache read) | 4,500 × $0.10/1M + 650 × $1/1M + 200 × $5/1M | $0.0021 |
| 학생 1명 합 | 0.00728 + 4 × 0.0021 | **$0.0157** |
| 세션 100명 | | **$1.57** |
| 월 100세션 | | **~$157** |

**시나리오 비교 (월 100세션, DB 캐시 hit률 별)**:
| 시나리오 | DB 0% | DB 30% | DB 50% |
|---------|-------|--------|--------|
| Haiku + 5m cache (기본) | $157 | $110 | $79 |
| Haiku + 1h cache (장기 체류 시) | $172* | $120 | $86 |
| Haiku **uncached only** (캐시 비활성) | $245 | $172 | $123 |
| Sonnet 4.6 + 5m cache (전면 fallback) | $471 | $330 | $236 |
| Sonnet 부분 10% fallback | $188 | $132 | $94 |

*1h cache write = $2.0/1M, 캐시 미만료 시 read 횟수 늘어 평균 비용 증가 가능

**단가 출처 (P3 PASS 권장 각주)**: Haiku 4.5 base price + Anthropic 공식 cache multiplier (5m write 1.25× / 1h write 2.0× / cache read 0.1×) 산출. 출처: docs.anthropic.com/en/docs/about-claude/pricing

**1h vs 5m break-even 수식 (P4 반영)**:
- `IF (한 학생의 follow-up gap > 5m && < 1h가 1회 이상 발생) → 1h 유리`
- `ELSE → 5m 기본 (Anthropic 공식 권장 "5분 이내 자주 호출 시 5m 유지")`
- 운영 측정: §11.2 `chat_send` 이벤트의 학생별 호출 간격 분포 → p50/p75/p95
- 1주 운영 후 분포가 "p75 > 5m" 이면 1h TTL 자동 전환

**재생성 비용 footnote (P7 반영)**:
위 표는 §11.7 차단 후 재생성 호출(0회)을 가정. 실제 운영 시:
- `extra_calls = blocked_rate × retry_expectation`
- 보수적 가정 (blocked 5% × retry max 2회):

| 시나리오 | DB 0% (재생성 +10%) |
|---------|---------------------|
| Haiku + 5m cache + 5% blocked × 2 retry | $157 × 1.10 = **$173** |
| Haiku + 5m cache + 10% blocked × 2 retry | $157 × 1.20 = **$188** |

운영 시 차단율 모니터링 → 5% 초과 시 §11.6 예산 ladder + §5.4.5 Sonnet 승급 트리거 동시 작동.

**월 예산 승인 권장**: **DB 0% + Haiku + 5m cache + 5% 차단 = $173/월**을 기준선으로 (보수적), 실측 후 재조정.

#### 5.4.8 응답 방식 — JSON 단발 (M1 반영)
- streaming SSE 사용 X
- 답변이 4문장 이하 짧음 → JSON 단발 응답으로 충분
- 구현 단순화 + ai-app-builder 챗봇 SSE 패턴 재사용 안 함

### 5.5 퀴즈 (§12.6 절차 적용)
3문항 객관식, 즉시 채점·해설, 점수 0~3 저장.

### 5.6 교사 대시보드 (D4 반영)
- 교사 화면 1개 = **10초 폴링 = 6 RPM** (백엔드 부담 미미)
- 학생측은 폴링 X — 진도 PATCH만 (디바운스 0.6s)
- P1 트리거: 한 세션 동접 100명 + 교사 다중 화면 사용 시 → SSE 전환

### 5.7 자율학습 — `/learn` 컴포넌트 재사용
`mode: 'session' | 'self'` + `actor: { participantId? | userId? }` props로 분기.

---

## §6 데이터 모델 (Supabase) — E1·E2·D5 반영

테이블 prefix `architecture_*`

```sql
-- 세션
create table architecture_sessions (
  id uuid primary key default gen_random_uuid(),
  code char(6) unique not null,
  name text not null,
  teacher_id uuid not null references auth.users(id),
  chapter_ids int[] not null,
  status text not null default 'active',
  max_participants int not null default 100,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index on architecture_sessions(teacher_id);
-- code 컬럼은 `unique` 제약 → PostgreSQL이 unique B-tree 인덱스 자동 생성 (별도 CREATE INDEX 불필요)

-- 학생 참여자
create table architecture_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references architecture_sessions(id),
  nickname text not null,
  joined_at timestamptz not null default now()
);
create index on architecture_participants(session_id);

-- 진도 (세션 모드 OR 자율학습 모드, 둘 중 하나)
create table architecture_progress (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id),
  user_id uuid references auth.users(id),
  qa_id text not null,
  read_at timestamptz,
  quiz_score int,
  -- 모드 분리: 둘 중 정확히 하나만
  constraint progress_mode_xor check (
    (participant_id is not null)::int + (user_id is not null)::int = 1
  )
);
-- 모드별 unique (upsert 키 분리)
create unique index progress_session_uniq on architecture_progress(participant_id, qa_id) where participant_id is not null;
create unique index progress_self_uniq on architecture_progress(user_id, qa_id) where user_id is not null;
create index on architecture_progress(participant_id);
create index on architecture_progress(user_id);

-- 챗봇 로그 (캐시 재사용 + 모니터링)
create table architecture_chats (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references architecture_participants(id),
  user_id uuid references auth.users(id),
  qa_id text not null,
  question_hash text not null,  -- 캐시 키
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  constraint chats_actor_xor check (
    (participant_id is not null)::int + (user_id is not null)::int = 1
  )
);
create index on architecture_chats(qa_id, question_hash);  -- 캐시 조회
create index on architecture_chats(participant_id, created_at);
create index on architecture_chats(user_id, created_at);
```

### RLS 정책 (E2 반영)
- **자율학습**: `auth.uid()` 기반 RLS — 본인 row만
  ```sql
  alter table architecture_progress enable row level security;
  create policy progress_self_rw on architecture_progress
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
  ```
- **세션 학생(익명)**: `auth.uid()` 없음 → RLS만으로 식별 불가능
  - 클라이언트는 DB 직접 호출 X
  - 모든 학생 쓰기는 **Express 서버 경유 + 서명 참여 토큰 검증** + service_role 키로 DB 접근
  - 토큰 페이로드: `{ participant_id, session_id, exp }` HMAC SHA256
- **교사**: `auth.uid()` = `teacher_id` RLS 그대로
  ```sql
  create policy sessions_owner_rw on architecture_sessions
    for all using (teacher_id = auth.uid());
  ```

---

## §7 디자인
shared/DESIGN-POLICY.md, BUILDER-UX-POLICY.md 준수. 목업 합의: `mockups/student-learn.html` v3.

---

## §8 기술 스택

| 영역 | 선택 |
|------|------|
| Client | React 19 + Vite 8 + TS + Tailwind v4 |
| Server | Express 5 + TS |
| DB | Supabase (PostgreSQL + Auth) |
| AI | **Claude Haiku 4.5** (`@anthropic-ai/sdk`) + Anthropic prompt caching (4500 tok prefix, 5분 TTL 기본 / 1h 옵션) + DB 답변 캐시 + **JSON 단발 응답** (streaming X) |
| 인증 | 카카오 OAuth (교사) + DEV 로그인 + 서명 참여 토큰(학생) |
| 마크다운 | react-markdown + remark-gfm |
| QR | qrcode.react |
| 배포 | Render Starter + Cloudflare DNS |
| GitHub | 독립 레포 |

---

## §9 구현 단계 (PR 분할) — Codex C1·F1·F2 반영

### 인프라 (병렬 가능)
| PR | 범위 |
|----|------|
| #1 | 프로젝트 스캐폴드 (Vite/Tailwind/Express/Supabase, ServiceHeader, 로고, 임시 명칭 `Architecture`) + **architecture/CLAUDE.md AI 스택 갱신** (Claude Haiku 4.5, prompt caching 4500 tok prefix, JSON 단발) — N1 반영 |
| #4A | 학습 화면 UI — `/library`, 본문 렌더, 시연 iframe 전환, ChatPanel 골격 |
| #4B | 퀴즈 엔진 + 진도 저장 (캐시·UNIQUE) |
| #5 | AI 챗봇 (**Claude Haiku 4.5**, prompt caching 4500 tok prefix, JSON 단발, DB 캐시, rate limit, fallback, Sonnet 자동 승급 트리거) |
| #6 | 교사 세션 만들기(모달) + 대시보드(폴링) + 학생 참여(`/join`, 서명 토큰) |
| #7 | 카카오 OAuth(교사) + DEV 로그인 + 권한 게이트 + `/forbidden` |
| #8 | 랜딩 + about + 404 + 배포 (Render + Cloudflare DNS) |

### 콘텐츠 (챕터당 1 PR — Codex 권장 균형)
| PR | 챕터 | 묶음 |
|----|------|------|
| #2 | 1장 (4 Q&A) | 본문 + 시연 HTML 4 + 퀴즈 12 |
| #3 | 2장 (4) | 〃 |
| (#9 이후 번호 계속) … | 3~10장 | 〃 |
| #11 | 10장 (8) | 〃 |

> **알렉 작가 통지 게이트**: 콘텐츠 PR 9개(#2, #3, 그리고 #9~#15 가칭) 모두 통지 회신 또는 사용자 명시적 승인 전에는 머지 X.
> 머지 정책: 1 마일스톤 = 1 커밋 = 1 PR.

---

## §10 위험·제약 (H1 반영)

| 항목 | 영향 | 대응 |
|------|------|------|
| 책 저작권 (질문 표현 차용) | High | 질문 제목 자체 재작성 (§2.1) + 통지 게이트 (§2.3) |
| **iframe 시연 XSS** | High | 시연 iframe `sandbox="allow-scripts"` (origin 격리) + 시연 HTML 빌드 시 lint |
| **챗봇 책 본문 재현** | High | system prompt 차단 (§5.4.6) + 답변 후처리 알고리즘 (§11.7, n-gram + substring 검출) |
| **Claude API rate limit / 장애 fallback** | Med | DB 답변 캐시 우선 + 30초 재시도 + 토스트 안내 (§5.4.5) |
| **Claude API 비용 폭주 (악용)** | Med | 학생당 분당 1회·세션 5회 강제 제한 + abuse throttling (§11.5) + 월 비용 알림 |
| **모바일 phone-frame 시연 가시성** | Med | 모바일에서 시연 탭 진입 시 phone-frame 대신 풀화면 iframe + "전체화면" CTA 강조 |
| 100명 부하 (write 1,000/세션) | Med | Supabase Free pooler 한도 내 + 디바운스 0.6s (§5.1) |
| Render Starter 콜드 | Med | UptimeRobot 사전 핑 |
| 카카오 OAuth rate limit (교사 N명 동시) | Low | 교사는 사전 로그인 — 학생은 OAuth 미사용(서명 토큰) |

---

## §11 운영 항목 (I1 반영)

### 11.1 a11y
- 키보드 네비게이션: GuidePanel 스텝 점/시연 버튼/탭 모두 `Tab` 순회
- aria-label: 시연 진입 버튼, 퀴즈 옵션, 탭바
- 색 대비: stone-600 본문 7.61:1 AAA 유지
- iframe `title` 속성 필수

### 11.2 Analytics 이벤트 (서버 로그 적재)
| 이벤트 | 페이로드 |
|-------|---------|
| `chapter_enter` | `{ chapterId, mode, actor }` |
| `qa_enter` | `{ qaId, mode, actor }` |
| `demo_click` | `{ qaId, scenario }` |
| `quiz_submit` | `{ qaId, score }` |
| `chat_send` | `{ qaId, cached: bool }` |
| `session_end` | `{ sessionId, duration_s, completed_qas }` |

이탈 위치 추적 = 마지막 `qa_enter`에 머문 시간.

### 11.3 서버 로그 키
요청별 `{ requestId, sessionId?, participantId?, userId?, route, status, duration_ms }`

### 11.4 재시도 / 오프라인
- 진도 PATCH 실패 → 큐에 보관 + 재연결 시 일괄 전송
- 챗봇 fallback (§5.4)
- 본문/시연은 정적 자산이라 PWA Service Worker로 오프라인 캐싱 (P1)

### 11.5 Abuse throttling
- 같은 IP에서 분당 `/join` 시도 > 30 → 1분 차단
- 한 참여자가 5분 안에 챗봇 누적 호출 > 10 → 세션 자동 잠금 (교사 알림)

### 11.6 Anthropic API 키 관리 (M2 반영)
- **저장**: `ANTHROPIC_API_KEY` 환경변수, Render dashboard secret (Git에 절대 커밋 X, `.env`는 `.gitignore`)
- **접근 범위**: server/src/ai.ts에서만 사용. 클라이언트 절대 노출 X
- **로테이션 절차** (유출 의심 시):
  1. Anthropic console에서 기존 키 즉시 revoke
  2. 새 키 issue
  3. Render dashboard secret 업데이트
  4. 서비스 재배포 (manual deploy)
  5. 이전 키로 발생한 비용/로그 분석 → 사용자에게 보고
- **모니터링**: Anthropic console 일일 사용량 + 월 예산 ladder (P10 반영)

**월 예산 ladder** (기준선 $173 = §5.4.7):
| 사용률 | 액션 |
|-------|------|
| 80% (~$138) | **경고 알림** (운영자 이메일) — 사용 패턴 확인, 챕터별 호출 분포 점검 |
| 100% (~$173) | **Sonnet fallback 일시중지** — 모든 학생 Haiku 강제 (P5 부분 fallback 일시 OFF) |
| 120% (~$208) | **신규 챗봇 차단** — 신규 호출은 DB 캐시 답변만 응답, LLM 호출 X. 운영자 긴급 검토 |
| 150% (~$260) | **챗봇 기능 전체 OFF** — 학생 UI에서 챗봇 탭 비활성, 시연·퀴즈만 노출 |

### 11.7 챗봇 답변 저작권 후처리 알고리즘 (N2 반영)
**기준 corpus**: 책 PDF 추출 텍스트 (228p, ~80k tokens, 정규화 후 보관)

**검출 규칙** (Claude 응답 → 차단 판정):
- (a) **8-token n-gram overlap**: 답변과 corpus의 8연속 단어 겹침 > 1건 → 차단
- (b) **연속 80자 이상 substring**: 답변에 corpus의 80자 이상 연속 substring 포함 → 차단
- (c) **문장 단위 exact match**: 답변 문장 1개라도 corpus 문장과 정확히 일치 → 차단

**인덱스 사전 빌드 (P6 반영)** — 매 요청마다 80k corpus 비교는 latency 위험. 부팅 시 1회 빌드:
```ts
// server/src/copyright-index.ts (앱 부팅 시 메모리 로드)
const CORPUS_NORMALIZED: string;          // 정규화된 corpus 전체 텍스트
const NGRAM_8_HASH_SET: Set<string>;       // 8-token n-gram → SHA256 해시 set
const SENTENCE_SET: Set<string>;           // 문장 단위 정규화 텍스트 set
```
**검증 latency 목표**: **p95 ≤ 50ms** per 답변 (max 2회 재생성 포함 시 p95 ≤ 150ms)

**차단 시 처리**:
- 1차: 같은 컨텍스트로 자동 재생성 (max 2회, 매번 기존 차단 답변을 system prompt에 negative example로 추가)
- 2차: 재생성도 차단 시 → "다른 비유로 설명해줘" 안내 메시지 + 학생에게 다른 질문 권유
- 차단 이벤트는 `architecture_chats.blocked_count` 컬럼에 기록 → §5.4.5 Sonnet 승급 트리거 입력

**구현 위치**: server/src/ai.ts의 응답 검증 단계 (Claude 호출 → 후처리 → DB 저장 순)

---

## §12 시연 정책 — G2·G3 반영

### 12.1 시연 = 사전 작성된 인터랙티브 HTML
학생이 매번 AI 생성 X. Claude 오프라인 → repo 정적 자산 → iframe `srcdoc`로 phone-frame.

### 12.2 한 Q&A = 1 HTML, **내부 hash로 4~5 시나리오** (G2)
- 1 시연 HTML 안에 시나리오 4~5개 (`#scenario-launch`, `#scenario-multi`, …)
- 좌 GuidePanel "약속된 버튼" 클릭 → iframe **src 그대로 + `contentWindow.location.hash` 변경** → 리로드 X
- ai-app-builder의 hash routing 패턴 차용 (BuilderPage screens hash)
- 결과: **시연 HTML 총 71개** (Q&A당 1, 기존 280개 → 작성 부담 4배 감소)

### 12.3 파일 컨벤션 (G3)
```
client/public/demos/
├── ch01/
│   ├── q01.html     # 내부 hash로 시나리오 전환
│   ├── q02.html
├── ch06/
│   ├── q03.html     # #launch / #multi / #cpu / #kill
```

### 12.4 메타데이터
```ts
// client/src/data/demos.ts
{ qaId: 'ch06_q03',
  url: '/demos/ch06/q03.html',
  scenarios: [
    { id: 'launch', label: '카톡 실행 — 프로세스 만들어지기' },
    { id: 'multi',  label: '같은 앱 두 번' },
    { id: 'cpu',    label: 'CPU가 일하는 모습' },
    { id: 'kill',   label: '앱 종료' },
  ]}
```

### 12.5 시연 HTML 제약
- 단일 HTML, 외부 의존 0, 인라인 JS/CSS
- 모바일 폰 가정 (phone-frame 320×640)
- **개념 마이크로시연** — 게임형 X, 학습 도구임
- 시각화 + 실시간 로그 표기
- iframe sandbox `allow-scripts` (저장소 cross-origin 격리)

### 12.6 콘텐츠 검수 체크리스트 (PR 머지 전 필수, C2 반영)
한 Q&A의 본문/시연/퀴즈 묶음마다:
- [ ] 본문이 책 표현 비유 X (자체 표현)
- [ ] 시연 4~5 시나리오 모두 동작 확인
- [ ] 시연이 sandbox iframe에서 정상 렌더
- [ ] 퀴즈 정답 단일 (모호성 X)
- [ ] 퀴즈 오답지 그럴듯하게 (랜덤 1~2단어 X)
- [ ] 해설 1~2문장
- [ ] 모바일에서 풀화면 시연 가독성

---

## §13 결정 완료
v1과 동일 (명칭 → `Architecture` 임시 고정으로 변경).

## §14 다음 단계 (v1.4 갱신, **순서 변경**: preflight ↔ A/B eval)

1. ✅ SDD-v1.4 (이 문서)
2. ⏭ **사용자 OK** ← 현재
3. ⏭ **preflight 실행** (Codex 종합 권장 — A/B eval **전**으로 변경)
   - 목표: 캐시 최소 토큰·모델 ID·비용식·SDK 호환성·Supabase 정합성을 PR #1 시작 전 자동 검증
   - 항목: Anthropic SDK 패키지 버전, prompt caching 응답 구조, 모델 ID 유효성, Supabase RLS 정책 dry-run, Render Starter cold start 측정, Cloudflare DNS 사전 등록 가능 여부
   - 출력: PASS/WARN/FAIL 리포트
4. ⏭ **A/B eval 단계** (Codex J1·P8·P9 권장, preflight 통과 후)
   - **목표**: Haiku 4.5가 우리 use case에 충분한지 검증
   - **샘플 (P9 층화 표본)**: 5개 챕터군 × 4문항 = **20문항**
     - 컴퓨터 기초 (1·6장): 4문항
     - 개발 (2·3·5장): 4문항
     - DB (4·7장): 4문항
     - 네트워크 (8장): 4문항
     - 아키텍처·클라우드·AI (9·10장): 4문항
   - **비교**: Haiku 4.5 vs Sonnet 4.6 동일 system prompt + 챕터 컨텍스트
   - **블라인드 프로토콜 (P8 반영)**:
     - 모델명 숨김 (응답 라벨 = `Model A` / `Model B`, 매 문항 A/B 위치 랜덤)
     - 평가자에게 어느 쪽이 Haiku/Sonnet인지 비공개
     - 평가 rubric 2문항 (각 5점 척도):
       - **이해 용이성**: 비전공자가 4문장 안에 개념을 파악할 수 있는가
       - **비유 자연스러움**: 비유가 한국 일상에서 즉시 떠올리기 쉬운가
   - **통과 기준** (Haiku 확정):
     - 4문장 이하 준수율 ≥ 90%
     - 이해 용이성 평균 ≥ 4.0
     - 비유 자연스러움 평균 ≥ 4.0
     - 정답성 (운영자 검수 PASS율) ≥ 85%
     - §11.7 후처리 차단율 < 5%
   - **평가자 구성**: 운영자 1명 + 비전공자 시범 사용자 2~3명 (블라인드)
   - **결과**: 5개 모두 통과 시 Haiku 확정 / 1개 이상 미통과 시 Sonnet 기본 + Haiku fallback (비용 영향 §5.4.7 표)
5. ⏭ GitHub 레포 생성 (`teachermate/architecture`) + PR #1 시작
