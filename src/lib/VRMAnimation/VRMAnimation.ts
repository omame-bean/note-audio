import * as THREE from 'three'
import { VRM, VRMExpressionManager, VRMHumanBoneName, VRMHumanoid } from '@pixiv/three-vrm'

export class VRMAnimation {
  // アニメーションの長さ
  public duration: number
  // 初期のヒップス位置
  public restHipsPosition: THREE.Vector3

  // ヒューマノイドのアニメーショントラック
  public humanoidTracks: {
    translation: Map<VRMHumanBoneName, THREE.VectorKeyframeTrack>
    rotation: Map<VRMHumanBoneName, THREE.VectorKeyframeTrack>
  }
  // 表情のアニメーショントラック
  public expressionTracks: Map<string, THREE.NumberKeyframeTrack>
  // 視線のアニメーショントラック
  public lookAtTrack: THREE.QuaternionKeyframeTrack | null

  public constructor() {
    this.duration = 0.0
    this.restHipsPosition = new THREE.Vector3()

    this.humanoidTracks = {
      translation: new Map(),
      rotation: new Map(),
    }

    this.expressionTracks = new Map()
    this.lookAtTrack = null
  }

  // VRMモデル用のAnimationClipを作成するメソッド
  public createAnimationClip(vrm: VRM): THREE.AnimationClip {
    const tracks: THREE.KeyframeTrack[] = []

    // ヒューマノイドトラックを追加
    tracks.push(...this.createHumanoidTracks(vrm))

    // 表情トラックを追加（存在する場合）
    if (vrm.expressionManager != null) {
      tracks.push(...this.createExpressionTracks(vrm.expressionManager))
    }

    // 視線トラックを追加（存在する場合）
    if (vrm.lookAt != null) {
      const track = this.createLookAtTrack('lookAtTargetParent.quaternion')

      if (track != null) {
        tracks.push(track)
      }
    }

    // 全てのトラックを含むAnimationClipを作成して返す
    return new THREE.AnimationClip('Clip', this.duration, tracks)
  }

  // ヒューマノイドのアニメーショントラックを作成するメソッド
  public createHumanoidTracks(vrm: VRM): THREE.KeyframeTrack[] {
    const humanoid = vrm.humanoid
    const tracks: THREE.KeyframeTrack[] = []

    // 回転トラックの処理
    this.humanoidTracks.rotation.forEach((origTrack, name) => {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name

      if (nodeName != null) {
        // 回転トラックをQuaternionKeyframeTrackに変更
        const track = new THREE.QuaternionKeyframeTrack(
          `${nodeName}.quaternion`,
          origTrack.times,
          origTrack.values.map((v: number, i: number) => v)
        )
        // 補間方法を線形補間に設定
        track.setInterpolation(THREE.InterpolateLinear)
        tracks.push(track)
      }
    })

    // 平行移動トラックの処理
    this.humanoidTracks.translation.forEach((origTrack, name) => {
      const nodeName = humanoid.getNormalizedBoneNode(name)?.name

      if (nodeName != null) {
        // スケールを計算
        const animationY = this.restHipsPosition.y
        const humanoidY = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Hips)?.position.y ?? 0

        const scale = humanoidY / animationY

        // トラックの値を調整
        const track = origTrack.clone()
        track.values = track.values.map((v: number, i: number) => v * scale)
        track.name = `${nodeName}.position`
        tracks.push(track)
      }
    })

    return tracks
  }

  // 表情のアニメーショントラックを作成するメソッド
  public createExpressionTracks(
    expressionManager: VRMExpressionManager
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = []

    this.expressionTracks.forEach((origTrack, name) => {
      const trackName = `${name}.weight` // 表情のウェイトを直接制御

      if (trackName != null) {
        const track = origTrack.clone()
        track.name = trackName
        tracks.push(track)
      }
    })

    return tracks
  }

  // 視線のアニメーショントラックを作成するメソッド
  public createLookAtTrack(trackName: string): THREE.KeyframeTrack | null {
    if (this.lookAtTrack == null) {
      return null
    }

    const track = this.lookAtTrack.clone()
    track.name = trackName
    return track
  }
}
