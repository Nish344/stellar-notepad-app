import { Server as MCPServer } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as StellarSdk from "@stellar/stellar-sdk";

interface Env {
  STELLAR_SECRET_KEY: string;
}

// Helper to create SSE response
function createSSEResponse(
  responseStream: ReadableStream,
  headers: Headers = new Headers()
): Response {
  headers.set("Content-Type", "text/event-stream");
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  return new Response(responseStream, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // =====================================================
    //              SSE MCP ENDPOINT
    // =====================================================
    if (url.pathname === "/sse") {
      const server = new MCPServer(
        {
          name: "stellar-notepad",
          version: "1.0.0",
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      // -----------------------------------------------
      // Tool definitions visible to MCP clients
      // -----------------------------------------------
      const tools = [
        {
          name: "getAccountData",
          description: "Fetches all notes stored in a Stellar account's data attributes.",
          inputSchema: {
            type: "object",
            properties: {
              publicKey: { type: "string", description: "Target Stellar account public key" },
            },
            required: ["publicKey"],
          },
        },
        {
          name: "saveNote",
          description: "Writes/updates a note (account data entry) on-chain.",
          inputSchema: {
            type: "object",
            properties: {
              publicKey: { type: "string" },
              noteName: { type: "string" },
              noteValue: { type: "string" },
            },
            required: ["publicKey", "noteName", "noteValue"],
          },
        },
        {
          name: "deleteNote",
          description: "Deletes a note from account data by setting its value to null.",
          inputSchema: {
            type: "object",
            properties: {
              publicKey: { type: "string" },
              noteName: { type: "string" },
            },
            required: ["publicKey", "noteName"],
          },
        },
      ];

      // -----------------------------------------------
      // List tools
      // -----------------------------------------------
      server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

      // -----------------------------------------------
      // CALL TOOL HANDLER
      // -----------------------------------------------
      server.setRequestHandler(CallToolRequestSchema, async (req) => {
        const { name, arguments: args } = req.params;

        try {
          const horizon = new StellarSdk.Horizon.Server(
            "https://horizon-testnet.stellar.org"
          );

          // =====================================================
          // 1. getAccountData
          // =====================================================
          if (name === "getAccountData") {
            const { publicKey } = args as { publicKey: string };
            const account = await horizon.loadAccount(publicKey);

            const notes: Record<string, string> = {};
            for (const [key, b64] of Object.entries(account.data_attr)) {
              try {
                notes[key] = Buffer.from(b64 as string, "base64").toString("utf8");
              } catch {
                notes[key] = "(binary)";
              }
            }

            return {
              content: [{ type: "json", json: { success: true, publicKey, notes } }],
            };
          }

          // =====================================================
          // 2. saveNote
          // =====================================================
          if (name === "saveNote") {
            if (!env.STELLAR_SECRET_KEY) {
              throw new Error("STELLAR_SECRET_KEY not set in environment.");
            }

            const { publicKey, noteName, noteValue } = args as {
              publicKey: string;
              noteName: string;
              noteValue: string;
            };

            const source = StellarSdk.Keypair.fromSecret(env.STELLAR_SECRET_KEY);

            const account = await horizon.loadAccount(publicKey);

            const tx = new StellarSdk.TransactionBuilder(account, {
              fee: StellarSdk.BASE_FEE,
              networkPassphrase: StellarSdk.Networks.TESTNET,
            })
              .addOperation(
                StellarSdk.Operation.manageData({
                  name: noteName,
                  value: noteValue,
                })
              )
              .setTimeout(30)
              .build();

            tx.sign(source);
            const result = await horizon.submitTransaction(tx);

            return {
              content: [{
                type: "json",
                json: {
                  success: true,
                  noteName,
                  noteValue,
                  transactionHash: result.hash,
                  publicKey,
                }
              }],
            };
          }

          // =====================================================
          // 3. deleteNote
          // =====================================================
          if (name === "deleteNote") {
            if (!env.STELLAR_SECRET_KEY) {
              throw new Error("STELLAR_SECRET_KEY not set in environment.");
            }

            const { publicKey, noteName } = args as {
              publicKey: string;
              noteName: string;
            };

            const source = StellarSdk.Keypair.fromSecret(env.STELLAR_SECRET_KEY);

            const account = await horizon.loadAccount(publicKey);

            const tx = new StellarSdk.TransactionBuilder(account, {
              fee: StellarSdk.BASE_FEE,
              networkPassphrase: StellarSdk.Networks.TESTNET,
            })
              .addOperation(
                StellarSdk.Operation.manageData({
                  name: noteName,
                  value: null,
                })
              )
              .setTimeout(30)
              .build();

            tx.sign(source);
            const result = await horizon.submitTransaction(tx);

            return {
              content: [{
                type: "json",
                json: {
                  success: true,
                  deleted: true,
                  noteName,
                  transactionHash: result.hash,
                  publicKey,
                }
              }],
            };
          }

          // Unknown tool
          throw new Error(`Unknown tool: ${name}`);
        } catch (err: any) {
          return {
            isError: true,
            content: [{ type: "text", text: err.message || String(err) }],
          };
        }
      });

      // -----------------------------------------------
      // SSE Transport
      // -----------------------------------------------
      const transport = new SSEServerTransport("/sse", request);
      await server.connect(transport);
      return createSSEResponse(transport.response!);
    }

    // =====================================================
    //             Root info endpoint
    // =====================================================
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify(
          {
            name: "Stellar Notepad MCP Server",
            version: "1.0.0",
            message: "Use /sse for MCP client connections",
            tools: ["getAccountData", "saveNote", "deleteNote"],
          },
          null,
          2
        ),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  },
};
