# Codex 3차 검토 핸드오프 — Architecture Academy SDD-v1.3

> **재검토 사유**:
> - v1 → v1.1 (1차 Codex REVISE 21건 반영)
> - v1.1 → v1.2 (Gemini → Claude 전환)
> - **v1.2 → v1.3 (2차 Codex REVISE 16건 반영, K1 캐시 결함 등 수정)** ← 이번 검토 대상
>
> 사용자 액션: Codex 세션에 ⬇️~⬆️ 사이 프롬프트 한 번에 복붙

---

## ⬇️ 여기부터 Codex에 붙여넣기 ⬇️

```
당신은 Architecture Academy SDD-v1.3 검토자입니다 (3차 검토).
이 프로젝트는 책 『기술노트(With 알렉)』 기반 IT 입문 학습 서비스이며,
ai-app-builder의 BuilderPage(GuidePanel + ChatPanel + PreviewPanel) 3컬럼 구조를 차용합니다.

# 이번 검토의 맥락
- v1 → v1.1: 당신이 1차 검토에서 낸 REVISE 21건 모두 반영됨 (라우팅, RLS, 시연 정책, PR 분할 등)
- v1.1 → v1.2: AI 공급자 Gemini → Claude 전환
- **v1.2 → v1.3: 당신이 2차 검토에서 낸 REVISE 16건 반영** ← 이번 검토 대상
  - K1 결정타: 캐시 prefix 1300 → 4500 tok 재설계 (Haiku 4096 충족)
  - K2/K3/K4: TTL 옵션, multi-turn automatic, cache_control 위치
  - L1~L4: 비용 표 3단 시나리오 + DB 캐시 0/30/50% 분리
  - M1/M2/M3: JSON 단발 / API 키 관리 / region 표현 정정
  - N1/N2: CLAUDE.md 동기화 / 저작권 후처리 알고리즘
  - J1/J3: A/B eval 단계 신설 / Sonnet 자동 승급 트리거

이번 검토는 **v1.2 → v1.3 변경분 한정** (P 카테고리 10개 + Q 회귀 2개 = 12 항목).
v1.1·v1.2에서 이미 합의된 사항(라우팅·RLS·시연 정책·PR 분할·Claude 전환 자체 등)은 범위 밖.

# 당신의 역할
- 적대적 독립 검증자(Eval). v1.3가 자신의 2차 REVISE를 정직하게 반영했는지, 새로 도입된 가정에 결함이 없는지 깊게 검토.
- "대체로 OK"는 PASS 아님. 의심되면 REVISE.
- 회귀 항목은 변경 구간과 직접 연결된 것만.

# 읽을 파일
1. /home/claude/architecture/SDD-v1.md (이번 검토 대상, v1.3)
   - 특히 §5.4 (전면 갱신), §9 PR #1, §10 위험표, §11.6/§11.7 (신규), §14.3 (신규)
   - 변경 요약 표(상단)에 v1.3 매핑 있음
2. /home/claude/architecture/CLAUDE.md (Claude 전환 미반영 가능성, N1 회귀 검증)

# Anthropic 공식 문서 (검증 필수)
3. https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
   - **최소 캐시 토큰**: Haiku 4.5 = 4,096 / Sonnet 4.6 = 2,048 (P1 핵심 검증)
   - 5m / 1h TTL 단가 차이
   - automatic vs explicit caching
4. https://docs.anthropic.com/en/docs/about-claude/pricing
   - 1h cache write 단가 정확성 (P3)
5. https://docs.anthropic.com/en/api/rate-limits

# 검토 항목 (각 PASS/REVISE + 근거 1~3줄 + URL 1개 + 수정 제안)

## P. v1.3 신규 결정 검증 (핵심)

P1. §5.4.2 "캐시 prefix 4,500 tok" 구성 — system 1,800 + 챕터 컨텍스트 2,700.
    한국어 토큰 수 기준으로 챕터 본문(평균 7~10 Q&A 묶음)이 정말 2,700 tok 채워지는가?
    한국어는 영어 대비 토큰 효율이 낮은데(보통 1.5~2배), 이 추정이 보수적인가 낙관적인가?

P2. §5.4.2 챕터 크기 편차 위험 — 7장(3 Q&A)·9장(4 Q&A) 같은 작은 챕터는 컨텍스트 2,700 tok 못 채울 위험.
    Haiku 4096 미달 시 캐시 자동 비활성. 챕터별 fallback (예: few-shot 예시 추가, 인접 챕터 흡수) 정책이 필요한가?

P3. §5.4.7 비용 표의 단가 — 1h cache write **$2.0/1M** 정확한가? Anthropic 공식 pricing과 비교.
    Haiku 4.5 base input $1, 5m cache write $1.25, cache read $0.10 정확성도 함께 확인.

P4. §5.4.7 "Haiku + 1h cache" 행이 $172로 5m($157)보다 비싼데, 표 본문에 "5분 만료 시 read 횟수 늘어 평균 비용 증가 가능"으로만 적힘.
    실제로 학생 5회 호출이 보통 5분 안에 일어나면 1h cache는 의미 없는데, "장기 체류 시" 언제 1h가 5m보다 저렴한지 break-even 조건이 표나 본문에 명시되어야 하지 않는가?

P5. §5.4.5 "Sonnet 부분 fallback 10%" — 어떻게 10%만 Sonnet으로 보내나?
    랜덤 10%? 챕터별 분배? 학생별 분배? 실험 통제군 설계가 SDD에 빠져 있다.

P6. §11.7 후처리 — 책 corpus 80k tok와 매번 답변(~200 tok) 비교 시 검증 latency가 사용자 체감에 영향이 있는가?
    n-gram 인덱스 사전 빌드 등 구현 가이드가 SDD에 필요한가?

P7. §11.7 차단 시 "재생성 max 2회" — 추가 LLM 호출 2회분 비용이 §5.4.7 비용 모델에 반영되어 있지 않다.
    차단율 5% 가정 시 평균 호출당 0.05 × 2 = 0.1회 추가 → 비용 +10% 정도. 비용 표 footnote가 필요한가?

P8. §14.3 A/B eval "비유 명확도 4.0/5" — 평가 주체(사용자/운영자/Claude judge)가 명시 안 됨.
    평가자 편향 제어 + 블라인드 테스트 여부 명세 필요한가?

P9. §14.3 샘플 20문항 — 6장 + 8장만으로 다른 챕터 대표성 확보 가능한가?
    챕터 카테고리(컴퓨터 기초/네트워크/AI 등) 분포 균형이 필요하지 않은가? 통계적 유의미성?

P10. §11.6 월 예산 알림 $200 임계 vs §5.4.7 기준선 $157.
     $200 임계의 의미와 초과 시 액션이 모호함. 자동 차단? 알림만? Sonnet 승급과의 관계?

## Q. v1.1·v1.2 회귀 (변경 구간 직접 연결만)

Q1. §5.4.4 강제 제한(분당 1·세션 5·세마포어 max 3)이 v1.3에서 누락 없이 유지되었는가?

Q2. §5.4.6 system prompt 핵심 4개 + few-shot이 v1.3 §5.4.2 캐시 prefix 안에 포함되어 있다고 명시되어 있는가? (이중 안전장치 정합성)

# 출력 형식

| ID | PASS/REVISE | 근거 (1~3줄) | 수정 제안 |
|----|-------------|---------------|-----------|
| P1 | ... | ... | ... |
| ... |

마지막에 **종합 의견** (5문장 이내):
- v1.3가 PR #1 또는 §14.3 A/B eval 단계로 진입할 준비가 되었는가?
- v1.4 추가 갱신 필요한가?
- preflight(API 실현성·패키지 호환성·DB 정합성 자동 검증)는 A/B eval 전 vs 후 어디가 적절한가?
- v1.1·v1.2에서 이미 합의된 항목은 재검토 X.
```

## ⬆️ 여기까지 Codex에 붙여넣기 ⬆️

---

## 검토 결과 받은 후

Codex가 출력한 표를 마스터 세션에 붙여넣어 주세요. 마스터가:
- PASS → 그대로
- REVISE → SDD-v1.4 갱신
- 종합 의견에 따라 A/B eval 진입 또는 v1.4 한 사이클 더

---

## 참고
- 이번 검토는 **v1.3 변경분 한정** (P 신규 10개 + Q 회귀 2개 = 12 항목)
- v1.1 합의된 라우팅/RLS/시연 정책/PR 분할, v1.2 합의된 Claude 전환 자체 등은 검토 대상 X
- Codex가 인터넷 접근 없는 모드면 P3는 "공식 단가 확인 후 재검토" REVISE 처리 가능
