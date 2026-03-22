import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Now I See Web3 team. Report bugs, request features, or ask questions via GitHub.",
  openGraph: {
    title: "Contact | Now I See Web3",
    description: "Get in touch with the Now I See Web3 team via GitHub.",
    url: "https://nowiseeweb3.xyz/contact",
  },
};

export default function ContactPage() {
  return (
    <main>
      <div className="prose-content">
        <h1>Contact</h1>

        <h2>Get in Touch</h2>
        <p>
          Now I See Web3 is an open-source project. The best way to get in touch is through GitHub, where you can
          report bugs, suggest new features, ask questions, or start a discussion.
        </p>

        <h2>GitHub Repository</h2>
        <p>
          For bug reports and feature requests, please open an issue on the project repository:
        </p>
        <p>
          <a
            href="https://github.com/imelon2/now-i-see-web3"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/imelon2/now-i-see-web3
          </a>
        </p>
        <p>
          When reporting a bug, please include:
        </p>
        <ul>
          <li>A description of the issue and the steps to reproduce it</li>
          <li>The input data you used (transaction hash, calldata, or error data)</li>
          <li>The expected result versus the actual result</li>
          <li>Your browser and operating system</li>
        </ul>

        <h2>Developer Contact</h2>
        <p>
          Now I See Web3 is built and maintained by{" "}
          <a
            href="https://github.com/imelon2"
            target="_blank"
            rel="noopener noreferrer"
          >
            choi.eth
          </a>
          . You can reach out directly through GitHub for collaboration inquiries or other questions.
        </p>

        <h2>Privacy Inquiries</h2>
        <p>
          For questions related to privacy or data handling, please open a GitHub Issue in the project repository
          and label it as a privacy inquiry. We will respond as soon as possible.
        </p>
      </div>
    </main>
  );
}
