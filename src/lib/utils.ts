/**
 * utils.ts
 * 
 * 汎用ユーティリティ関数を提供するモジュール。
 * 
 * 主な機能:
 * - クラス名の結合と最適化
 * 
 * このモジュールは、プロジェクト全体で使用される共通のユーティリティ関数を提供し、
 * コードの再利用性と保守性を向上させます。
 * 
 * @module utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
