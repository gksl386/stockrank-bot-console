# StockRank BotConsole UI (v18-E)

**Next.js 16 + TypeScript + Tailwind v4 + shadcn 호환 컴포넌트**  
**버전**: 0.1.0  
**도메인 (예정)**: `console.stockrank.co.kr` (Vercel)

---

## 🎯 BotConsole 19개 기능 매핑

### Tier 1 — 완성 (11개) ✅
| # | 기능 | 라우트 / 컴포넌트 |
|---|------|-----------------|
| 1 | 📊 상황판 | `app/page.tsx` (Stats 4 카드) |
| 2 | 🤖 봇 목록 (Phase별 탭) | `app/page.tsx` (테이블) |
| 3 | ▶️ 실행 버튼 | `app/bots/[bot_id]/client.tsx` (POST /bots/{id}/run) |
| 4 | 📅 자동 스케줄 | `bot_registry.manifest.triggers.scheduled.cron` (UI는 v18-F 검토) |
| 5 | 🌊 SSE 실시간 로그 | `client.tsx` (lib/sse.ts + EventSource) |
| 6 | 💰 비용 + 자동 차단 | `app/budget/page.tsx` + 봇 상세 budget 카드 (cost_guard 자동) |
| 7 | 📜 헌법 준수율 | 봇 상세 ComplianceCard (validation_violations 집계) |
| 8 | 📥 발행 큐 | `app/queue/page.tsx` (placeholder, GET /insights 추가 시 활성) |
| 9 | 🔔 알림 센터 | 텔레그램/카톡 별도 인프라 (BotConsole UI는 inline alert만) |
| 10 | 🎛️ 명령어 팔레트 (⌘K) | `components/cmd-k.tsx` + `cmd-k-provider.tsx` |
| 11 | 📱 모바일 PWA | `public/manifest.webmanifest` + `sw.js` + `sw-register.tsx` |

### Tier 2 — 골격 (5개) ⏳
| # | 기능 | 라우트 |
|---|------|-------|
| 12 | 봇 그래프 시각화 | `/graph` (Stage 3) |
| 13 | 헬스체크 대시보드 | `/health` (봇 10+) |
| 14 | 캘린더 뷰 | `/calendar` (Phase 1 종료) |
| 15 | 봇 비교 (A/B) | `/compare` (같은 카테고리 봇 2+) |
| 16 | 카탈로그 | `/catalog` (봇 20+) |

### Tier 3 — 스키마 (3개) ⏳
| # | 기능 | 타입 |
|---|------|-----|
| 17 | 자가 진화 제안 | `types/tier3.ts` `EvolutionProposal` |
| 18 | 인사이트 그래프 | `types/tier3.ts` `InsightGraph` |
| 19 | SLO/SLA Burn-down | `types/tier3.ts` `SLOBurndown` |

---

## 🚀 로컬 dev

### 1. 의존성 설치 (사장님 로컬)
```powershell
cd 'G:\내 드라이브\stockrank\bot_ecosystem\console'
# 또는 로컬 클론 후
npm install
```

### 2. .env.local (백엔드 base URL)
```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

### 3. 백엔드 실행 (다른 터미널)
```powershell
cd 'G:\내 드라이브\stockrank\bot_ecosystem'
& 'C:\Users\김지환\venv311\Scripts\python.exe' -m uvicorn backend.main:app --reload --port 8080
```

### 4. UI dev 서버
```powershell
cd 'G:\내 드라이브\stockrank\bot_ecosystem\console'
npm run dev
# → http://localhost:3000
```

### 5. 검증 명령
```powershell
npm run typecheck   # tsc --noEmit
npm run lint
npm run build
```

---

## ☁️ Vercel 배포

### 사전
1. Vercel 계정 + GitHub repo (또는 직접 Vercel CLI deploy)
2. `console.stockrank.co.kr` 도메인 (사장님 메인 stockrank.co.kr 같은 root)

### Project 생성
```bash
npx vercel link              # 첫 1회
npx vercel env add NEXT_PUBLIC_API_BASE production
# → https://api.stockrank.co.kr (또는 Cloud Run URL)
npx vercel --prod
```

### 도메인 매핑
Vercel Dashboard → Project Settings → Domains → `console.stockrank.co.kr` 추가
DNS: CNAME `console.stockrank.co.kr` → `cname.vercel-dns.com`

---

## 🛡️ 보안 정통

- **API 키 0건**: `NEXT_PUBLIC_API_BASE`만 (URL이라 노출 OK). ANTHROPIC/Supabase 키는 backend 측만.
- **CSP**: `next.config.ts` headers에 X-Frame-Options/CTO/Referrer-Policy 명시.
- **인증**: v18-E 시점 미구현. v18-F 또는 후속에서 IAP/JWT 검토.

---

## 📁 폴더 구조

```
console/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 + 사이드바 + Cmd+K
│   ├── globals.css           # Tailwind v4
│   ├── page.tsx              # Tier 1 #1 + #2 (상황판 + 봇 목록)
│   ├── bots/[bot_id]/        # Tier 1 #3 + #5 + #6 + #7 (실행 + SSE + 비용 + 준수율)
│   ├── budget/               # Tier 1 #6 글로벌
│   ├── queue/                # Tier 1 #8 (placeholder)
│   ├── graph,health,calendar,compare,catalog/  # Tier 2 골격
├── components/
│   ├── ui/                   # button/card/badge/table/input/dialog/skeleton
│   ├── sidebar.tsx           # 좌측 네비
│   ├── cmd-k.tsx             # Tier 1 #10 명령어 팔레트
│   ├── cmd-k-provider.tsx    # 전역 ⌘K 단축키
│   ├── tier2-placeholder.tsx # Tier 2 공통 placeholder
│   └── sw-register.tsx       # PWA SW 등록
├── lib/
│   ├── api.ts                # 백엔드 16 엔드포인트 wrapper
│   ├── sse.ts                # EventSource wrapper
│   └── utils.ts              # cn / formatUsd / formatRelative / statusColor
├── types/
│   ├── api.ts                # 5테이블 + budget Pydantic 대응
│   └── tier3.ts              # Stage 3+ 스키마 골격
├── public/
│   ├── manifest.webmanifest  # PWA
│   └── sw.js                 # Service Worker
├── package.json              # Next 16 + React 19 + Tailwind v4
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .env.example
└── .gitignore
```

---

## ⚠️ v18-E 운영 제약

- **백엔드 미연결 시**: 모든 페이지가 graceful (각 카드/테이블이 "백엔드 미연결" 안내)
- **Supabase DDL 미실행 시**: stats/bots/runs/budget이 503 → UI는 안내만
- **mode='real' 차단 유지**: `BOT_REAL_MODE_ENABLED=true` 미설정 시 봇 상세에서 'real 실행' 버튼 클릭 → 403 toast (현 UI는 inline error)
- **PWA 아이콘 미포함**: `/icons/icon-192.png` `/icons/icon-512.png` placeholder. 사장님이 추후 추가 (manifest는 정통)

---

## 📋 다음 단계

| 단계 | 내용 |
|------|------|
| v18-E2 (선택) | 백엔드 GET /insights 추가 → Tier 1 #8 발행 큐 활성 |
| v18-F | 미니 SR등급 알림봇 — 본 UI에서 end-to-end 종단 검증 |

---

**우선순위 (사장님 5/9)**: BotConsole 인프라 완성 우선 / 실제 운영 봇은 Phase 1 이후
