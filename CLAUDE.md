# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Install dependencies:
```
npm install
```

Run the scanner:
```
# Local node (--port required if --url is not provided)
./scanner --port <port> --block-start <block> --block-end <block> --query '<query>'

# Public provider (Infura, Alchemy, etc.)
./scanner --url https://mainnet.infura.io/v3/<key> --block-start <block> --block-end <block> --query '<query>'
```

`--delay <ms>` sets the pause between block iterations (default: 1000ms).

Run the hex utility (generates function signatures/keccak256 hashes):
```
./hex --input 'transfer(address,uint256)'
./hex --input 'transfer(address,uint256)' --signature   # 4-byte selector only
```

There are no tests configured (`npm test` exits with an error).

## Architecture

Two executable entry points (`scanner` and `hex`), both `#!/usr/bin/env node` scripts using `commander` for CLI parsing.

**`scanner`** — the main tool. Iterates over a range of Ethereum blocks, finds contract-creation transactions (those with no `to` address), and matches their creation data or runtime bytecode against a user-supplied query expression.

**`hex`** — a small utility that computes `keccak256` hashes of ABI function signatures, used to generate the hex values that queries match against.

### Query language (`utils/search-utils.js`)

The query syntax wraps tokens in `<< >>`:
- `<<transfer(address,uint256)>>` — a Solidity function signature; gets hashed to its 4-byte selector
- `<<0x21[0-9]{4}3131>>` — a raw hex pattern; supports regex

At evaluation time (`SearchUtils`):
1. `hexaizeQuery()` converts `<< >>` tokens into `< >` tokens, replacing signatures with their 4-byte hex selectors and stripping the `0x` prefix.
2. `evaluateQuery()` processes `! <token>` (NOT), `<token>` (presence match), `&&` (AND → `*`), `||` (OR → `+`) and delegates to `mathjs` for boolean arithmetic.

### Data flow

```
scanner CLI
  → validateCommandLine()       parses + validates args → SearchParameters
  → statusUtils.retrieveNetworkState()  connects via JsonRpcProvider
  → for each block:
      provider.getBlock() → provider.getTransaction() → filter to contract creations (tx.to == null)
      → provider.getTransactionReceipt() for contractAddress
      → provider.getCode() / transaction.data for bytecode
      → searchUtils.foundMatch(bytecode)
      → print match + optionally append to JSON output file
```

### `utils/` modules

| File | Purpose |
|---|---|
| `search-parameters.js` | Plain data object holding all scan configuration (url, delay, block range, query, flags) |
| `search-utils.js` | Query parsing and bytecode matching logic |
| `network-state.js` | Plain data object holding provider, signer, and network metadata |
| `status-utils.js` | Connects to the RPC node via URL, populates `NetworkState`, prints network/contract status; signer setup is optional and skipped gracefully for read-only public providers |
| `contract-utils.js` | Thin wrappers around `ethers.js` for provider creation and contract deployment (used externally, not by scanner itself); `getProvider(url)` accepts any JSON-RPC URL |
| `print-utils.js` | Columnar console output helpers |

### Key dependencies

- **ethers v4** (`ethers.providers.JsonRpcProvider`) — RPC connection; note this is the older v4 API (e.g. `ethers.utils.id`, not `ethers.id`)
- **commander v2** — CLI parsing
- **mathjs** — evaluates the boolean query expression after token substitution

### Output file format

JSON array written to `--output-file`. Each matched contract entry:
```json
{
  "blockNumber": 7264284,
  "transactionHash": "0x...",
  "contractAddress": "0x...",
  "ownerAddress": "0x...",
  "transactionNonce": 0,
  "transactionValue": "0",
  "contractBalance": "0",
  "transactionData": "0x...",
  "contractBytecode": "0x..."
}
```

`template-input-signature` is an example query file for use with `--query-file`.
