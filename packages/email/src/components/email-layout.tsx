import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import * as React from "react";

const BRAND_NAME = "Coco Kit";
const SUPPORT_EMAIL = "support@coco-kit.com";
const COMPANY_ADDRESS = "Coco Kit Inc.";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>{BRAND_NAME}</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Body content */}
          <Section style={styles.content}>{children}</Section>

          <Hr style={styles.divider} />

          {/* Signature */}
          <Section style={styles.signatureSection}>
            <Text style={styles.signatureText}>The {BRAND_NAME} team</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>{COMPANY_ADDRESS}</Text>
            <Text style={styles.footerText}>
              Questions?{" "}
              <Link href={`mailto:${SUPPORT_EMAIL}`} style={styles.footerLink}>
                {SUPPORT_EMAIL}
              </Link>
            </Text>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: "0",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    maxWidth: "560px",
    margin: "0 auto",
    padding: "0",
    overflow: "hidden" as const,
  },
  header: {
    padding: "32px 40px 24px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
  },
  divider: {
    borderColor: "#e4e4e7",
    margin: "0",
  },
  content: {
    padding: "32px 40px",
  },
  signatureSection: {
    padding: "24px 40px",
  },
  signatureText: {
    fontSize: "15px",
    color: "#3f3f46",
    margin: "0",
  },
  footer: {
    padding: "24px 40px",
    backgroundColor: "#fafafa",
  },
  footerText: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0 0 4px",
    lineHeight: "1.5",
  },
  footerLink: {
    color: "#71717a",
    textDecoration: "underline",
  },
} satisfies Record<string, React.CSSProperties>;
