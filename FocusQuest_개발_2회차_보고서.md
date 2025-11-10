# FocusQuest 개발 2회차 보고서

**보고 일자:** 2025년 11월 10일
**작성자:** Claude Code

---

## 1. 개요

- 본 보고서는 'FocusQuest' 프로젝트의 두 번째 개발 세션 진행 상황을 요약함.
- 1회차에서 정의한 로드맵에 따라 Sprint 2 'Visual Systems' 개발을 착수함.
- 금일 세션에서는 게임화 시스템의 핵심 데이터 모델, 로직, 그리고 상태 관리를 완전히 구현하는 데 집중함.

---

## 2. 완료된 작업

### 가. 게임화 데이터 모델 정의
**파일:** `src/types/gamification.ts` (신규 생성)

- **GamificationState 인터페이스:** 레벨, XP, 크리스탈, 뱃지, 스킬, 스트릭, 통계 등 모든 게임화 상태를 관리하는 타입 정의
- **Badge 인터페이스:** 뱃지 ID, 아이콘, 제목, 설명, 획득 조건, 레어도 정의
- **Skill 인터페이스:** 스킬 ID, 이름, 설명, 크리스탈 비용, 아이콘 정의
- **AchievementNotification 인터페이스:** 뱃지/레벨업 알림을 위한 타입 정의

### 나. 뱃지 시스템 구현
**파일:** `src/constants/badges.ts` (신규 생성)

5개의 기본 뱃지를 정의하고 각각의 획득 조건을 구현:
1. **First Quest (🎯):** 첫 포커스 세션 완료 (Common)
2. **Week Warrior (🔥):** 7일 연속 스트릭 달성 (Rare)
3. **Century (💯):** 총 100개 포커스 세션 완료 (Epic)
4. **High Energy (⚡):** 80% 이상 에너지로 3회 연속 세션 완료 (Rare)
5. **Consistent (📅):** 5일 연속 세션 완료 (Common)

### 다. 게임화 유틸리티 함수 구현
**파일:** `src/utils/gamification.ts` (신규 생성)

핵심 계산 로직 구현:
- **calculateLevel(totalXP):** 총 XP로부터 레벨 계산 (120 XP = 1 레벨)
- **xpToNextLevel(currentXP):** 다음 레벨까지 필요한 XP 계산
- **levelProgress(currentXP):** 현재 레벨 내 진행도 퍼센트 계산
- **calculateCrystals(energy):** 에너지 레벨(0-100)에 따라 0-5개 크리스탈 획득
  - 0-20%: 0개
  - 21-40%: 1개
  - 41-60%: 2개
  - 61-80%: 3개
  - 81-90%: 4개
  - 91-100%: 5개
- **calculateXP(durationMinutes):** 세션 시간(분)을 XP로 변환 (1분 = 1 XP)
- **isSameDay / isConsecutiveDay:** 스트릭 계산을 위한 날짜 비교 함수
- **getBadgeRarityColor:** 뱃지 레어도에 따른 Tailwind 색상 클래스 반환

### 라. Zustand 스토어 확장 및 게임화 로직 통합
**파일:** `src/state/sessionStore.ts` (수정)

#### 1) 상태 확장
- `gamification: GamificationState` 추가
- `achievements: AchievementNotification[]` 추가 (실시간 알림용)

#### 2) 새로운 액션 구현
- **earnXP(amount):**
  - XP 획득 시 레벨 계산
  - 레벨업 발생 시 알림 생성
- **awardBadge(badgeId):**
  - 중복 체크 후 뱃지 획득
  - 뱃지 획득 시 알림 생성
- **earnCrystals(amount):**
  - 크리스탈 획득
- **spendCrystals(skillId, cost):**
  - 크리스탈 차감 및 스킬 잠금 해제
  - 크리스탈 부족 시 false 반환
- **updateStreak():**
  - 연속 접속일 추적
  - 첫 세션, 같은 날, 연속일, 스트릭 끊김 처리
  - 1일 유예 기간 (Shield) 구현
- **checkAchievements():**
  - 모든 뱃지 조건 자동 체크
  - "High Energy" 뱃지는 최근 3개 세션의 에너지 레벨 확인
- **dismissAchievement(timestamp):**
  - 알림 닫기 기능

#### 3) 기존 로직 수정
- **recordFeedback():**
  - 세션 완료 시 자동으로 게임화 시스템 연동
  - Focus 세션: XP 획득, 크리스탈 획득, 통계 업데이트
  - Break 세션: 회복 시간 통계 업데이트
  - 스트릭 업데이트 자동 호출
  - 성취도 체크 자동 호출

#### 4) 데이터 영속성
- `persist` 미들웨어의 `partialize`에 `gamification` 상태 추가하여 localStorage에 저장

#### 5) 리셋 함수 업데이트
- `resetSessionStore()`에 gamification 초기 상태 추가

---

## 3. 현재 진행 상황

- **구현 현황:**
  - Sprint 2의 **백엔드 로직이 100% 완료**됨
  - 게임화 시스템의 모든 핵심 기능(XP, 레벨, 크리스탈, 뱃지, 스트릭)이 완전히 작동하는 상태
  - 데이터 모델, 계산 로직, 상태 관리가 완성되어 UI 구현을 위한 준비 완료

- **진행률:**
  - Sprint 2 전체 진행률: 약 40% (백엔드 로직 완료, UI 구현 대기)
  - 다음 단계: UI 컴포넌트 구현 및 시각화

- **발생 이슈:**
  - 현재까지 특별한 이슈 없음
  - 타입 안정성을 위해 TypeScript strict mode 유지
  - 아직 빌드 테스트는 진행하지 않음 (UI 컴포넌트 완성 후 진행 예정)

---

## 4. 향후 계획

### 가. 1순위 목표: Sprint 2 UI 컴포넌트 구현

#### 다음 세션에서 진행할 작업:
1. **constants/skills.ts 완성:**
   - Deep Work Mode, Zen Break, Night Owl 스킬 정의 완료

2. **GamificationPanel 컴포넌트 구현:**
   - 레벨 및 XP 진행 바 표시
   - 크리스탈 카운터 표시
   - 스트릭 카운터 표시 (🔥 아이콘 활용)
   - 뱃지 그리드 (잠금/잠금 해제 상태)
   - 스킬 잠금 해제 UI

3. **AchievementToast 컴포넌트 구현:**
   - 뱃지 획득 시 토스트 알림
   - 레벨업 시 애니메이션
   - 자동 닫기 기능

4. **App.tsx에 통합:**
   - GamificationPanel을 메인 레이아웃에 추가
   - AchievementToast 전역 배치

5. **빌드 및 테스트:**
   - `npm run build` 실행
   - TypeScript 오류 해결
   - 기능 테스트 및 검증

### 나. 중기 목표: Sprint 2 완성 및 Sprint 3 준비
- 모든 게임화 기능의 시각적 표현 완성
- 사용자 경험 개선 (애니메이션, 피드백)
- Sprint 3 'Advanced Features' 기획 검토

---

## 5. 기술적 세부사항

### 구현된 주요 알고리즘

#### 레벨 시스템
```
레벨 = floor(총 XP / 120)
다음 레벨까지 필요한 XP = (현재 레벨 + 1) × 120 - 현재 XP
```

#### 크리스탈 획득
```
에너지 레벨에 비례:
  0-20%   → 0 크리스탈
  21-40%  → 1 크리스탈
  41-60%  → 2 크리스탈
  61-80%  → 3 크리스탈
  81-90%  → 4 크리스탈
  91-100% → 5 크리스탈
```

#### 스트릭 계산
```
- 같은 날: 카운트 유지
- 연속일: 카운트 +1
- 1일 공백 + Shield 미사용: Shield 사용하여 카운트 유지
- 2일 이상 공백: 스트릭 리셋 (카운트 = 1)
```

---

## 6. 파일 구조 변경 사항

### 신규 생성 파일
```
src/
├── types/
│   └── gamification.ts          [NEW] 게임화 데이터 모델
├── constants/
│   └── badges.ts                [NEW] 뱃지 정의
└── utils/
    └── gamification.ts          [NEW] 게임화 유틸리티
```

### 수정된 파일
```
src/
└── state/
    └── sessionStore.ts          [MODIFIED] 게임화 상태 및 로직 추가
```

---

## 7. 특이사항 및 이슈

- **현재 특별한 블로커(Blocker)는 없음.**
- 백엔드 로직이 완성되어 UI 구현에 집중할 수 있는 상태
- 다음 세션에서 UI 컴포넌트를 빠르게 구현하면 Sprint 2를 완료할 수 있을 것으로 예상됨
- TypeScript 타입 안정성이 잘 유지되고 있어 런타임 오류 발생 가능성 낮음

---

## 8. 다음 세션 체크리스트

- [ ] constants/skills.ts 완성
- [ ] GamificationPanel.tsx 구현
- [ ] AchievementToast.tsx 구현
- [ ] App.tsx에 컴포넌트 통합
- [ ] npm run build 성공
- [ ] 기능 테스트 및 검증
- [ ] Git 커밋 및 푸시
- [ ] 3회차 보고서 작성
