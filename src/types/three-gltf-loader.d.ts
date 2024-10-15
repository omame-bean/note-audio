// src/types/three-gltf-loader.d.ts
import { VRMLoaderPlugin } from '@pixiv/three-vrm';

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  interface GLTFLoader {
    register(plugin: (parser: any) => VRMLoaderPlugin): void;
  }
}