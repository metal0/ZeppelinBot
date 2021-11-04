// tslint:disable:no-console

import { MINUTES } from "../../utils";
import { cleanupMessages } from "../cleanup/messages";

const LOOP_INTERVAL = 5 * MINUTES;

export async function runSavedMessageCleanupLoop() {
  try {
    await cleanupMessages();
  } finally {
    setTimeout(() => runSavedMessageCleanupLoop(), LOOP_INTERVAL);
  }
}
