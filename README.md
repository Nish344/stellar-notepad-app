# 🚀 Stellar Notepad

*A decentralized, on-chain notepad powered by Stellar & Soroban smart contracts.*

Store notes permanently on the Stellar blockchain using a lightweight smart contract and a clean frontend that connects via the Freighter wallet.

---

## 📌 Features

✅ Store notes on-chain
✅ Fetch all notes created by a user
✅ Soft-delete notes
✅ Freighter wallet integration
✅ Pure HTML/CSS/JS frontend (no build tools needed)
✅ Soroban smart contract written in Rust
✅ Works on Testnet + ready for Mainnet

---

## 🏗 Project Structure

```
stellar-notepad/
├── contract/        # Soroban smart contract (Rust)
│   ├── src/lib.rs
│   ├── Cargo.toml
│   └── target/      # ignored in git
│
├── frontend/        # Simple HTML + JS frontend
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
└── README.md
```

---

# 🧠 Smart Contract

The contract:

* Stores notes under an incrementing ID
* Tracks notes per user
* Supports listing, fetching, and soft-delete
* Enforces note size limits
* Stores timestamp & author address

Located at:
`contract/src/lib.rs`

Build:

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
```

Builds to:
`contract/target/wasm32-unknown-unknown/release/stellar_notepad_contract.wasm`

---

# 🚀 Deploying to Stellar Testnet

### **1. Install Stellar CLI**

```bash
curl -fsSL https://cli.stellar.org/install.sh | bash
```

Verify:

```bash
stellar --version
```

---

### **2. Add Testnet**

```bash
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

---

### **3. Create an Identity**

```bash
stellar keys generate --alias alice
```

Fund testnet account:

```bash
stellar network friendbot --address $(stellar keys address alice)
```

---

### **4. Deploy Contract**

```bash
stellar contract deploy \
  --wasm ./contract/target/wasm32-unknown-unknown/release/stellar_notepad_contract.wasm \
  --source alice \
  --network testnet
```

Copy the **contract ID**.

---

### **5. Initialize Contract**

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- initialize
```

---

# 🌐 Frontend Setup

The frontend is plain HTML / CSS / JS — no bundlers, no frameworks.

### **Start a simple local server**

```bash
cd frontend
npx http-server . -p 8000
```

Or:

```bash
python3 -m http.server 8000
```

Open:

```
http://localhost:8000
```

---

# 🔗 Connecting Frontend to Your Contract

Inside `frontend/app.js`, set:

```js
const CONTRACT_ID = "<YOUR_DEPLOYED_CONTRACT_ID>";
```

Freighter must be installed in your browser:

🔗 [https://www.freighter.app/](https://www.freighter.app/)

---

# 🧪 How Frontend Works

* Connect Freighter → get public key
* List user notes using `get_user_notes`
* Create notes with `create_note`
* Delete notes via `delete_note`
* Render UI based on blockchain state

The frontend uses Soroban JSON-RPC under the hood (via Stellar SDK).

---

# 📦 .gitignore (included)

Your project ignores:

```
contract/target/
contract/Cargo.lock
frontend/node_modules/
frontend/package-lock.json
*.wasm
*.tar.gz
.env
```

---

# 🧭 Roadmap

* [ ] Add Pagination for large note lists
* [ ] Add Edit Note feature
* [ ] Add Note Encryption (optional)
* [ ] Add Mainnet deployment
* [ ] Add IPFS backup mode
