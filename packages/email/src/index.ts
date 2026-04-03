export { EmailSendError } from "./errors";
export * from "./senders/auth";

import * as authSenders from "./senders/auth";

export const email = { ...authSenders };
