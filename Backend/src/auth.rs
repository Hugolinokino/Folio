use argon2::Argon2;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize)]
pub struct AuthConfig {
    pub salt_hex: String,
    pub display_name: String,
}

pub fn config_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("auth.json")
}

pub fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt);
    salt
}

/// Derives a 32-byte SQLCipher raw key from the passphrase via Argon2id.
/// Using our own KDF (rather than SQLCipher's built-in PBKDF2-on-passphrase)
/// lets the same derivation double as the future basis for encrypting other
/// at-rest secrets with a key the user never has to re-derive differently.
pub fn derive_key(passphrase: &str, salt: &[u8]) -> Result<String, String> {
    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(passphrase.as_bytes(), salt, &mut key)
        .map_err(|e| e.to_string())?;
    Ok(hex::encode(key))
}
