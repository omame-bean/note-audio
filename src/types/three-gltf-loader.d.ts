/**
 * three-gltf-loader.d.ts
 * 
 * Three.js の GLTFLoader に関する拡張型定義ファイル。
 * 
 * このファイルは、GLTFLoader クラスに VRMLoaderPlugin を登録するための
 * メソッドの型定義を追加します。VRM モデルのローディングを
 * TypeScript プロジェクトで型安全に実装することを可能にします。
 * 
 * @module ThreeGLTFLoaderTypes
 */

import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader'

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  interface GLTFLoader {
    register(plugin: (parser: GLTFParser) => VRMLoaderPlugin): void;
    load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void
  }
}
