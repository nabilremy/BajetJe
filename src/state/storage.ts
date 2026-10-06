/**
 * Encrypted on-device storage. No account, no backend.
 *
 * A random AES-GCM key is generated on first run and kept in IndexedDB as a
 * non-extractable CryptoKey, so script code can use it but never read it out.
 * The plan is stored as ciphertext next to it. If IndexedDB or WebCrypto is
 * unavailable (some private windows), the app still works for the session and
 * simply doesn't persist.
 */

const DB = "bajetje";
const STORE = "kv";
const KEY_ID = "key";
const DATA_ID = "plan";

type Sealed = { v: 1; iv: Uint8Array; data: ArrayBuffer };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

let dbP: Promise<IDBDatabase> | null = null;
const db = () => (dbP ??= openDb());

async function getKey(): Promise<CryptoKey> {
  const d = await db();
  const existing = await tx<CryptoKey | undefined>(d, "readonly", (s) => s.get(KEY_ID));
  if (existing) return existing;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await tx(d, "readwrite", (s) => s.put(key, KEY_ID));
  return key;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function loadEncrypted<T>(): Promise<T | null> {
  try {
    const d = await db();
    const sealed = await tx<Sealed | undefined>(d, "readonly", (s) => s.get(DATA_ID));
    if (!sealed) return null;
    const key = await getKey();
    const iv = new Uint8Array(sealed.iv);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, sealed.data);
    return JSON.parse(dec.decode(plain)) as T;
  } catch {
    return null;
  }
}

export async function saveEncrypted(value: unknown): Promise<void> {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(value)));
    const sealed: Sealed = { v: 1, iv, data };
    await tx(await db(), "readwrite", (s) => s.put(sealed, DATA_ID));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

/** Removes the plan and the key. Old ciphertext can't be read even if a copy survived. */
export async function wipeStorage(): Promise<void> {
  try {
    const d = await db();
    await tx(d, "readwrite", (s) => s.clear());
  } catch {
    /* nothing stored */
  }
  try {
    localStorage.removeItem("duit-proto-v1");
  } catch {
    /* ignore */
  }
}
