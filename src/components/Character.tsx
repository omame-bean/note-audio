// src/components/Character.tsx
import React, { useRef, useEffect, Suspense, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useProgress, Html } from '@react-three/drei'
import * as THREE from 'three'
import { VRMLoaderPlugin, VRMUtils, VRM as OriginalVRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Textarea } from "@/components/ui/textarea"  // Inputの代わりにTextareaをインポート
import { Button } from "@/components/ui/button"
//import axios from 'axios'
import { Loader2 } from 'lucide-react'  // Loader2アイコンをインポート

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

const VRMLoader = ({ emotion }: CharacterProps) => {
  const { scene } = useThree()
  const vrmRef = useRef<VRM | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const swayAngleRef = useRef(0)
  const [isVRMLoaded, setIsVRMLoaded] = useState(false)

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
          vrm.scene.position.set(0, -11, -1.0)
          vrm.scene.scale.setScalar(7.8)

          if (vrm.expressionManager) {
            console.log('Available expressions:')
            // 表情名のリストを定義（必要に応じて追加・修正）
            const availableExpressions = [
              'happy',
              'angry',
              'sad',
              'relaxed',
              'surprised',
              'neutral',
              'blink',
              // 他にも必要な表情を追加
            ]

            console.log('Available expressions:', availableExpressions)

            // 初期値の確認はgetValueが存在しないため削除
          }

          setNaturalPose(vrm)
          loadAnimations(vrm).then(() => {
            // アニメーションの読み込みが完了したら、VRMの読み込み完了をセット
            setIsVRMLoaded(true)
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
    if (!isVRMLoaded) return // VRMが読み込まれていない場合は何もしない

    console.log('Current emotion:', emotion);
    if (vrmRef.current && vrmRef.current.expressionManager) {
      console.log('VRM and expressionManager are available');
      
      // すべての表情をリセット
      const expressionNames = [
        'happy',
        'angry',
        'sad',
        'relaxed',
        'surprised',
        'neutral',
        'blink',
        // 必要に応じて他表情も追加
      ]

      expressionNames.forEach((name) => {
        vrmRef.current!.expressionManager.setValue(name, 0)
        console.log(`Reset expression: ${name}`)
      })

      // 感情に応じて適切な表情を設定
      console.log(`Setting ${emotion} expression`)
      vrmRef.current.expressionManager.setValue(emotion, 1.0)
      console.log(`${emotion} expression value: 1.0`)

      // 表情の変更を即座に反映
      vrmRef.current.update(0)

      // 現在の表情の値をログ出力（取得方法がないためコメントアウト）
      /*
      expressionNames.forEach((name) => {
        const value = vrmRef.current!.expressionManager.getValue(name)
        console.log(`${name}: ${value}`)
      })
      */

      // まばたきのアニメーション
      const blinkAnimation = () => {
        if (vrmRef.current && vrmRef.current.expressionManager) {
          if (emotion !== 'happy') {  // happyの時は瞬きしない
            vrmRef.current.expressionManager.setValue('blink', 1.0)
            console.log('Blink started')
            vrmRef.current.update(0)
            setTimeout(() => {
              if (vrmRef.current) {
                vrmRef.current.expressionManager.setValue('blink', 0.0)
                console.log('Blink ended')
                vrmRef.current.update(0)
              }
            }, 100)
          }
        }
      }

      // 初回のまばたき（happyでない場合のみ）
      if (emotion !== 'happy') {
        blinkAnimation()
      }

      // 定期的なまばたき
      const blinkInterval = setInterval(() => {
        if (emotion !== 'happy') {
          blinkAnimation()
        }
      }, 5000)

      return () => {
        clearInterval(blinkInterval)
      }
    } else {
      console.log('VRM or expressionManager is not available')
    }
  }, [emotion, isVRMLoaded])

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
    camera.position.set(0, -1.8, 5) // カメラの位置を調整（より近く）
    camera.lookAt(0, 5.0, 0) // カメラの向きを調整（顔の高さ）
  }, [camera])

  return null
}

const CharacterComponent = ({ emotion, setEmotion }: CharacterProps) => {
  const [chatInput, setChatInput] = useState('')
  const [characterResponse, setCharacterResponse] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([
    { role: "system", content: "You are a helpful assistant." }
  ])

  const sendMessage = async (message: string) => {
    setIsSubmitting(true)

    const newMessages = [
      ...messages,
      { role: "user", content: message }
    ]

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      setCharacterResponse(data.response)
      
      if (data.emotion) {
        setEmotion(data.emotion as 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised' | 'neutral')
      }

      // 応答をメッセージ履歴に追加
      setMessages([...newMessages, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error('Error in chat:', error)
      setCharacterResponse('申し訳ありません。エラーが発生しました。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim() || isSubmitting) return
    sendMessage(chatInput)
    setChatInput('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value)
    adjustTextareaHeight()
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 4 * 24) // 24pxは1行の高さと仮定
      textareaRef.current.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [chatInput])

  return (
    <div>
      <div 
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Canvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Suspense fallback={<Loader />}>
            <CameraSetup />
            <ambientLight intensity={0.4} color="#FFF5E6" /> {/* 暖かい色の環境光 */}
            <directionalLight 
              position={[0, 0, 5]}
              intensity={3.5}
              color="#fdfcf4" // 黄金色の光
              castShadow
            />
            <pointLight
              position={[0, 5, 3]}
              intensity={0.8}
              color="#ffe5b4" // オレンジ色の光
            />
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
              minDistance={0.5}
              maxDistance={2}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="mt-4">
        <p className="mb-2 break-words max-h-24 overflow-y-auto">{characterResponse}</p>
        <div className="flex">
          <Textarea
            ref={textareaRef}
            value={chatInput}
            onChange={handleInputChange}
            placeholder="キャラクターと会話する..."
            className="mr-2 flex-grow resize-none overflow-y-auto"
            style={{ minHeight: '15px', maxHeight: '96px' }} // 1行分の高さから4行分の高さまで
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleChatSubmit()
              }
            }}
          />
          <Button 
            onClick={handleChatSubmit} 
            className="self-end" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '送信'
            )}
          </Button>
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
        //const vrmAnimation = vrmAnimations[0]
        //const clip: THREE.AnimationClip = vrmAnimation.createAnimationClip(vrm)
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