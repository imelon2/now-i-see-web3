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

        <h2>Cookies and Third-Party Advertising</h2>
        <p>
          Now I See Web3 may use Google AdSense, a third-party advertising service provided by Google LLC, to display
          advertisements on our website. When active, Google AdSense uses cookies to serve ads based on your prior
          visits to our site and other sites on the internet.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your
          visit to our site and other sites on the internet. You can opt out of personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ad Settings
          </a>
          .
        </p>

        <h2>DoubleClick DART Cookie</h2>
        <p>
          Google, as a third-party vendor, uses cookies known as DART cookies to serve ads on our site based on your
          visit to our site and other sites on the internet. The use of DART cookies enables Google and its partners
          to serve ads to users based on their visit to our site and other sites on the internet.
        </p>
        <p>
          Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy
          policy at{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            policies.google.com/technologies/ads
          </a>
          .
        </p>

        <h2>Third-Party Privacy Policies</h2>
        <p>
          Our Privacy Policy does not apply to other advertisers or websites. We advise you to consult the respective
          Privacy Policies of these third-party ad servers for more detailed information. This includes their
          practices and instructions about how to opt out of certain options.
        </p>
        <ul>
          <li>
            Google Privacy Policy:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/privacy
            </a>
          </li>
          <li>
            Google Advertising Policies:{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/ads
            </a>
          </li>
        </ul>

        <h2>Opting Out of Personalized Advertising</h2>
        <p>
          You can opt out of personalized advertising from Google and its partners through the following resources:
        </p>
        <ul>
          <li>
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ad Settings
            </a>{" "}
            — Manage your Google ad personalization preferences
          </li>
          <li>
            <a
              href="https://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Network Advertising Initiative (NAI) Opt-Out
            </a>{" "}
            — Opt out of interest-based advertising from NAI member companies
          </li>
        </ul>

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
          If you have any questions or concerns about this Privacy Policy, please open an issue on our{" "}
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
