import { edenTreaty } from "@elysiajs/eden";
import type { App } from "api";

const api: ReturnType<typeof edenTreaty<App>>["api"] = edenTreaty<App>("http://0.0.0.0:7809/").api;
export default api;
