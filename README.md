# 🚀 **Stellar Notepad**

*A decentralized, blockchain-backed notepad powered by Stellar & Soroban.*

Store messages permanently on the Stellar blockchain, retrieve them anytime, and manage your notes using either a simple HTML interface **or** a beautiful React UI — both fully connected to the Freighter wallet for secure signing.

---

# 🌟 **What This Project Does**

| Core Feature              | Description                               |
| ------------------------- | ----------------------------------------- |
| 📝 **Create Notes**       | Store text notes immutably on Stellar     |
| 📄 **Retrieve Notes**     | Fetch your own notes via Horizon          |
| ❌ **Soft Delete**         | Mark notes deleted in the Soroban version |
| 🔐 **Wallet Login**       | Freighter wallet integration              |
| 💻 **Two Frontends**      | HTML/JS frontend + modern React frontend  |
| 🧠 **Smart Contract**     | Soroban contract storing notes by user    |
| 🔗 **Testnet Deployment** | Fully deployed contract + explorer links  |

---

# 🔗 **Deployed Soroban Contract (Testnet)**

| Item                     | Value                                                              |
| ------------------------ | ------------------------------------------------------------------ |
| **Contract ID**          | `CCA3V2QXPBSHVXCD5AMCUSZFKPGI5GIZIOLYVP62MEHSTSIWZJAM5KNA`         |
| **WASM Hash**            | `14d537e83de1744c9cc7d07ebf2760a5418d962f6ec9c8663aee47303f4843e8` |
| **Network**              | Stellar Testnet                                                    |
| **Explorer (Contract)**  | View on Stellar Expert                                             |
| **Explorer (Deploy TX)** | View Deployment Transaction                                        |

This contract stores notes by ID, tracks authorship, timestamps, and allows soft deletion.

---

# 🏗 **Project Structure**

```
stellar-notepad-app/
│
├── contract/                             # Soroban smart contract
│   ├── src/lib.rs
│   ├── Cargo.toml
│   └── target/
│
├── frontend/                             # Simple HTML/CSS/JS frontend
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── frontend-react/                       # Full React UI
│   ├── src/
│   │   ├── components/
│   │   │   └── StellarNotepad.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🧠 **Smart Contract Overview (Soroban)**

The Soroban contract handles:

### ✔ Writing Notes

* Auto-incrementing note IDs
* Author recorded (Address)
* Timestamp stored
* Content stored in contract storage

### ✔ Reading Notes

* List all notes for a user
* Fetch a single note

### ✔ Deleting Notes

* Soft delete (keeps data for auditability)

### 📦 Build Contract

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

Output:

```
contract/target/wasm32-unknown-unknown/release/stellar_notepad_contract.wasm
```

---

# 🚀 **Deploying to Stellar Testnet**

### 1️⃣ Install Stellar CLI

```bash
curl -fsSL https://cli.stellar.org/install.sh | bash
```

Verify:

```bash
stellar --version
```

---

### 2️⃣ Add Testnet to CLI

```bash
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

---

### 3️⃣ Create a Keypair

```bash
stellar keys generate --alias nishanth
```

Fund with Friendbot:

```bash
stellar network friendbot --address $(stellar keys address nishanth)
```

---

### 4️⃣ Upload the Contract

```bash
stellar contract upload \
  --wasm contract/target/wasm32v1-none/release/stellar_notepad_contract.wasm \
  --source-account nishanth \
  --network testnet
```

Output:

```
WASM Hash: 14d537e83de1744c9cc7d07ebf2760a5418d962f6ec9c8663aee47303f4843e8
```

---

### 5️⃣ Deploy Contract

```bash
stellar contract deploy \
  --wasm-hash 14d537e83de1744c9cc7d07ebf2760a5418d962f6ec9c8663aee47303f4843e8 \
  --source-account nishanth \
  --network testnet
```

Output:

```
Contract ID: CCA3V2QXPBSHVXCD5AMCUSZFKPGI5GIZIOLYVP62MEHSTSIWZJAM5KNA
```

---

### 6️⃣ Initialize

```bash
stellar contract invoke \
  --id CCA3V2QXPBSHVXCD5AMCUSZFKPGI5GIZIOLYVP62MEHSTSIWZJAM5KNA \
  --source-account nishanth \
  --network testnet \
  -- initialize
```

---

# 🌐 **Frontend Options**

You have **two** frontends to demonstrate the same product.

---

# 🟦 1. Vanilla HTML/JS Frontend

This version uses Horizon directly and stores notes via `manageData` + text memos.

### ▶ Run Local Server

```bash
cd frontend
python3 -m http.server 8000
```

Visit:

```
http://localhost:8000
```

---

# ⚛️ 2. React Frontend

A gorgeous UI built with:

* React 18
* Vite
* Tailwind-compatible classes
* `lucide-react` icons
* Freighter API
* Stellar SDK

### ▶ Install Dependencies

```bash
cd frontend-react
npm install
```

### ▶ Run

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# 🔌 **Connecting to the Contract (React)**

Set values in:

```
frontend-react/src/components/StellarNotepad.jsx
```

React version pulls notes from Horizon’s transaction memos.

---

# 🧪 How the App Works (Technical Summary)

### ✨ Flow

1. Check for Freighter
2. Connect wallet → get public key
3. Load user transactions using Horizon API
4. Extract any **text memos** (these are the notes)
5. Saving notes = `manageData` + memo on Stellar Public Network

### 🧩 Libraries Used

* Stellar SDK
* Freighter wallet API
* Lucide icons
* React state management

---

# 🛠 Troubleshooting

### ❌ Freighter not detected

Install from: [https://freighter.app/](https://freighter.app/)

### ❌ Account not funded

Visit:

```
https://friendbot.stellar.org/?addr=<YOUR_ADDRESS>
```

### ❌ No notes appearing

Only memos of type `"text"` are treated as notes.

### ❌ RPC errors

Check RPC endpoint:

```
https://soroban-testnet.stellar.org
```

---

# 🔐 Security Notes

* Do NOT store sensitive info in memos — they are **public**
* Soroban contract state is immutable except where allowed
* Wallet signatures are always required
* Public/Private keys never leave Freighter

---

# 🧭 Roadmap

* [ ] Add encrypted notes (client-side AES)
* [ ] Add editing support
* [ ] Upload long notes to IPFS + store hash
* [ ] Pagination for large transaction history
* [ ] Mainnet contract deployment
* [ ] Combine both frontends into a unified UI selector

---

# 👤 Author

**Nishanth Antony**
Built for Stellar Hackathon / Competition
Powered by Stellar, Soroban & Freighter

---

Just tell me!
