## Relevant Files

- `src/lib/chains/chainList.ts` - 지원 체인 목록 정의 (`defineChain`, `supportedChains` 배열)
- `src/lib/utils/multiRace.ts` - 멀티체인 병렬 조회 `multiRace` 유틸리티 함수
- `src/lib/utils/abiArchive.ts` - ABI archive HTTP 조회 및 인메모리 캐싱 로직
- `src/lib/utils/decoder.ts` - calldata / 이벤트 로그 / error 디코딩 공통 유틸리티
- `src/lib/utils/hex.ts` - hex 유효성 검증 및 축약 표시 유틸리티
- `src/lib/utils/viemClient.ts` - 체인별 viem `PublicClient` 생성 팩토리
- `src/types/index.ts` - 공통 TypeScript 타입 정의
- `src/components/ui/LoadingSpinner.tsx` - 로딩 상태 표시 컴포넌트
- `src/components/ui/ErrorDisplay.tsx` - 에러 유형별 표시 컴포넌트
- `src/components/ui/HexDisplay.tsx` - hex 축약 표시 + 전체 복사 컴포넌트
- `src/components/ui/CopyButton.tsx` - 클립보드 복사 버튼 컴포넌트
- `src/components/widgets/TransactionSearch.tsx` - 트랜잭션 해시 검색 위젯
- `src/components/widgets/DecodedCalldataView.tsx` - 디코딩된 calldata 표시 위젯
- `src/components/widgets/RawCalldataView.tsx` - 원본 calldata hex 표시 위젯
- `src/components/widgets/EventLogView.tsx` - 이벤트 로그 디코딩 표시 위젯
- `src/components/widgets/ErrorDecoderPanel.tsx` - error 디코딩 패널 위젯
- `src/components/Dashboard.tsx` - 드래그 앤 드롭 대시보드 레이아웃 컴포넌트
- `src/app/page.tsx` - 메인 대시보드 페이지 (또는 `src/pages/index.tsx`)
- `src/app/calldata-decoder/page.tsx` - Calldata Decoder 독립 페이지
- `src/app/error-decoder/page.tsx` - Error Decoder 독립 페이지

### Notes

- 이 프로젝트는 단위 테스트를 작성하지 않습니다.
- 프레임워크는 Next.js (App Router) + TypeScript를 기준으로 합니다.
- 정적 배포: `next.config.ts`에 `output: 'export'` 설정 적용.
- ABI archive URL 형식: `https://raw.githubusercontent.com/imelon2/abi-archive-trie/refs/heads/main/archive/function/{prefix}/{suffix}/abi.json`

## Instructions for Completing Tasks

**중요:** 각 태스크를 완료할 때마다 `- [ ]`를 `- [x]`로 변경하여 체크해야 합니다. 이를 통해 진행 상황을 추적하고 단계를 건너뛰지 않도록 합니다.

예시:
- `- [ ] 1.1 파일 읽기` → `- [x] 1.1 파일 읽기` (완료 후)

전체 상위 태스크가 아닌 각 서브태스크를 완료할 때마다 파일을 업데이트합니다.

## Tasks

- [x] 0.0 피처 브랜치 생성
  - [x] 0.1 피처 브랜치 생성 및 체크아웃 (`git checkout -b feature/onchain-data-analyzer`)

- [x] 1.0 프로젝트 초기 설정
  - [x] 1.1 Next.js + TypeScript 프로젝트를 생성한다 (`npx create-next-app@latest --typescript`)
  - [x] 1.2 필수 패키지를 설치한다: `viem`, `axios`
  - [x] 1.3 드래그 앤 드롭 레이아웃 라이브러리를 설치한다: `react-grid-layout` 및 타입 정의
  - [x] 1.4 `src/` 하위에 `lib/chains`, `lib/utils`, `components/ui`, `components/widgets`, `types` 디렉토리 구조를 생성한다
  - [x] 1.5 App Router 기준으로 라우팅 구조를 설정한다: `/` (대시보드), `/calldata-decoder`, `/error-decoder`
  - [x] 1.6 전역 스타일에 모노스페이스 폰트(예: `JetBrains Mono`, `Fira Code`)를 적용하고 기본 개발자 친화 테마(다크 배경, 고대비 텍스트)를 설정한다
  - [x] 1.7 공통 TypeScript 타입을 `src/types/index.ts`에 정의한다 (예: `DecodedCalldata`, `DecodedEvent`, `DecodedError`, `TxInfo`, `WidgetType`)

- [x] 2.0 멀티체인 구성 및 공통 유틸리티
  - [x] 2.1 `src/lib/chains/chainList.ts`를 생성하고 PRD 명세에 따라 `viem`의 `defineChain`으로 `dkargoWarehouse`, `dkargo` 커스텀 체인을 정의한다
  - [x] 2.2 `supportedChains` 배열을 `chainList.ts`에 export한다 (mainnet, sepolia, arbitrum, arbitrumSepolia, kaia, polygon, dkargoWarehouse, dkargo, localhost, base, baseSepolia, avalanche)
  - [x] 2.3 `src/lib/utils/viemClient.ts`를 생성하고 체인을 받아 viem `createPublicClient`를 반환하는 팩토리 함수를 구현한다
  - [x] 2.4 `src/lib/utils/multiRace.ts`를 생성하고 PRD에 명시된 `multiRace<T>` 함수를 그대로 구현한다
  - [x] 2.5 `src/lib/utils/abiArchive.ts`를 생성하고 function selector(4바이트)를 받아 ABI archive URL을 계산한 뒤 `axios`로 조회하는 `fetchAbiBySelector` 함수를 구현한다 (URL 형식: `archive/function/{selector[2..4]}/{selector[4..6]}/abi.json`)
  - [x] 2.6 `fetchAbiBySelector`에 인메모리 `Map` 캐시를 추가해 동일 selector 재조회를 방지한다
  - [x] 2.7 `src/lib/utils/hex.ts`를 생성하고 `isValidHex` (0x 형식 유효성 검증), `truncateHex` (앞 10자 + … + 뒤 8자 형태 축약) 함수를 구현한다
  - [x] 2.8 `src/lib/utils/decoder.ts`를 생성하고 viem의 `decodeFunctionData`, `decodeEventLog`, `decodeErrorResult`를 래핑하는 공통 디코딩 함수들을 구현한다 (디코딩 실패 시 null 반환, 예외 미전파)

- [x] 3.0 트랜잭션 분석 페이지 구현
  - [x] 3.1 `src/components/widgets/TransactionSearch.tsx`를 생성하고 트랜잭션 해시 입력 필드와 검색 버튼 UI를 구현한다
  - [x] 3.2 검색 시 `supportedChains` 전체를 대상으로 `multiRace`를 사용해 병렬 `getTransaction` 조회를 수행하는 로직을 구현한다
  - [x] 3.3 조회 성공 시 체인 이름과 함께 기본 트랜잭션 정보(hash, from, to, value, nonce, blockNumber, status)를 패널에 표시한다
  - [x] 3.4 트랜잭션에 `input` 데이터가 존재하면 앞 4바이트(function selector)를 추출하여 `fetchAbiBySelector`로 ABI를 조회한다
  - [x] 3.5 ABI 조회 성공 시 `src/components/widgets/DecodedCalldataView.tsx`를 구현하고 함수명, 함수 시그니처, 파라미터(이름·타입·값) 목록을 구조화하여 표시한다
  - [x] 3.6 ABI 조회 실패 시 "ABI를 찾을 수 없음" 메시지와 function selector를 추정 정보로 표시하고, `src/components/widgets/RawCalldataView.tsx`에서 원본 calldata hex를 그대로 보여준다
  - [x] 3.7 `getTransactionReceipt`로 receipt를 조회하고 logs 배열이 존재하면 각 log의 topics[0](event topic)으로 ABI를 조회한다
  - [x] 3.8 `src/components/widgets/EventLogView.tsx`를 구현하고 ABI 조회 성공 시 이벤트명, indexed 여부, 파라미터(이름·타입·값)를 구조화하여 표시한다; 실패 시 원본 topics와 data hex를 표시한다
  - [x] 3.9 디코딩된 결과와 원본 hex 데이터를 나란히 볼 수 있도록 레이아웃을 구성한다 (탭 또는 좌우 분할)

- [x] 4.0 Calldata Decoder 페이지 구현
  - [x] 4.1 `src/app/calldata-decoder/page.tsx`를 생성하고 0x 형식 calldata 입력 텍스트 영역과 디코딩 버튼을 배치한다
  - [x] 4.2 입력값에 대해 `isValidHex`로 실시간 유효성 검증을 수행하고 유효하지 않으면 즉시 검증 메시지를 표시한다
  - [x] 4.3 유효한 입력에서 앞 4바이트 selector를 추출해 `fetchAbiBySelector`를 호출하고 ABI 기반 디코딩 결과(함수명, 시그니처, 파라미터 목록·타입·값)를 표시한다
  - [x] 4.4 ABI 조회 실패 시 selector를 추정 정보로 표시하고 원본 hex를 그대로 보여준다
  - [x] 4.5 디코딩 결과 전체를 클립보드에 복사하는 버튼(`CopyButton`)을 제공한다

- [ ] 5.0 Error Decoder 페이지 구현
  - [ ] 5.1 `src/app/error-decoder/page.tsx`를 생성하고 0x 형식 에러 데이터 입력 텍스트 영역과 디코딩 버튼을 배치한다
  - [ ] 5.2 입력값에 대해 `isValidHex`로 실시간 유효성 검증을 수행하고 유효하지 않으면 즉시 검증 메시지를 표시한다
  - [ ] 5.3 앞 4바이트 error selector를 추출해 `fetchAbiBySelector`로 ABI를 조회하고 `decodeErrorResult`로 디코딩한다
  - [ ] 5.4 디코딩 성공 시 error name, 시그니처, 파라미터(이름·타입·값) 목록을 구조화하여 표시한다
  - [ ] 5.5 디코딩 실패 시 실패 사실과 이유(ABI 없음, 형식 오류 등)를 명확히 표시하고 selector를 추정 정보로 보여준다
  - [ ] 5.6 디코딩 결과 전체를 클립보드에 복사하는 버튼(`CopyButton`)을 제공한다

- [ ] 6.0 드래그 앤 드롭 대시보드 구현
  - [ ] 6.1 `react-grid-layout`의 `Responsive` + `WidthProvider`를 사용해 `src/components/Dashboard.tsx`의 기본 구조를 작성한다
  - [ ] 6.2 지원 위젯 목록(`transaction search`, `decoded calldata view`, `raw calldata view`, `event log view`, `error decoder panel`)을 `WidgetType` 열거형으로 정의하고 위젯 추가 버튼/드롭다운 UI를 구현한다
  - [ ] 6.3 각 위젯을 `react-grid-layout`의 grid item으로 등록하고 드래그 이동이 작동하도록 연결한다
  - [ ] 6.4 각 위젯 패널 우상단에 제거(X) 버튼을 추가하고 클릭 시 레이아웃에서 해당 위젯을 제거하는 로직을 구현한다
  - [ ] 6.5 `react-grid-layout`의 `resizable` 옵션을 활성화하여 위젯 크기 조절을 지원하고 최소 크기를 설정한다
  - [ ] 6.6 레이아웃 변경(이동·크기 조절·추가·제거) 시 상태를 React state로 즉시 반영하고 렌더링이 안정적으로 유지되도록 한다
  - [ ] 6.7 페이지 로딩 시 트랜잭션 검색 + calldata 뷰 + 이벤트 로그 뷰를 포함한 기본 개발자 친화 레이아웃을 제공한다

- [ ] 7.0 공통 UX 및 오류 처리
  - [ ] 7.1 `src/components/ui/LoadingSpinner.tsx`를 구현하고 멀티체인 검색, ABI 조회 등 비동기 작업 중 로딩 상태를 표시한다
  - [ ] 7.2 `src/components/ui/ErrorDisplay.tsx`를 구현하고 네트워크 오류, RPC 오류, ABI fetch 오류를 구분하여 다른 메시지로 표시한다
  - [ ] 7.3 `src/components/ui/HexDisplay.tsx`를 구현하고 `truncateHex`로 축약 표시하되 `CopyButton`으로 전체 hex를 복사할 수 있게 한다
  - [ ] 7.4 `src/components/ui/CopyButton.tsx`를 구현하고 `navigator.clipboard.writeText`로 지정 텍스트를 복사하며 복사 완료 시 시각적 피드백(체크 아이콘 전환)을 제공한다
  - [ ] 7.5 모든 페이지에 공통 네비게이션 바(대시보드 / Calldata Decoder / Error Decoder 링크)를 추가한다
  - [ ] 7.6 전체 UI에서 패널·카드 기반 레이아웃을 일관되게 적용하고 각 패널에 제목과 액션 버튼 영역을 포함시킨다
