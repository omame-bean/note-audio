import React, { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import { VRMLoaderPlugin, VRMUtils, VRM as OriginalVRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from 'axios'

// VRM型を拡張して update メソッドを含める
interface VRM extends OriginalVRM {
  update: (delta: number) => void;
}

interface CharacterProps {
  emotion: 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral'
  setEmotion: (emotion: 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral') => void
}

const Loader = () => {
  const { progress } = useProgress()
  return <Html center>{progress}% loaded</Html>
}

const VRMLoader = ({ emotion, setEmotion }: CharacterProps) => {
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
          vrm.scene.position.set(0, -8.5, 0.0)
          vrm.scene.scale.setScalar(6.0)

          if (vrm.expressionManager) {
            console.log('Available expressions:', 
              vrm.expressionManager.expressions.map(exp => exp.name)
            );
            // 初期値を確認
            vrm.expressionManager.expressions.forEach(exp => {
              console.log(`Initial ${exp.name} value:`, exp.weight);
            });
          }

          setNaturalPose(vrm)
          loadAnimations(vrm).then(() => {
            // アニメーションの読み込みが完了したら、必要に応じて処理を追加
          }).catch(error => {
            console.error('Error loading animations:', error)
          })
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
    console.log('Current emotion:', emotion);
    if (vrmRef.current && vrmRef.current.expressionManager) {
      console.log('VRM and expressionManager are available');
      
      // すべての表情をリセット
      vrmRef.current.expressionManager.expressions.forEach(exp => {
        exp.weight = 0;
        console.log(`Reset expression: ${exp.name}`);
      });

      // 感情に応じて適切な表情を設定
      const targetExpression = vrmRef.current.expressionManager.expressions.find(exp => exp.name === `VRMExpression_${emotion}`);
      if (targetExpression) {
        console.log(`Setting ${emotion} expression`);
        targetExpression.weight = 1;
        console.log(`${emotion} expression value:`, targetExpression.weight);
      } else {
        console.warn(`Expression for ${emotion} not found`);
      }

      // 表情の変更を即座に反映
      vrmRef.current.update(0);

      // 現在の表情の値をログ出力
      console.log('Current expression values:', 
        vrmRef.current.expressionManager.expressions.map(exp => 
          `${exp.name}: ${exp.weight}`
        )
      );

      // まばたきのアニメーション
      const blinkAnimation = () => {
        if (vrmRef.current && vrmRef.current.expressionManager) {
          const blinkExpression = vrmRef.current.expressionManager.expressions.find(exp => exp.name === 'VRMExpression_blink');
          if (blinkExpression && emotion !== 'happy') {  // happyの時は瞬きしない
            blinkExpression.weight = 1;
            console.log('Blink started');
            vrmRef.current.update(0);
            setTimeout(() => {
              if (vrmRef.current && blinkExpression) {
                blinkExpression.weight = 0;
                console.log('Blink ended');
                vrmRef.current.update(0);
              }
            }, 100);
          }
        }
      };

      // 初回のまばたき（happyでない場合のみ）
      if (emotion !== 'happy') {
        blinkAnimation();
      }

      // 定期的なまばたき
      const blinkInterval = setInterval(() => {
        if (emotion !== 'happy') {
          blinkAnimation();
        }
      }, 4000);

      return () => {
        clearInterval(blinkInterval);
      };
    } else {
      console.log('VRM or expressionManager is not available');
    }
  }, [emotion]);

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

const CharacterComponent = ({ emotion, setEmotion }: CharacterProps) => {
  const [chatInput, setChatInput] = useState('')
  const [characterResponse, setCharacterResponse] = useState('')

  const handleChatSubmit = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatInput }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setCharacterResponse(data.response)
      
      // サーバーから返された感情を使用
      if (data.emotion) {
        setEmotion(data.emotion as 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral')
      }
    } catch (error) {
      console.error('Error in chat:', error)
      setCharacterResponse('申し訳ありません。エラーが発生しました。')
    }
  }

  return (
    <div>
      <Canvas style={{ height: '200px' }}>
        <Suspense fallback={<Loader />}>
          <CameraSetup />
          <ambientLight intensity={1} />
          <directionalLight position={[100, 10, 0]} intensity={2.5} />
          <VRMLoader emotion={emotion} setEmotion={setEmotion} />
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
      <div className="mt-4">
        <p className="mb-2">{characterResponse}</p>
        <div className="flex">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="キャラクターと会話する..."
            className="mr-2"
          />
          <Button onClick={handleChatSubmit}>送信</Button>
        </div>
      </div>
    </div>
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
      const vrmAnimations = gltf.userData.vrmAnimations
      if (vrmAnimations && vrmAnimations.length > 0) {
        const vrmAnimation = vrmAnimations[0]
        const clip = vrmAnimation.createAnimationClip(vrm)
        // ここでアニメーションを設定・再生する処理を追加
        console.log(`Loaded animation: ${anim.name}`)
      } else {
        console.warn(`No VRM animations found for ${anim.name}`)
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