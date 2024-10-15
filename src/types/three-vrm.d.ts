/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

// src/types/three-vrm.d.ts
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
