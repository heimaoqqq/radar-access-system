// Script to download ONNX Runtime WASM files
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Files to download
const files = [
  {
    url: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.wasm',
    dest: 'ort-wasm.wasm'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.wasm',
    dest: 'ort-wasm-simd-threaded.wasm'  // Use basic WASM for SIMD version too
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(assetsDir, dest));
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(assetsDir, dest), () => {});
      reject(err);
    });
  });
}

// Download all files
Promise.all(files.map(f => downloadFile(f.url, f.dest)))
  .then(() => console.log('✅ All WASM files downloaded successfully!'))
  .catch(err => console.error('❌ Error downloading files:', err));
