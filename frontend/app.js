// ⚠️ REPLACE WITH YOUR DEPLOYED CONTRACT ID
const CONTRACT_ID = 'YOUR_CONTRACT_ID_HERE';
const NETWORK = 'TESTNET'; // or 'PUBLIC' for mainnet

// State
let publicKey = '';
let notes = [];
let isLoading = false;

// DOM Elements
const connectSection = document.getElementById('connectSection');
const mainSection = document.getElementById('mainSection');
const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');
const noteInput = document.getElementById('noteInput');
const saveBtn = document.getElementById('saveBtn');
const charCount = document.getElementById('charCount');
const noteCount = document.getElementById('noteCount');
const notesContainer = document.getElementById('notesContainer');
const emptyState = document.getElementById('emptyState');
const errorAlert = document.getElementById('errorAlert');
const successAlert = document.getElementById('successAlert');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Initialize
async function init() {
    checkFreighter();
    setupEventListeners();
}

// Check if Freighter is already connected
async function checkFreighter() {
    if (!window.freighterApi) {
        console.warn("Freighter not detected — running in fallback mode.");
        return;
    }

    try {
        const isAllowed = await window.freighterApi.isConnected();
        if (isAllowed) {
            const key = await window.freighterApi.getPublicKey();
            handleWalletConnected(key);
        }
    } catch (err) {
        console.log('Freighter not connected:', err);
    }
}


// Setup event listeners
function setupEventListeners() {
    connectBtn.addEventListener('click', connectWallet);
    saveBtn.addEventListener('click', createNote);
    noteInput.addEventListener('input', (e) => {
        charCount.textContent = e.target.value.length;
    });
}

// Connect wallet
async function connectWallet() {
    if (!window.freighterApi) {
        showError('Please install Freighter wallet extension');
        return;
    }

    try {
        setLoading(true);
        connectBtn.textContent = 'Connecting...';
        
        await window.freighterApi.setAllowed();
        const key = await window.freighterApi.getPublicKey();
        handleWalletConnected(key);
    } catch (err) {
        showError('Failed to connect wallet: ' + err.message);
        connectBtn.textContent = 'Connect Freighter Wallet';
    } finally {
        setLoading(false);
    }
}

// Handle wallet connected
function handleWalletConnected(key) {
    publicKey = key;
    walletAddress.textContent = key;
    connectSection.style.display = 'none';
    mainSection.style.display = 'block';
    loadNotes();
}

// Load notes
async function loadNotes() {
    try {
        // TODO: Implement contract call to get_user_notes
        // For now, using placeholder data
        console.log('Loading notes for:', publicKey);
        
        // Placeholder - Replace with actual contract call
        notes = [
            // Example structure:
            // { id: 1, content: 'My first note', timestamp: 1234567890, is_deleted: false }
        ];
        
        renderNotes();
    } catch (err) {
        console.error('Error loading notes:', err);
        showError('Failed to load notes');
    }
}

// Create note
async function createNote() {
    const content = noteInput.value.trim();
    
    if (!content) {
        showError('Please enter a note');
        return;
    }

    if (content.length > 280) {
        showError('Note must be 280 characters or less');
        return;
    }

    try {
        setLoading(true);
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        // TODO: Implement contract call to create_note
        // This requires:
        // 1. Build transaction with contract invocation
        // 2. Sign with Freighter
        // 3. Submit to network
        
        console.log('Creating note:', content);
        
        // Placeholder success
        showSuccess('Note created successfully!');
        noteInput.value = '';
        charCount.textContent = '0';
        
        // Reload notes after creation
        setTimeout(() => loadNotes(), 1000);
        
    } catch (err) {
        showError('Failed to create note: ' + err.message);
    } finally {
        setLoading(false);
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Save
        `;
    }
}

// Delete note
async function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        setLoading(true);
        
        // TODO: Implement contract call to delete_note
        console.log('Deleting note:', noteId);
        
        showSuccess('Note deleted!');
        setTimeout(() => loadNotes(), 1000);
        
    } catch (err) {
        showError('Failed to delete note: ' + err.message);
    } finally {
        setLoading(false);
    }
}

// Render notes
function renderNotes() {
    noteCount.textContent = notes.length;
    
    if (notes.length === 0) {
        notesContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }
    
    notesContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    
    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card">
            <p class="note-content">${escapeHtml(note.content)}</p>
            <div class="note-footer">
                <p class="note-date">${formatDate(note.timestamp)}</p>
                <button class="btn btn-danger-small" onclick="deleteNote(${note.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Utility functions
function setLoading(loading) {
    isLoading = loading;
}

function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'flex';
    successAlert.style.display = 'none';
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = '✓ ' + message;
    successAlert.style.display = 'flex';
    errorAlert.style.display = 'none';
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 3000);
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app
init();