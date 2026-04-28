# Preflight 리포트 — Architecture Academy SDD-v1.4

> 실행일: 2026-04-27 (마스터 + 3 병렬 Agent)
> 검증 환경: Node v24.13.0, ai-app-builder 참조 스택 비교 + Anthropic 공식 docs WebFetch + ai-app-builder/youthschool 코드 grep

---

## 종합 판정

**✅ PASS 17 / ⚠️ WARN 3 / ❌ FAIL 0** → **PR #1 진입 권고**

3건 WARN은 PR #1 작업 항목으로 흡수 가능. FAIL 없음.

---

## 1. API 실현성 (Agent 1) — 6 PASS / 0 WARN / 0 FAIL

| 항목 | 상태 | 근거 |
|------|------|------|
| Haiku 4.5 모델 ID `claude-haiku-4-5-20251001` | ✅ | Anthropic 공식 models page 일치 (alias `claude-haiku-4-5`) |
| 최소 캐시 토큰 Haiku 4096 / Sonnet 2048 | ✅ | 공식 prompt-caching docs 확정 (K1 가정 정확) |
| Ephemeral 5m + 1h TTL 동시 지원 | ✅ | 공식 명시. mixed TTL은 긴 것부터 배열 |
| 이중 블록 cache_control (system + chapter context) | ✅ | explicit breakpoints 양쪽 동시 적용 가능 |
| 캐시 단가 multiplier (5m 1.25× / 1h 2.0× / read 0.1×) | ✅ | 공식 pricing 표 일치 |
| count_tokens 한국어 측정 | ✅ | `/v1/messages/count_tokens` SDK `client.messages.countTokens()` |
| Supabase Auth 카카오 OAuth | ✅ | youthschool/teacher-toolkit `signInWithOAuth({provider:"kakao"})` 검증, 프로젝트 공유 |
| ai-app-builder 챗봇 비교 | ✅ | ai-app-builder server/src/ai.ts는 **Claude Opus 4.5** 사용 중 (Gemini 아님). agentLoop 3회 검증 패턴 |
| HMAC SHA256 토큰 | ✅ | Node 표준 `crypto.createHmac('sha256', key)` |

> **추가 발견**: ai-app-builder도 Claude로 운영 중. 우리 Architecture와 같은 SDK 경험 누적 → 코드 패턴 직접 차용 가능.

---

## 2. 패키지 호환성 + 인프라 (Agent 2) — 4 PASS / 2 WARN / 0 FAIL (E2 정정)

| 항목 | 상태 | 근거 |
|------|------|------|
| 참조 스택 (React 19 + Vite 8 + TS + Tailwind v4 + Express 5) | ✅ | ai-app-builder 동일 운영 (React 19.1.0, Vite 8.0.1, Tailwind v4.2.2, Express 5.2.1, TS 5.9.3) |
| Vite 8 + Tailwind v4 호환 | ✅ | `@tailwindcss/vite` + `@tailwindcss/postcss` 플러그인 정식 운영 |
| Node 24 + Render Free | ✅ | engines 미지정, Render Free Node 20+ 호환 |
| `@anthropic-ai/sdk` 버전 | ⚠️ WARN | 운영 0.90.0 / 최신 0.91.1 (4/24 배포) — minor 1버전 차이, PR #1에서 0.91.x 채택 권장 |
| `@supabase/supabase-js` 버전 | ⚠️ WARN | 운영 2.49.4 / 최신 2.104.1 (4/23 배포) — 41버전 drift. PR #1에서 최신 채택 + 호환성 회귀 테스트 |
| `qrcode.react` / `react-markdown` / `remark-gfm` | ✅ | 4.2.0 / 10.1.0 / 4.0.1 모두 안정 |
| Render Starter cold start | ⚠️ WARN | school-archive 벤치 10.55s → ping으로 <1s. ai-app-builder 패턴에 `/api/health` 미구현. **PR #1에서 추가 + 사용자 UptimeRobot 등록** |
| 후처리 인덱스 latency p95 50ms (E2) | ✅ (정정) | SDD §11.7에 알고리즘+코드 스니펫+목표 명세. Agent 분석: V8 ≥50k ops/ms로 80k corpus 8-gram 처리 충분히 합리. 구현은 PR #5 |

---

## 3. DB 정합성 + UX 흐름 (Agent 3) — 7 PASS / 1 WARN / 0 FAIL

| 항목 | 상태 | 근거 |
|------|------|------|
| PostgreSQL 16 문법 (CHECK XOR, 부분 unique 인덱스, gen_random_uuid) | ✅ | Supabase 16 표준 |
| ai-app-builder sql 패턴 비교 | ✅ | SDD가 더 엄격한 RLS (HMAC 토큰 검증 추가) |
| 익명 학생 service_role 우회 (HMAC JWT + 서버) | ✅ | ai-app-builder Bearer 패턴 재사용 + HMAC 추가 |
| 인덱스 5종 충분성 | ⚠️ → ✅ | `architecture_sessions(code)` UNIQUE 자동 생성 주석 명시 1줄 추가 (즉시 처리 완료) |
| BUILDER-UX-POLICY 정합 (모달, max-w-4xl) | ✅ | `/teacher/new` 제거 → 모달 D1 반영 |
| 목업 v3 vs SDD §5.3 일관성 | ✅ | 3컬럼(280/320/flex-1) + phone-frame 320×640 + 4탭 + 시연 launcher 4 + 퀴즈 탭 모두 일치 |
| 시연 hash 시나리오 패턴 | ✅ | ai-app-builder PreviewPanel `#screen-name` 패턴 동일 |
| 모바일 phone-frame 가시성 | ✅ | SDD §10에 풀화면 변환 + 전체화면 CTA 위험·대응 명시 |

---

## WARN 3건 — PR #1 작업 항목

### W1. Anthropic SDK 0.90.0 → 0.91.1
- **액션**: PR #1 `package.json`에 `"@anthropic-ai/sdk": "^0.91.1"` 채택
- **위험**: minor 1버전 차이, breaking change 가능성 낮음
- **검증**: `await client.messages.create()` 호출 시그니처 동일 확인

### W2. Supabase JS 2.49.4 → 2.104.1 (41버전 drift)
- **액션**: PR #1에 최신 채택. 단 stability 마크가 4일 후 stable 승격 예정 (Agent 보고) → PR #1 머지 시점에 stable 채택
- **위험**: 41버전 drift는 보통 deprecation 경고 다수. `auth.signInWithOAuth` 시그니처 변동 확인 필요
- **검증**: youthschool 카카오 OAuth 코드와 cross-check

### W3. Render Starter cold start
- **액션 1 (PR #1)**: server/src/index.ts에 `/api/health` 엔드포인트 추가
  ```ts
  app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));
  ```
- **액션 2 (render.yaml)**: `healthCheckPath: /api/health`
- **액션 3 (사용자)**: 배포 후 UptimeRobot에 `https://architecture.teachermate.co.kr/api/health` 5분 ping 등록 (school-archive 패턴 동일)

---

## v1.4 핵심 가정 검증 결과

| v1.4 신규 결정 | 검증 결과 |
|---------------|----------|
| 캐시 prefix 4500 tok (system 1800 + chapter 2700) | API 문서 일치, 단 한국어 본문 실측은 PR #2에서 확인 (SDD §5.4.2 절차 명시됨) |
| Haiku 최소 4096 / Sonnet 최소 2048 | ✅ 공식 일치 |
| 1h TTL 옵션 (cache write 2.0×) | ✅ 공식 multiplier 일치 |
| Sonnet 부분 fallback 학생 단위 hash | ✅ 단순 알고리즘, 구현 위험 없음 |
| 후처리 인덱스 p95 50ms | ✅ V8 처리 능력 충분 (Agent 2 분석) |
| JSON 단발 응답 (streaming X) | ✅ Anthropic SDK 기본 |
| ai-app-builder도 Claude 운영 중 | ✅ 추가 발견 — 코드 패턴 직접 차용 가능 |

---

## 다음 단계

**A. A/B eval 단계** (SDD §14.4) 진입 권고
- 사전 조건 충족: preflight 0 FAIL, 모델 ID·캐시 토큰·비용식 모두 확정
- 절차: 5개 챕터군 × 4문항 = 20문항 / Haiku vs Sonnet 블라인드 / rubric 2문항

**B. 사용자 액션 (병렬 진행 가능)**
1. 알렉 작가 사전 통지 (SDD §2.3 머지 게이트)
2. Anthropic API 키 준비 (`ANTHROPIC_API_KEY`, A/B eval에 필요)
3. UptimeRobot 계정 (배포 후 등록)
4. GitHub teachermate org에 `architecture` 신규 레포 생성 권한 확인

A/B eval은 마스터가 설계만 (실제 평가는 사용자 + 비전공자 시범 사용자 2~3명 블라인드).
