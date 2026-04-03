import { getEnvVariable } from "@coco-kit/utils";
import { Resend } from "resend";

let resendClient: Resend | undefined;

function createResendClient() {
  return new Resend(getEnvVariable("RESEND_API_KEY"));
}

export function getResend() {
  resendClient ??= createResendClient();
  return resendClient;
}

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    return Reflect.get(getResend(), prop, receiver);
  },
});
