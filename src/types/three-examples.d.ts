// src/types/three-examples.d.ts
declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Loader, LoadingManager } from 'three';
    import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
  
    export class GLTFLoader extends Loader {
      constructor(manager?: LoadingManager);
      load(
        url: string,
        onLoad: (gltf: GLTF) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
      ): void;
      loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;
    }
  
    export { GLTF };
  }