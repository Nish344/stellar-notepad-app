import React, { useState, useEffect } from "react";
import { AlertCircle, BookOpen, Plus, ExternalLink } from "lucide-react";

const StellarNotepad = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    checkFreighter();
  }, []);

  const checkFreighter = async () => {
    if (window.freighterApi) {
      try {
        const isAllowed = await window.freighterApi.isConnected();
        if (isAllowed) {
          const key = await window.freighterApi.getPublicKey();
          setPublicKey(key);
          setIsConnected(true);
          loadNotes(key);
        }
      } catch (err) {
        console.log("Freighter not connected");
      }
    }
  };

  const connectWallet = async () => {
    if (!window.freighterApi) {
      setError("Please install Freighter wallet extension");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await window.freighterApi.setAllowed();
      const key = await window.freighterApi.getPublicKey();
      setPublicKey(key);
      setIsConnected(true);
      loadNotes(key);
    } catch (err) {
      setError("Failed to connect wallet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (key) => {
    try {
      const response = await fetch(
        `https://horizon.stellar.org/accounts/${key}/transactions?limit=200`
      );
      const data = await response.json();

      const noteList = [];
      for (const tx of data._embedded.records) {
        try {
          const txDetail = await fetch(tx._links.self.href);
          const txData = await txDetail.json();
          if (txData.memo && txData.memo_type === "text") {
            noteList.push({
              text: txData.memo,
              date: new Date(txData.created_at).toLocaleString(),
              hash: txData.hash,
            });
          }
        } catch {}
      }
      setNotes(noteList);
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) {
      setError("Please enter a note");
      return;
    }

    if (newNote.length > 28) {
      setError("Note must be 28 characters or less");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTxHash("");

      const StellarSdk = window.StellarSdk;
      const server = new StellarSdk.Horizon.Server(
        "https://horizon.stellar.org"
      );

      const account = await server.loadAccount(publicKey);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })
        .addOperation(
          StellarSdk.Operation.manageData({
            name: "note_" + Date.now(),
            value: newNote,
          })
        )
        .addMemo(StellarSdk.Memo.text(newNote))
        .setTimeout(180)
        .build();

      const xdr = transaction.toXDR();

      const signedTx = await window.freighterApi.signTransaction(xdr, {
        network: "PUBLIC",
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      });

      const txResult = await server.submitTransaction(
        StellarSdk.TransactionBuilder.fromXDR(
          signedTx,
          StellarSdk.Networks.PUBLIC
        )
      );

      setTxHash(txResult.hash);
      setNewNote("");

      setTimeout(() => loadNotes(publicKey), 2000);
    } catch (err) {
      setError("Failed to save note: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">Stellar Notepad</h1>
          </div>
          <p className="text-purple-200 text-lg">
            Store your notes forever on the blockchain
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {!isConnected ? (
            <div className="text-center py-12">
              <BookOpen className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-purple-200 mb-8">
                Connect Freighter to start storing notes on Stellar
              </p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
              >
                {loading ? "Connecting..." : "Connect Freighter Wallet"}
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
                <p className="text-purple-200 text-sm mb-1">Connected Wallet</p>
                <p className="text-white font-mono text-sm break-all">
                  {publicKey}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {txHash && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                  <p className="text-green-200 mb-2">✓ Note saved successfully!</p>
                  <a
                    href={`https://stellar.expert/explorer/public/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 text-sm flex items-center gap-1"
                  >
                    View on Stellar Expert <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-purple-200 mb-3 font-semibold">
                  New Note (max 28 chars)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    maxLength={28}
                    placeholder="Enter your note..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none"
                  />
                  <button
                    onClick={saveNote}
                    disabled={loading || !newNote.trim()}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
                <p className="text-purple-300 text-sm mt-2">
                  {newNote.length}/28 characters
                </p>
              </div>

              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-yellow-400" />
                Your Notes ({notes.length})
              </h3>

              {notes.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-300">No notes yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <p className="text-white font-medium mb-2">{note.text}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-300 text-xs">{note.date}</p>
                        <a
                          href={`https://stellar.expert/explorer/public/tx/${note.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1"
                        >
                          View TX <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-purple-200 text-sm">
          <p>Notes are stored permanently on the Stellar blockchain</p>
          <p className="mt-2">Powered by Stellar & Freighter Wallet</p>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/11.2.2/stellar-sdk.min.js"></script>
      </div>
    </div>
  );
};

export default StellarNotepad;
