export default function TermsPage() {
  return (
    <main style={{ padding: 20 }}>
      <div className="prose-content" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5em", fontWeight: 400, margin: "0 0 6px" }}>Terms of Use</h1>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Last Updated: April 13, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Now I See Web3 (&quot;the Service&quot;), available at{" "}
          <a href="https://nowiseeweb3.xyz" style={{ color: "var(--foreground)" }}>nowiseeweb3.xyz</a>,
          you agree to be bound by these Terms of Use. If you do not agree, please discontinue use of the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Now I See Web3 is a free, open-source on-chain data analysis tool for Web3 developers. The Service provides
          read-only blockchain data inspection features including transaction analysis, calldata decoding, error decoding,
          function selector lookup, and event topic hash generation. The Service does not provide wallet connectivity,
          token transfers, investment advice, or any financial services.
        </p>

        <h2>3. No Financial Services</h2>
        <p>
          The Service is a developer debugging tool only. It does not facilitate, recommend, or enable cryptocurrency
          transactions, token transfers, trading, investing, or any financial activity. No funds are held, transferred,
          or managed through this Service.
        </p>

        <h2>4. Data Sources and Accuracy</h2>
        <p>
          The Service retrieves data from public blockchain RPC endpoints and the open-source ABI Archive. While we
          strive for accuracy, blockchain data is provided &quot;as is&quot; without warranty. Decoded calldata and event
          logs depend on the availability and correctness of ABI data in the archive. We do not guarantee the completeness
          or accuracy of decoded results.
        </p>

        <h2>5. User Responsibilities</h2>
        <p>
          You are responsible for the data you input into the Service. Do not submit sensitive private keys, passwords,
          or personal information through any tool on this site. The Service processes only publicly available on-chain data.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          The source code of Now I See Web3 is open-source and available on{" "}
          <a href="https://github.com/imelon2/now-i-see-web3" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
            GitHub
          </a>. The brand name &quot;Now I See Web3&quot;, logo, and visual design are the property of the project creator.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties, express or implied.
          In no event shall the creator or contributors be liable for any damages arising from the use or inability to use
          the Service, including but not limited to direct, indirect, incidental, or consequential damages.
        </p>

        <h2>8. Third-Party Services</h2>
        <p>
          The Service uses Google AdSense for advertising and connects to third-party blockchain RPC providers. These
          third-party services have their own terms and privacy policies. We are not responsible for the practices of
          these external services.
        </p>

        <h2>9. Modifications</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated
          &quot;Last Updated&quot; date. Continued use of the Service after modifications constitutes acceptance of the
          revised Terms.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions about these Terms, please contact us via{" "}
          <a href="/contact" style={{ color: "var(--foreground)" }}>the contact page</a> or through our{" "}
          <a href="https://github.com/imelon2/now-i-see-web3" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
            GitHub repository
          </a>.
        </p>
      </div>
    </main>
  );
}
