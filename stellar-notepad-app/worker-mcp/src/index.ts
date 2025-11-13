import { MCPServer } from "@cloudflare/ai-utils";

export default {
  async fetch(req: Request, env: any, ctx: any) {
    const server = new MCPServer({ env });

    // ---------- MCP Endpoint ----------
    const { readable, writable } = new TransformStream();
    server.connect(writable);
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
      }
    });
  }
};
