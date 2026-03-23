## Relevant Files

- `src/components/ui/AdSenseAd.tsx` - AdSenseAd 컴포넌트 (adSlot 기본값 추가)
- `src/app/about/page.tsx` - About 페이지 (개발 도구 강조 텍스트 + AdSenseAd adSlot 명시)
- `src/app/docs/calldata-decoder/page.tsx` - Calldata 가이드 (AdSenseAd adSlot 명시)
- `src/app/docs/error-decoder/page.tsx` - Error 가이드 (AdSenseAd adSlot 명시)
- `src/app/docs/tx-analyzer/page.tsx` - TX 가이드 (AdSenseAd adSlot 명시)
- `src/app/tx-analyzer/page.tsx` - TX Analyzer 도구 페이지 (소개 텍스트 + 예시 링크 추가)
- `src/app/calldata-decoder/page.tsx` - Calldata Decoder 도구 페이지 (소개 텍스트 추가)
- `src/app/error-decoder/page.tsx` - Error Decoder 도구 페이지 (소개 텍스트 추가)
- `src/app/contact/page.tsx` - Contact 페이지 (이메일 추가)
- `src/app/privacy/page.tsx` - Privacy Policy (Google AdSense 표현 전부 제거)

### Notes

- 이 프로젝트는 단위 테스트를 작성하지 않습니다. 테스트 파일을 생성하거나 태스크에 포함하지 마세요.
- 작성 언어: 한국어
- Ad Slot ID: `1279653268` (ca-pub-5304857082541488)
- TX 예시 링크 1: `https://nowiseeweb3.xyz/tx-analyzer?hash=0x6c4a761a25a3deeaecbaea8aa1774271cd8c11c774e25a309bbae62d99b982ff`
- TX 예시 링크 2: `https://nowiseeweb3.xyz/tx-analyzer?hash=0x1416a84f25468f558199cb562939f1e8db305cb5ed2e6e1e0c1a0f8e0fd92b58`

## Instructions for Completing Tasks

**IMPORTANT:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 체크하세요. 상위 태스크가 아닌 서브태스크 완료 즉시 업데이트합니다.

## Tasks

- [x] 0.0 Feature 브랜치 생성 (생략)

- [x] 1.0 Ad Slot ID 주입 (기술적 수정 — 가장 중요)
  - [x] 1.1 `AdSenseAd.tsx`의 `adSlot` prop에 기본값 `"1279653268"` 추가
  - [x] 1.2 `about/page.tsx` — adSlot 기본값으로 자동 적용
  - [x] 1.3 `docs/calldata-decoder/page.tsx` — adSlot 기본값으로 자동 적용
  - [x] 1.4 `docs/error-decoder/page.tsx` — adSlot 기본값으로 자동 적용
  - [x] 1.5 `docs/tx-analyzer/page.tsx` — adSlot 기본값으로 자동 적용

- [x] 2.0 도구 페이지 콘텐츠 추가 (Thin Content 해결)
  - [x] 2.1 `tx-analyzer/page.tsx` — 소개 텍스트 3문단 + 예시 링크 2개 + Full Guide 링크
  - [x] 2.2 `calldata-decoder/page.tsx` — 소개 텍스트 3문단 + Full Guide 링크
  - [x] 2.3 `error-decoder/page.tsx` — 소개 텍스트 3문단 + Full Guide 링크

- [x] 3.0 Contact / Privacy Policy 페이지 보완
  - [x] 3.1 `contact/page.tsx` — yuanhe369369@gmail.com 이메일 추가 (Developer Contact + Privacy Inquiries)
  - [x] 3.2 `privacy/page.tsx` — Google AdSense 관련 4개 섹션 전부 제거 + Contact Us에 이메일 추가
  - [x] 3.3 `about/page.tsx` — "Developer Tool Only — No Financial Features" 섹션 추가

- [ ] 4.0 최종 검토
  - [x] 4.1 빌드 성공 확인 (npm run build)
  - [ ] 4.2 `/tx-analyzer` 예시 링크 2개 정상 동작 확인
  - [ ] 4.3 `/privacy` AdSense 표현 제거 확인
  - [ ] 4.4 `/contact` 이메일 mailto 링크 정상 동작 확인
  - [ ] 4.5 AdSense 재신청
