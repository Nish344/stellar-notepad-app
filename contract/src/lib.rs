#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec, Map,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Note {
    pub id: u64,
    pub content: String,
    pub author: Address,
    pub timestamp: u64,
    pub is_deleted: bool,
}

#[contracttype]
enum DataKey {
    NextNoteId,
    UserNotes(Address),
    Note(u64),
}

#[contract]
pub struct NotepadContract;

#[contractimpl]
impl NotepadContract {
    /// Initialize the contract
    pub fn initialize(env: Env) {
        env.storage().instance().set(&DataKey::NextNoteId, &1u64);
    }

    /// Create a new note
    /// Returns the note ID
    pub fn create_note(env: Env, author: Address, content: String) -> u64 {
        author.require_auth();

        // Validate note content (max 280 characters for efficiency)
        assert!(content.len() <= 280, "Note too long (max 280 chars)");
        assert!(content.len() > 0, "Note cannot be empty");

        let note_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextNoteId)
            .unwrap_or(1u64);

        let timestamp = env.ledger().timestamp();

        let note = Note {
            id: note_id,
            content,
            author: author.clone(),
            timestamp,
            is_deleted: false,
        };

        // Store note by ID
        env.storage()
            .persistent()
            .set(&DataKey::Note(note_id), &note);

        // Add note to user's note list
        let mut user_notes: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserNotes(author.clone()))
            .unwrap_or(Vec::new(&env));
        
        user_notes.push_back(note_id);
        env.storage()
            .persistent()
            .set(&DataKey::UserNotes(author), &user_notes);

        // Increment note ID counter
        env.storage()
            .instance()
            .set(&DataKey::NextNoteId, &(note_id + 1));

        note_id
    }

    /// Get a specific note by ID
    pub fn get_note(env: Env, note_id: u64) -> Option<Note> {
        env.storage()
            .persistent()
            .get(&DataKey::Note(note_id))
    }

    /// Get all notes by a user
    pub fn get_user_notes(env: Env, user: Address) -> Vec<Note> {
        let note_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserNotes(user))
            .unwrap_or(Vec::new(&env));

        let mut notes = Vec::new(&env);
        
        for i in 0..note_ids.len() {
            if let Some(note_id) = note_ids.get(i) {
                if let Some(note) = env.storage().persistent().get(&DataKey::Note(note_id)) {
                    notes.push_back(note);
                }
            }
        }

        notes
    }

    /// Delete a note (soft delete)
    pub fn delete_note(env: Env, author: Address, note_id: u64) {
        author.require_auth();

        let mut note: Note = env
            .storage()
            .persistent()
            .get(&DataKey::Note(note_id))
            .expect("Note not found");

        assert!(note.author == author, "Not authorized to delete this note");
        assert!(!note.is_deleted, "Note already deleted");

        note.is_deleted = true;
        env.storage()
            .persistent()
            .set(&DataKey::Note(note_id), &note);
    }

    /// Get total number of notes created
    pub fn get_total_notes(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::NextNoteId)
            .unwrap_or(1u64) - 1
    }
}