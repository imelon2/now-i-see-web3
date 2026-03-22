import type { Metadata } from "next";
import { AdSenseAd } from "@/components/ui/AdSenseAd";

export const metadata: Metadata = {
  title: "Transaction Analyzer Guide",
  description:
    "Complete guide to analyzing Ethereum transactions. Learn how to search transactions across multiple chains and interpret decoded calldata, event logs, and transaction details.",
  openGraph: {
    title: "Transaction Analyzer Guide | Now I See Web3",
    description:
      "Complete guide to analyzing Ethereum transactions across multiple EVM chains.",
    url: "https://nowiseeweb3.xyz/docs/tx-analyzer",
  },
};

export default function TxAnalyzerGuidePage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Transaction Analyzer Guide</h1>

        <h2>What Does the Transaction Analyzer Do?</h2>
        <p>
          The Transaction Analyzer is a tool that takes an Ethereum transaction hash and retrieves the complete
          details of that transaction from the blockchain. Unlike a typical block explorer, the Transaction Analyzer
          goes beyond showing raw data — it automatically decodes the transaction&apos;s calldata and event logs,
          giving you an instant, human-readable view of what the transaction actually did.
        </p>
        <p>
          You do not need to know which network a transaction belongs to. The Transaction Analyzer searches across
          multiple EVM-compatible chains simultaneously, automatically finding the right network for your transaction
          hash. This multi-chain search eliminates the tedious process of manually switching between different block
          explorers for each network.
        </p>

        <h2>Supported Networks</h2>
        <p>
          The Transaction Analyzer supports a wide range of EVM-compatible networks. When you submit a transaction
          hash, the tool queries all supported networks in parallel and returns results from the first network where
          the transaction is found. Supported networks include:
        </p>
        <ul>
          <li>Ethereum Mainnet</li>
          <li>Arbitrum One and Arbitrum Nova</li>
          <li>Optimism</li>
          <li>Base</li>
          <li>Polygon (Matic)</li>
          <li>Avalanche C-Chain</li>
          <li>BNB Smart Chain</li>
          <li>And additional EVM testnets and layer-2 networks</li>
        </ul>
        <p>
          The list of supported networks is updated regularly. If you need support for a specific network, you can
          request it via the{" "}
          <a href="https://github.com/imelon2/now-i-see-web3" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>
          .
        </p>

        <h2>How to Search a Transaction</h2>
        <p>
          Using the Transaction Analyzer is straightforward. Follow these steps:
        </p>
        <ul>
          <li>
            <strong>Step 1:</strong> Navigate to the{" "}
            <a href="/tx-analyzer">Transaction Analyzer</a> page.
          </li>
          <li>
            <strong>Step 2:</strong> Enter a transaction hash (also called a transaction ID or txHash) in the search
            field. A transaction hash is a 66-character hexadecimal string starting with <code>0x</code>, for
            example:{" "}
            <code>0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060</code>.
          </li>
          <li>
            <strong>Step 3:</strong> Press Enter or click the search button. The tool will query all supported
            networks in parallel.
          </li>
          <li>
            <strong>Step 4:</strong> Once the transaction is found, the results panel displays the full transaction
            details, including decoded calldata and event logs.
          </li>
        </ul>

        <h2>Understanding the Results</h2>
        <p>
          The Transaction Analyzer returns four categories of information for each transaction:
        </p>
        <ul>
          <li>
            <strong>Transaction Details</strong> — Basic transaction metadata: block number, timestamp, from address,
            to address, value (ETH or native token transferred), gas used, gas price, and transaction status
            (success or failure).
          </li>
          <li>
            <strong>Decoded Calldata</strong> — The input data of the transaction, decoded into the function name
            and parameter values. This tells you exactly which contract function was called and with what arguments.
            If the transaction was a plain ETH transfer with no calldata, this section will be empty.
          </li>
          <li>
            <strong>Event Logs</strong> — All events emitted during the transaction execution. Events are decoded
            into their human-readable form, showing the event name and indexed and non-indexed parameter values.
            For ERC-20 transfers, you will typically see a <code>Transfer(address,address,uint256)</code> event.
          </li>
          <li>
            <strong>Network</strong> — The name of the blockchain network where the transaction was found, confirming
            which chain the hash belongs to.
          </li>
        </ul>

        <h2>Example: Analyzing a Uniswap Swap Transaction</h2>
        <p>
          Let&apos;s walk through what the Transaction Analyzer shows for a Uniswap V2 token swap on Ethereum
          mainnet.
        </p>
        <p>
          When you submit the transaction hash, the analyzer returns:
        </p>
        <ul>
          <li>
            <strong>From:</strong> The wallet address that initiated the swap
          </li>
          <li>
            <strong>To:</strong> The Uniswap V2 Router contract address
          </li>
          <li>
            <strong>Decoded Calldata:</strong> <code>swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)</code> with all parameter values filled in — the exact amount of input tokens, the minimum output amount, the token path (e.g., USDC → WETH → DAI), the recipient address, and the deadline timestamp.
          </li>
          <li>
            <strong>Event Logs:</strong> Multiple events, typically including two <code>Transfer</code> events (one
            for the input token being moved to the pool, one for the output token being sent to the recipient) and
            two <code>Sync</code> events from the liquidity pools showing the updated reserve balances.
          </li>
        </ul>
        <p>
          In a few seconds, you have a complete picture of the swap: exactly what tokens were exchanged, in what
          amounts, through which pools, and to which address — all without manually parsing hex data.
        </p>

        <AdSenseAd />

        <h2>Tips and Limitations</h2>
        <ul>
          <li>
            <strong>Transaction finality:</strong> The analyzer searches live blockchain data. For very recent
            transactions that have not yet been included in a block, results may not appear immediately. Wait for
            the transaction to be confirmed and then search again.
          </li>
          <li>
            <strong>Unverified contracts:</strong> If the target contract&apos;s ABI is not publicly available
            (i.e., the contract is not verified on any block explorer), the calldata and events may not be fully
            decoded. The raw hex will still be shown.
          </li>
          <li>
            <strong>Internal transactions:</strong> The Transaction Analyzer shows the top-level transaction data.
            Internal calls (contract-to-contract calls within the same transaction) are not displayed separately but
            are reflected in the event logs.
          </li>
          <li>
            <strong>Hash format:</strong> Always use the full 66-character transaction hash starting with{" "}
            <code>0x</code>. Block numbers or wallet addresses are not valid inputs for this tool.
          </li>
        </ul>
      </div>
    </main>
  );
}
