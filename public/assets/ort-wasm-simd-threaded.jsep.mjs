// Redirect to CDN basic WASM version
// This placeholder prevents 404 when ONNX Runtime tries to load SIMD version
import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.min.mjs';
export * from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.min.mjs';
export default ort;
