/**
 * three-examples.d.ts
 * 
 * Three.jsの追加モジュールに対する型定義ファイル。
 * 
 * このファイルは、Three.jsのGLTFLoaderモジュールの型定義を提供します。
 * TypeScriptプロジェクトでGLTFLoaderを使用する際の型安全性を確保します。
 * 
 * @module ThreeExamplesTypes
 */

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
