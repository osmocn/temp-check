import { Text } from "@react-email/components";
import { EmailLayout } from "../../components/email-layout";
import * as React from "react";

interface PasswordResetSuccessProps {
  name: string;
}

export default function PasswordResetSuccessTemplate({ name }: PasswordResetSuccessProps) {
  return (
    <EmailLayout preview="Your password has been reset successfully">
      <Text style={styles.heading}>Password reset successful</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        Your password has been reset successfully. You can now sign in with your
        new password.
      </Text>
      <Text style={styles.disclaimer}>
        If you didn't reset your password, your account may be compromised.
        Please contact us immediately at support@coco-kit.com.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 20px",
  },
  body: {
    fontSize: "15px",
    color: "#3f3f46",
    lineHeight: "1.6",
    margin: "0 0 12px",
  },
  disclaimer: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0",
  },
} satisfies Record<string, React.CSSProperties>;
