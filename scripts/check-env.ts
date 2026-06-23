import "dotenv/config";
import { assertEnv } from "../src/lib/env";

assertEnv();
console.log("✓ environment variables OK");
