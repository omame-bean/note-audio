// src/types/three-gltf-loader.d.ts
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader'

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  interface GLTFLoader {
    register(plugin: (parser: GLTFParser) => VRMLoaderPlugin): void;
    load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void
  }
}
