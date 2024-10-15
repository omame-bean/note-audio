import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import { VRMLoaderPlugin, VRMUtils, VRM as OriginalVRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// VRM型を拡張して update メソッドを含める
interface VRM extends OriginalVRM {
  update: (delta: number) => void;
}

interface CharacterProps {
  emotion: 'happy' | 'angry' | 'neutral'
}

const Loader = () => {
  const { progress } = useProgress()
  return <Html center>{progress}% loaded</Html>
}

const VRMLoader = ({ emotion }: CharacterProps) => {
  const { scene } = useThree()
  const vrmRef = useRef<VRM | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const swayAngleRef = useRef(0)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      '/models/character.vrm',
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM
        if (vrm) {
          vrmRef.current = vrm
          scene.add(vrm.scene)
          VRMUtils.rotateVRM0(vrm)
          mixerRef.current = new THREE.AnimationMixer(vrm.scene)

          // モデルの位置とスケールを調整
          vrm.scene.position.set(0, -8.5, 0.0) // Y軸を上げてキャラクターを上に移動
          vrm.scene.scale.setScalar(6.0) // スケールを1.5倍に拡大

          setNaturalPose(vrm)
          loadAnimations(vrm)
        }
      },
      (progressEvent) => {
        console.log('Loading progress:', (progressEvent.loaded / progressEvent.total) * 100, '%')
      },
      (error) => {
        console.error('VRMモデルの読み込み中にエラーが発生しました:', error)
      }
    )

    return () => {
      if (vrmRef.current) {
        VRMUtils.deepDispose(vrmRef.current.scene)
        scene.remove(vrmRef.current.scene)
      }
    }
  }, [scene])

  useEffect(() => {
    if (vrmRef.current && vrmRef.current.expressionManager) {
      vrmRef.current.expressionManager.setValue('happy', emotion === 'happy' ? 1 : 0)
      vrmRef.current.expressionManager.setValue('angry', emotion === 'angry' ? 1 : 0)
    }
  }, [emotion])

  useFrame((state, delta) => {
    if (vrmRef.current && mixerRef.current) {
      mixerRef.current.update(delta)
      
      // VRMの更新
      if (typeof vrmRef.current.update === 'function') {
        vrmRef.current.update(delta)
      } else {
        // update メソッドが存在しない場合の代替処理
        vrmRef.current.scene.updateMatrixWorld(true)
      }

      // 自然な揺れアニメーション
      swayAngleRef.current += 2 * delta
      const swayOffset = Math.sin(swayAngleRef.current) * 0.03

      const bones = ['spine', 'chest', 'upperChest', 'neck', 'head']
      const swayFactors = [0.2, 0.15, 0.1, 0.05, 0.025]

      bones.forEach((boneName, index) => {
        const bone = vrmRef.current!.humanoid.getNormalizedBoneNode(boneName as VRMHumanBoneName)
        if (bone) {
          bone.rotation.z = swayOffset * swayFactors[index]
        }
      })
    }
  })

  return null
}

const CameraSetup = () => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, -1.7, 10.0) // カメラの位置を調整（より近く）
    camera.lookAt(0, 3.0, 0) // カメラの向きを調整（顔の高さ）
  }, [camera])

  return null
}

const CharacterComponent = ({ emotion }: CharacterProps) => {
  return (
    <Canvas style={{ height: '200px' }}> // キャンバスの高さを増やす
      <Suspense fallback={<Loader />}>
        <CameraSetup />
        <ambientLight intensity={1} />
        <directionalLight position={[100, 10, 0]} intensity={2.5} />
        <VRMLoader emotion={emotion} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          enableRotate={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
          minDistance={0.5} // 最小ズーム距離を設定
          maxDistance={2} // 最大ズーム距離を設定
        />
      </Suspense>
    </Canvas>
  )
}

export default CharacterComponent

// アニメーションの読み込みと設定関数
const loadAnimations = async (vrm: VRM) => {
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))

  const animationFiles = [
    { name: 'idle', file: 'idle.vrma' },
    // 他のアニメーションファイルを追加
  ]

  for (const anim of animationFiles) {
    try {
      const gltf = await loader.loadAsync(`/animations/${anim.file}`)
      const vrmAnimation = gltf.userData.vrmAnimations[0]
      if (vrmAnimation) {
        const clip = vrmAnimation.createAnimationClip(vrm)
        // ここでアニメーションを設定・再生する処理を追加
        console.log(`Loaded animation: ${anim.name}`)
      }
    } catch (error) {
      console.error(`Error loading animation ${anim.name}:`, error)
    }
  }
}

const setNaturalPose = (vrm: VRM) => {
  const bones = [
    { name: VRMHumanBoneName.LeftUpperArm, rotation: new THREE.Euler(0, -0.5, -1.2) },
    { name: VRMHumanBoneName.RightUpperArm, rotation: new THREE.Euler(0, 0.5, 1.2) },
    { name: VRMHumanBoneName.LeftLowerArm, rotation: new THREE.Euler(0.2, 0, 0) },
    { name: VRMHumanBoneName.RightLowerArm, rotation: new THREE.Euler(0.2, 0, 0) },
    { name: VRMHumanBoneName.LeftHand, rotation: new THREE.Euler(0, 0, -0.1) },
    { name: VRMHumanBoneName.RightHand, rotation: new THREE.Euler(0, 0, 0.1) },
    { name: VRMHumanBoneName.Spine, rotation: new THREE.Euler(0.1, 0, 0) },
    { name: VRMHumanBoneName.Chest, rotation: new THREE.Euler(0.05, 0, 0) },
    { name: VRMHumanBoneName.UpperChest, rotation: new THREE.Euler(0.05, 0, 0) },
    { name: VRMHumanBoneName.Neck, rotation: new THREE.Euler(-0.05, 0, 0) },
  ];

  bones.forEach(({ name, rotation }) => {
    const bone = vrm.humanoid.getNormalizedBoneNode(name);
    if (bone) {
      bone.rotation.copy(rotation);
    }
  });

  vrm.scene.updateMatrixWorld(true);
}
