import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, AlertCircle } from 'lucide-react';
import './styles.css';

// ⚠️ REPLACE WITH YOUR DEPLOYED CONTRACT ID
const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';
const NETWORK = 'TESTNET'; // or 'PUBLIC' for mainnet

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        console.log('Freighter not connected');
      }
    }
  };

  const connectWallet = async () => {
    if (!window.freighterApi) {
      setError('Please install Freighter wallet extension');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await window.freighterApi.setAllowed();
      const key = await window.freighterApi.getPublicKey();
      setPublicKey(key);
      setIsConnected(true);
      loadNotes(key);
    } catch (err) {
      setError('Failed to connect wallet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (key) => {
    try {
      // TODO: Implement contract call to get_user_notes
      // This requires Soroban SDK integration
      console.log('Loading notes for:', key);
      
      // Placeholder - Replace with actual contract call
      setNotes([]);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  };

  const createNote = async () => {
    if (!newNote.trim()) {
      setError('Please enter a note');
      return;
    }

    if (newNote.length > 280) {
      setError('Note must be 280 characters or less');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // TODO: Implement contract call to create_note
      // This requires:
      // 1. Import @stellar/stellar-sdk
      // 2. Build transaction with contract invocation
      // 3. Sign with Freighter
      // 4. Submit to network
      
      console.log('Creating note:', newNote);
      
      // Placeholder success
      setSuccess('Note created successfully!');
      setNewNote('');
      
      // Reload notes after creation
      setTimeout(() => loadNotes(publicKey), 2000);
      
    } catch (err) {
      setError('Failed to create note: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      setLoading(true);
      setError('');

      // TODO: Implement contract call to delete_note
      console.log('Deleting note:', noteId);
      
      setSuccess('Note deleted!');
      setTimeout(() => loadNotes(publicKey), 2000);
      
    } catch (err) {
      setError('Failed to delete note: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <BookOpen size={40} />
            <h1>Stellar Notepad</h1>
          </div>
          <p className="subtitle">Store your notes on the blockchain forever</p>
        </header>

        {/* Main Card */}
        <div className="card">
          {!isConnected ? (
            <div className="connect-section">
              <BookOpen size={64} className="icon-large" />
              <h2>Connect Your Wallet</h2>
              <p>Connect Freighter to start storing notes on Stellar</p>
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
              </button>
            </div>
          ) : (
            <div>
              {/* Wallet Info */}
              <div className="wallet-info">
                <p className="label">Connected Wallet</p>
                <p className="address">{publicKey}</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="alert alert-success">
                  <p>✓ {success}</p>
                </div>
              )}

              {/* Create Note */}
              <div className="note-input-section">
                <label className="label">New Note (max 280 chars)</label>
                <div className="input-group">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    maxLength={280}
                    placeholder="Enter your note..."
                    className="input"
                  />
                  <button
                    onClick={createNote}
                    disabled={loading || !newNote.trim()}
                    className="btn btn-primary"
                  >
                    <Plus size={20} />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <p className="char-count">{newNote.length}/280 characters</p>
              </div>

              {/* Notes List */}
              <div className="notes-section">
                <h3 className="notes-title">
                  <BookOpen size={24} />
                  Your Notes ({notes.length})
                </h3>

                {notes.length === 0 ? (
                  <div className="empty-state">
                    <BookOpen size={48} />
                    <p>No notes yet. Create your first note!</p>
                  </div>
                ) : (
                  <div className="notes-list">
                    {notes.map((note) => (
                      <div key={note.id} className="note-card">
                        <p className="note-content">{note.content}</p>
                        <div className="note-footer">
                          <p className="note-date">
                            {new Date(note.timestamp * 1000).toLocaleString()}
                          </p>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="btn btn-danger-small"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>Powered by Stellar & Soroban Smart Contracts</p>
        </footer>
      </div>
    </div>
  );
}

export default App;