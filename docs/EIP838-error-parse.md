Implement an error data decoding function for the `/error-decoder` page in the **Now I See Web3** project.

## Goal
When a user inputs EVM revert hex data, parse it into a human-readable error result.

## Requirements
Use the EIP-838-style error parsing approach and support these 2 cases:

### 1. Standard revert string
This is the built-in `Error(string)` format.

- Signature: `Error(string)`
- Selector: `0x08c379a0`
- Encoding rule:
  `0x08c379a0 + abi.encode("String Error")`

Example:
0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e5265717569726520436173652030000000000000000000000000000000000000

Expected output should include:
- error type: `Error(string)`
- decoded message string

### 2. Custom error
Support Solidity custom errors such as:
```solidity
error StringError(uint256,string);
```

- Signature: `StringError(uint256,string)`
- Selector rule:
  `bytes4(keccak256("StringError(uint256,string)"))`
- Encoding rule:
  `selector + abi.encode(6, "String Error")`

Example:
0x6f0269ec00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000c537472696e67204572726f720000000000000000000000000000000000000000

Expected output should include:
- selector
- resolved error signature if known
- decoded argument values

## Implementation notes
- Write a parsing function that accepts a hex string.
- Detect the first 4 bytes as the selector.
- If selector is `0x08c379a0`, decode as `Error(string)`.
- Otherwise, try to decode as a custom error using a provided ABI error definition.
- Return a structured result object that the UI can render easily.
- Handle invalid hex, too-short input, and decode failures gracefully.

Please provide:
1. the parsing function
2. the result type/interface
3. example usage for both cases