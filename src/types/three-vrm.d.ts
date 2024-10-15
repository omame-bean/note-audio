/**
 * three-vrm.d.ts
 * 
 * @pixiv/three-vrm ライブラリの型定義ファイル。
 * 
 * このファイルは、VRM モデルの操作に必要なインターフェースと
 * クラスの型定義を提供します。VRM モデルのローディング、
 * 表情管理、ボーン操作などの機能を TypeScript で
 * 型安全に実装することを可能にします。
 * 
 * @module ThreeVRMTypes
 */


declare module '@pixiv/three-vrm' {
    import * as THREE from 'three';
  
    export interface VRMExpressionManager {
        setValue(name: string, value: number): void;
    }
  
    export interface VRMHumanoid {
        getNormalizedBoneNode(name: VRMHumanBoneName): THREE.Object3D | null;
    }
  
    export enum VRMHumanBoneName {
        Hips = 'hips',
        Spine = 'spine',
        Chest = 'chest',
        UpperChest = 'upperChest',
        Neck = 'neck',
        Head = 'head',
        LeftEye = 'leftEye',
        RightEye = 'rightEye',
        Jaw = 'jaw',
        LeftUpperLeg = 'leftUpperLeg',
        LeftLowerLeg = 'leftLowerLeg',
        LeftFoot = 'leftFoot',
        LeftToes = 'leftToes',
        RightUpperLeg = 'rightUpperLeg',
        RightLowerLeg = 'rightLowerLeg',
        RightFoot = 'rightFoot',
        RightToes = 'rightToes',
        LeftShoulder = 'leftShoulder',
        LeftUpperArm = 'leftUpperArm',
        LeftLowerArm = 'leftLowerArm',
        LeftHand = 'leftHand',
        RightShoulder = 'rightShoulder',
        RightUpperArm = 'rightUpperArm',
        RightLowerArm = 'rightLowerArm',
        RightHand = 'rightHand',
        LeftThumbMetacarpal = 'leftThumbMetacarpal',
        LeftThumbProximal = 'leftThumbProximal',
        LeftThumbDistal = 'leftThumbDistal',
        LeftIndexProximal = 'leftIndexProximal',
        LeftIndexIntermediate = 'leftIndexIntermediate',
        LeftIndexDistal = 'leftIndexDistal',
        LeftMiddleProximal = 'leftMiddleProximal',
        LeftMiddleIntermediate = 'leftMiddleIntermediate',
        LeftMiddleDistal = 'leftMiddleDistal',
        LeftRingProximal = 'leftRingProximal',
        LeftRingIntermediate = 'leftRingIntermediate',
        LeftRingDistal = 'leftRingDistal',
        LeftLittleProximal = 'leftLittleProximal',
        LeftLittleIntermediate = 'leftLittleIntermediate',
        LeftLittleDistal = 'leftLittleDistal',
        RightThumbMetacarpal = 'rightThumbMetacarpal',
        RightThumbProximal = 'rightThumbProximal',
        RightThumbDistal = 'rightThumbDistal',
        RightIndexProximal = 'rightIndexProximal',
        RightIndexIntermediate = 'rightIndexIntermediate',
        RightIndexDistal = 'rightIndexDistal',
        RightMiddleProximal = 'rightMiddleProximal',
        RightMiddleIntermediate = 'rightMiddleIntermediate',
        RightMiddleDistal = 'rightMiddleDistal',
        RightRingProximal = 'rightRingProximal',
        RightRingIntermediate = 'rightRingIntermediate',
        RightRingDistal = 'rightRingDistal',
        RightLittleProximal = 'rightLittleProximal',
        RightLittleIntermediate = 'rightLittleIntermediate',
        RightLittleDistal = 'rightLittleDistal'
    }
  
    export interface VRM extends THREE.Object3D {
        scene: THREE.Scene;
        humanoid: VRMHumanoid;
        expressionManager: VRMExpressionManager;
    }
  
    export class VRM {
        static from(gltf: THREE.GLTF): Promise<VRM>;
    }
  
    export class VRMUtils {
        static rotateVRM0(vrm: VRM): void;
        static deepDispose(scene: THREE.Scene): void;
    }
  
    export class VRMLoaderPlugin {
        constructor(parser: GLTFParser);
    }
}
