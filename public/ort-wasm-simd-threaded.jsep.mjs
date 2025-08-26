// Redirect to basic WASM version to fix 404 error
// This file is a placeholder to prevent 404 errors when ONNX Runtime tries to load SIMD version
export * from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.mjs';
