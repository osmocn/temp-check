import { getEnvVariable } from "@coco-kit/utils";
import { Resend } from "resend";

export const resend = new Resend(getEnvVariable("RESEND_API_KEY"));
