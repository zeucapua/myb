// Code by @pilcrowonpaper on GitHub: https://gist.github.com/pilcrowonpaper/353318556029221c8e25f451b91e5f76
// AES128 with the Web Crypto API.
async function encrypt(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);
    const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["encrypt"]);
    const cipher = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
            tagLength: 128
        },
        cryptoKey,
        data
    );
    const encrypted = new Uint8Array(iv.byteLength + cipher.byteLength);
    encrypted.set(iv);
    encrypted.set(new Uint8Array(cipher), iv.byteLength);
    return encrypted;
}
    
export async function encryptString(key: Uint8Array, data: string): Promise<Uint8Array> {
    const encoded = new TextEncoder().encode(data);
    const encrypted = await encrypt(key, encoded);
    return encrypted;
}

async function decrypt(key: Uint8Array, encrypted: Uint8Array): Promise<Uint8Array> {
    if (encrypted.length < 16) {
        throw new Error("Invalid data");
    }
    const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: encrypted.slice(0, 16),
            tagLength: 128
        },
        cryptoKey,
        encrypted.slice(16)
    );
    return new Uint8Array(decrypted);
}
                              
export async function decryptToString(key: Uint8Array, data: Uint8Array): Promise<string> {
    const decrypted = await decrypt(key, data);
    const decoded = new TextDecoder().decode(decrypted);
    return decoded;
}
