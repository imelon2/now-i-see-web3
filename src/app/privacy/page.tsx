import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Now I See Web3. Learn how we handle data, cookies, and third-party advertising services.",
  openGraph: {
    title: "Privacy Policy | Now I See Web3",
    description: "Privacy Policy for Now I See Web3.",
    url: "https://nowiseeweb3.xyz/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Privacy Policy</h1>
        <p>
          <strong>Last Updated: March 22, 2026</strong>
        </p>
        <p>
          This Privacy Policy describes how Now I See Web3 (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
          operated at <a href="https://nowiseeweb3.xyz">nowiseeweb3.xyz</a>, collects, uses, and shares information
          when you visit or use our website.
        </p>

        <h2>Information We Collect</h2>
        <p>
          Now I See Web3 does not collect any personally identifiable information directly. We do not require account
          registration, and we do not store any data you enter into our tools (transaction hashes, calldata, or error
          data). All decoding operations are performed in your browser or via public blockchain APIs without
          associating any data with your identity.
        </p>

        <h2>Log Files</h2>
        <p>
          Like most websites, our hosting provider automatically collects standard web server log data. This may
          include your IP address, browser type, browser version, the pages you visit on our site, the date and time
          of your visit, and referring URLs. This data is used for hosting, security, and performance purposes only
          and is not used to personally identify you.
        </p>

        <h2>Third-Party Advertising (Google AdSense)</h2>
        <p>
          We use Google AdSense to display advertisements on our website. Google AdSense may use cookies and web
          beacons to serve ads based on your prior visits to this or other websites. Google&apos;s use of advertising
          cookies enables it and its partners to serve ads based on your browsing patterns. You may opt out of
          personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>
          . For more information about how Google uses data when you use our site, please visit{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
            Google&apos;s Privacy &amp; Terms
          </a>
          .
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Now I See Web3 is intended for use by developers and does not knowingly collect any personal information
          from children under the age of 13. If you believe a child has provided personal information to us, please
          contact us so we can take appropriate action.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an
          updated &quot;Last Updated&quot; date. We encourage you to review this page periodically for any changes.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
          <a href="mailto:yuanhe369369@gmail.com">yuanhe369369@gmail.com</a>{" "}
          or open an issue on our{" "}
          <a
            href="https://github.com/imelon2/now-i-see-web3"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          .
        </p>
      </div>
    </main>
  );
}
