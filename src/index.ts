import { log, LogLevel } from "./services/log";

const port = Number(process.env.PORT ?? 8080);

if (process.env.WS) {
  const { initServer } = await import("./services/websocket");
  initServer(port);
} else {
  const { initServer } = await import("./services/sse");
  initServer(port);
}

log(`The server is running on port ${port}`, LogLevel.INFO, true);
