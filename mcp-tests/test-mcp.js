import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  console.log("Connecting to MCP server...");

  //const transport = new SSEClientTransport("http://localhost:8787/sse");
  const transport = new SSEClientTransport("https://organic-space-rotary-phone-x5wjq644gxgv2v777-8787.app.github.dev/sse");
  const client = new Client({ name: "local-tester" }, { transport });

  await client.connect();

  console.log("Connected!");

  // ---------- LIST TOOLS ----------
  const tools = await client.listTools();
  console.log("TOOLS:", tools);

  // ---------- CALL getAccountData ----------
  const account = "PUT_YOUR_TESTNET_PUBLIC_KEY_HERE";

  const res1 = await client.callTool("getAccountData", {
    publicKey: account,
  });
  console.log("\ngetAccountData result:");
  console.log(res1);

  // ---------- CALL saveNote ----------
  const res2 = await client.callTool("saveNote", {
    publicKey: account,
    noteName: "note1",
    noteValue: "Hello from codespaces!",
  });
  console.log("\nsaveNote result:");
  console.log(res2);

  // ---------- CALL deleteNote ----------
  const res3 = await client.callTool("deleteNote", {
    publicKey: account,
    noteName: "note1",
  });
  console.log("\ndeleteNote result:");
  console.log(res3);

  client.close();
}

main();
