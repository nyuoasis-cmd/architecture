# Architecture Academy A/B Eval

> SDD §14.4 단계 — Haiku 4.5 vs Sonnet 4.6 블라인드 비교 (20문항, 5군 × 4)

## 파일

| 파일 | 용도 |
|------|------|
| `questions.md` | 20문항 (5개 챕터군 × 4) |
| `run-eval.mjs` | Anthropic API 호출 + 블라인드 결과 markdown 생성 |
| `rubric.md` | 평가 기준 (이해 용이성 / 비유 자연스러움 / 정답성) + 통과 기준 |
| `results-{ts}-blind.md` | 평가자에게 전달 (모델명 숨김) |
| `results-{ts}-truth.md` | 정답표 (평가 후 공개) |

## 실행 절차

### 1. 사전 준비 (사용자)
```bash
# Anthropic API 키 발급 (https://console.anthropic.com/)
export ANTHROPIC_API_KEY=sk-ant-...

# SDK 설치 (eval 전용 임시 디렉토리도 OK)
cd /home/claude/architecture/ab-eval
npm init -y
npm install @anthropic-ai/sdk
```

### 2. 실행
```bash
node run-eval.mjs
```

**예상 비용 (1회 실행)**:
- 20문항 × 2모델 = 40 호출
- 각 호출 평균 input ~150 tok + output ~200 tok (캐시 미적용)
- Haiku: 20 × (150 × $1/1M + 200 × $5/1M) = **~$0.023**
- Sonnet: 20 × (150 × $3/1M + 200 × $15/1M) = **~$0.069**
- **총 ~$0.10**

### 3. 결과
- `results-{ts}-blind.md` — 평가자에게 전달
- `results-{ts}-truth.md` — 평가 후 공개

### 4. 평가 (사용자 + 비전공자 2~3명)
- `rubric.md` 기준
- blind.md를 보면서 각 문항의 A/B 응답에 대해 5점 채점
- 평가 완료 후 truth.md 공개 → 어느 모델이 Haiku/Sonnet이었는지 확인
- 통과 기준 5개 모두 충족 시 Haiku 확정

### 5. 결과 기록
`/home/claude/architecture/ab-eval/decision-{ts}.md`에 저장:
- 통과 기준별 결과
- 최종 결정 (Haiku 확정 / Sonnet fallback / 부분 fallback)
- SDD §5.4.1 모델 결정 근거로 인용

## 통과 기준 (rubric.md 요약)

- [ ] 4문장 이하 준수율 ≥ 90%
- [ ] 이해 용이성 평균 ≥ 4.0
- [ ] 비유 자연스러움 평균 ≥ 4.0
- [ ] 정답성 PASS율 ≥ 85% (운영자 평가)
- [ ] §11.7 후처리 차단율 < 5% (PR #5 통합 후 재측정)
