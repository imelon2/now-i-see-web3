# PRD: On-Chain Data Analyzer Webpage: Now I See Web3

## 1. Introduction / Overview

온체인 데이터를 빠르게 조회, 분석, 디코딩할 수 있는 개발자 친화적 웹페이지를 구축합니다. 이 제품의 주요 목적은 여러 체인을 대상으로 트랜잭션을 검색하고, calldata와 이벤트 로그를 사람이 읽을 수 있는 형태로 해석하여 개발자와 운영자가 디버깅 및 분석 작업을 더 효율적으로 수행하도록 돕는 것입니다.

본 제품은 멀티체인 트랜잭션 검색, calldata 디코더, 별도 error 디코더 페이지를 핵심 기능으로 제공합니다. 또한 사용자가 화면에 필요한 분석 컴포넌트를 드래그 앤 드롭으로 추가, 제거, 재배치하고 크기를 조절할 수 있도록 하여 분석 목적에 맞는 작업 화면을 구성할 수 있어야 합니다.

## 2. Goals

- 여러 체인에서 동일한 트랜잭션 해시 또는 입력 데이터를 빠르게 조회할 수 있어야 합니다.
- 트랜잭션의 calldata를 ABI 기반으로 디코딩하여 함수명, 파라미터명, 값을 읽기 쉽게 표시해야 합니다.
- 트랜잭션 receipt 또는 로그 기반의 이벤트 데이터를 디코딩하여 개발자가 이벤트 발생 내역을 빠르게 이해할 수 있어야 합니다.
- 별도 페이지에서 0x 형식의 에러 데이터를 입력받아 selector 중심의 해석 결과를 확인할 수 있어야 합니다.
- 개발자 친화적인 UI를 제공하고, 사용자가 위젯 레이아웃을 직접 구성할 수 있어야 합니다.

## 3. User Stories

- 개발자로서, 하나의 트랜잭션 해시를 입력해 어떤 체인에 존재하는지 빠르게 찾고 싶습니다. 그래야 여러 체인을 직접 탐색하지 않아도 됩니다.
- 개발자로서, 트랜잭션의 calldata를 함수명과 인자 단위로 해석해서 보고 싶습니다. 그래야 컨트랙트 호출 내용을 빠르게 이해할 수 있습니다.
- 개발자로서, 이벤트 로그를 디코딩해서 어떤 이벤트가 어떤 값으로 발생했는지 확인하고 싶습니다. 그래야 실행 결과를 쉽게 검증할 수 있습니다.
- 운영/분석 담당자로서, 별도 error decoder 페이지에 0x 에러 데이터를 넣고 의미를 추정하고 싶습니다. 그래야 실패 원인을 빠르게 분류할 수 있습니다.
- 사용자로서, 필요한 분석 위젯만 화면에 배치하고 제거하거나 크기를 조절하고 싶습니다. 그래야 내 작업 목적에 맞는 분석 화면을 만들 수 있습니다.

## 4. Functional Requirements

### 4.1 멀티체인 구성

1. 시스템은 멀티체인 정의를 별도 파일로 관리해야 합니다.
2. 멀티체인 정의 파일 경로는 `./적절한 디렉토리/chainList.ts` 형태로 구성해야 합니다.
3. 시스템은 `viem`의 `defineChain`을 사용하여 커스텀 체인을 정의할 수 있어야 합니다.
4. 시스템은 `supportedChains` 배열 기반으로 검색 대상 체인 목록을 관리해야 합니다.
5. 시스템은 기본 제공 체인과 사용자 정의 체인을 함께 지원해야 합니다.
6. 시스템은 최소한 다음 체인들을 지원 대상으로 포함해야 합니다: Ethereum mainnet, Sepolia, Arbitrum, Arbitrum Sepolia, Kaia, Polygon, Dkargo Warehouse, Dkargo, localhost, Base, Base Sepolia, Avalanche.

### 4.2 트랜잭션 분석 페이지

7. 시스템은 사용자가 트랜잭션 해시를 입력할 수 있는 검색 UI를 제공해야 합니다.
8. 시스템은 입력된 트랜잭션 해시에 대해 `supportedChains` 내 여러 체인을 병렬 조회해야 합니다.
9. 시스템은 멀티체인 조회 로직에 사용자가 제공한 `multiRace` 패턴을 적용해야 합니다.
10. 시스템은 가장 먼저 유효한 결과를 반환한 체인을 검색 결과로 채택해야 합니다.
11. 시스템은 어떤 체인에서 결과가 조회되었는지 체인 이름과 함께 표시해야 합니다.
12. 시스템은 조회 성공 시 기본 트랜잭션 정보(예: hash, from, to, value, nonce, block number, status)를 표시해야 합니다.
13. 시스템은 트랜잭션에 input/calldata가 존재할 경우 디코딩을 시도해야 합니다.
14. 시스템은 calldata의 function selector를 기준으로 ABI archive 경로를 계산해 ABI를 조회해야 합니다.
15. 시스템은 ABI 조회 시 아래 형식의 원격 JSON을 사용해야 합니다: `archive/function/{selector-prefix}/{selector-suffix}/abi.json`.
16. 시스템은 ABI 조회 성공 시 함수명, 시그니처, 인자 목록, 각 인자의 타입과 값을 구조화해 표시해야 합니다.
17. 시스템은 트랜잭션 receipt를 조회할 수 있어야 합니다.
18. 시스템은 receipt 내 로그가 존재할 경우 이벤트 로그 디코딩을 시도해야 합니다.
19. 시스템은 ABI가 존재하는 경우 이벤트명, indexed 여부, 파라미터명, 타입, 값을 구조화해 표시해야 합니다.
20. 시스템은 디코딩 결과를 원본 hex 데이터와 함께 나란히 볼 수 있어야 합니다.
21. 시스템은 디코딩 실패 시 실패 사실을 명확히 표시해야 하며, 애플리케이션이 중단되면 안 됩니다.
22. 시스템은 ABI를 찾지 못한 경우 “ABI를 찾을 수 없음”과 함께 function selector 또는 event topic 기반의 추정 식별자를 표시해야 합니다.
23. 시스템은 ABI를 찾지 못한 경우에도 원본 calldata와 로그 hex를 그대로 확인할 수 있게 해야 합니다.

#### 4.2.1 구현 요구사항
- 필요한 ABI는 아래 HTTP 호출을 통해 조회한다.
```TS
import axios from "axios"

const request = await axios.get("https://raw.githubusercontent.com/imelon2/abi-archive-trie/refs/heads/main/archive/function/a9/05/abi.json")
console.log(request.data)

[
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
]
```

- 멀티체인 검색을 아래 코드를 사용할것
```ts
export function multiRace<T, _>(
    promises: Promise<{ result: T | null; client: PublicClient }>[]
): Promise<{ result: T; client: PublicClient } | null> {
    return new Promise((resolve) => {
    let resolved = false;
    let pending = promises.length;

    for (const p of promises) {
        p.then(({ result, client }) => {
        pending -= 1;
        if (!resolved && result !== null) {
            resolved = true;
            resolve({ result, client });
        } else if (pending === 0 && !resolved) {
            resolve(null);
        }
        });
    }
    });
}
```
- 트랜잭션 조회 시, 멀티체인 동시 탐색을 위해 viem의 체인 리스트를 사용할 것.
- 예시 코드
    ```ts
    import { defineChain } from "viem";
    import { mainnet, kaia, polygon, sepolia, arbitrum, arbitrumSepolia, localhost, base, baseSepolia,avalanche } from 'viem/chains';
    
    const dkargoWarehouse = defineChain({
        id: 61022448,
        name: 'Dkargo',
        network: 'warehouse',
        nativeCurrency: {
          name: 'dkargo warehouse',
          symbol: 'DKA',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://rpc.warehouse.dkargo.io'],
          },
          public: {
            http: ['https://rpc.warehouse.dkargo.io'],
          },
        },
        dasUrls: ""
      });
    
    const dkargo = defineChain({
        id: 61022894,
        name: 'Dkargo',
        network: 'dKargo',
        nativeCurrency: {
          name: 'dkargo',
          symbol: 'DKA',
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ['https://mainnet-rpc.dkargo.io'],
          },
          public: {
            http: ['https://mainnet-rpc.dkargo.io'],
          },
        },
        dasUrls: ""
      });
    
      export const supportedChains = [
        mainnet,
        sepolia,
        arbitrum,
        arbitrumSepolia,
        kaia,
        polygon,
        dkargoWarehouse,
        dkargo,
        localhost,
        base,
        baseSepolia,
        avalanche
      ];
    ```

### 4.3 Calldata Decoder 페이지

24. 시스템은 별도 calldata decoder UI를 제공해야 합니다.
25. 시스템은 사용자가 0x 형식의 calldata를 직접 입력할 수 있게 해야 합니다.
26. 시스템은 입력값이 유효한 hex 문자열인지 검증해야 합니다.
27. 시스템은 selector를 추출하여 ABI archive 조회를 시도해야 합니다.
28. 시스템은 ABI 조회 성공 시 함수명, 함수 시그니처, 파라미터 목록, 값, 타입을 디코딩해 표시해야 합니다.
29. 시스템은 ABI 조회 실패 시 selector를 추정 정보로 표시해야 합니다.
30. 시스템은 디코딩 결과 복사 기능을 제공해야 합니다.

### 4.4 Error Decoder 페이지

31. 시스템은 calldata decoder와 별도로 독립된 error decoder 페이지를 제공해야 합니다.
32. 시스템은 사용자가 0x 형식의 에러 데이터를 직접 입력할 수 있게 해야 합니다.
33. 시스템은 입력값이 유효한 hex 문자열인지 검증해야 합니다.
34. 시스템은 error selector를 추출하여 해석을 시도해야 합니다.
35. 시스템은 ABI archive 또는 정의된 해석 로직으로 디코딩이 가능할 경우 error name, 시그니처, 파라미터 목록, 값을 표시해야 합니다.
36. 시스템은 디코딩이 불가능한 경우 selector를 추정 정보로 표시해야 합니다.
37. 시스템은 디코딩 실패 여부와 이유를 사용자에게 명확히 표시해야 합니다.
38. 시스템은 결과 복사 기능을 제공해야 합니다.

### 4.5 드래그 앤 드롭 대시보드 구성

39. 시스템은 분석 컴포넌트를 화면에 추가할 수 있는 UI를 제공해야 합니다.
40. 시스템은 사용자가 컴포넌트를 드래그하여 원하는 위치로 옮길 수 있게 해야 합니다.
41. 시스템은 사용자가 컴포넌트를 화면에서 제거할 수 있게 해야 합니다.
42. 시스템은 사용자가 컴포넌트 크기를 조절할 수 있게 해야 합니다.
43. 시스템은 컴포넌트 순서와 배치를 즉시 반영해야 합니다.
44. 시스템은 최소한 다음 위젯을 컴포넌트로 지원해야 합니다: transaction search, decoded calldata view, raw calldata view, event log view, error decoder panel.
45. 시스템은 레이아웃 변경 시 사용자가 현재 화면 구성을 잃지 않도록 안정적으로 상태를 유지해야 합니다.
46. 시스템은 페이지 로딩 시 기본 개발자 친화 레이아웃을 제공해야 합니다.

### 4.6 공통 UX 및 오류 처리

47. 시스템은 로딩 중 상태를 표시해야 합니다.
48. 시스템은 네트워크 오류, RPC 오류, ABI fetch 오류를 구분해서 사용자에게 보여줘야 합니다.
49. 시스템은 잘못된 입력값에 대해 즉시 검증 메시지를 표시해야 합니다.
50. 시스템은 디코딩 결과에서 긴 hex 문자열을 축약 표시하되 전체 복사 기능은 유지해야 합니다.
51. 시스템은 개발자가 빠르게 읽을 수 있도록 모노스페이스 텍스트와 구조화된 패널 UI를 제공해야 합니다.

## 5. Non-Goals (Out of Scope)

- 내부 호출 trace 또는 call tree 수준의 상세 실행 추적 기능은 이번 범위에 포함하지 않습니다.
- 사용자가 ABI JSON을 직접 업로드하거나 붙여넣어 수동 디코딩하는 기능은 이번 범위에 포함하지 않습니다.
- 실시간 mempool 모니터링 기능은 포함하지 않습니다.
- 지갑 연결, 트랜잭션 전송, 서명 기능은 포함하지 않습니다.
- 사용자 계정 시스템 및 사용자별 레이아웃 저장 기능은 포함하지 않습니다.
- 블록 탐색기 수준의 전체 체인 인덱싱 기능은 포함하지 않습니다.

## 6. Design Considerations

- 전체 UI는 개발자 친화적이어야 합니다.
- 긴 hex 데이터, selector, address, topic, 이벤트 파라미터를 읽기 좋게 섹션화해야 합니다.
- 주요 화면은 카드 또는 패널 기반 레이아웃을 사용하고, 각 패널은 제목과 액션 버튼을 가져야 합니다.
- Drag and drop 동작은 직관적이어야 하며, 삭제와 크기 조절 동작도 쉽게 발견 가능해야 합니다.
- 시각적 강조보다 정보 밀도와 가독성을 우선해야 합니다.
- 다크 모드 지원 여부는 추후 결정 항목으로 남깁니다.

## 7. Technical Considerations

- 클라이언트 체인 상호작용 라이브러리는 `viem`을 사용해야 합니다.
- 체인 목록은 `chainList.ts`에서 중앙 관리해야 합니다.
- 멀티체인 검색은 병렬 Promise 실행 후 가장 먼저 유효 결과를 채택하는 구조를 사용해야 합니다.
- ABI 조회는 외부 raw GitHub JSON 리소스에 의존하므로 실패 가능성을 전제로 캐싱 및 예외 처리를 고려해야 합니다.
- 트랜잭션, receipt, 로그 데이터 조회 시 체인별 RPC 응답 차이를 고려해야 합니다.
- selector 기반 조회는 function selector와 error selector, event topic 처리 방식을 구분해야 합니다.
- 위젯 레이아웃 구현 시 drag-and-drop 및 resize를 안정적으로 지원하는 프론트엔드 라이브러리 도입을 고려해야 합니다.
- 성능 관점에서 동일 selector에 대한 ABI 재조회는 최소화하는 것이 바람직합니다.

## 8. Success Metrics
- 사용성 테스트에서 개발자 사용자가 “트랜잭션/디코딩 결과를 빠르게 읽고 이해할 수 있다”고 긍정 평가하는 비율이 높아야 합니다.
- 주요 테스트 케이스에서 트랜잭션 검색부터 디코딩 결과 확인까지의 흐름이 명확하고 혼란 없이 완료되어야 합니다.
- 사용자가 드래그 앤 드롭으로 위젯을 추가, 이동, 삭제, 크기 조절하는 작업을 별도 설명 없이 수행할 수 있어야 합니다.
- 입력 검증, 오류 메시지, 로딩 상태가 명확하게 표시되어 개발자 UX가 우수해야 합니다.
- 내부 QA 기준에서 지원 체인 대상 멀티체인 검색과 calldata/event/error 디코딩이 안정적으로 동작해야 합니다.

## 9. Open Questions
- 프론트엔드 프레임워크는 무엇을 사용할지 아직 정해지지 않았습니다.
- 레이아웃 상태를 브라우저 로컬 스토리지에 저장할지 여부는 아직 정해지지 않았습니다.
- 이벤트 로그 디코딩 시 ABI archive의 이벤트 지원 범위와 조회 경로가 function ABI와 동일한지 확인이 필요합니다.
- error decoder에서 ABI archive 외에 추가적인 selector registry를 함께 사용할지 여부는 아직 정해지지 않았습니다.
- 다크 모드, 반응형 모바일 UI, 테이블/JSON 보기 전환 등의 부가 UX 범위는 아직 정해지지 않았습니다.
- 검색 입력이 트랜잭션 해시만 지원하는지, 향후 컨트랙트 주소 또는 블록 단위 검색까지 확장할지 여부는 아직 정해지지 않았습니다.
