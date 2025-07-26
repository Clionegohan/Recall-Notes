import { useState, useEffect } from 'react'

/**
 * スマートデバウンスフック
 * 入力値を指定した遅延時間後に更新する
 * 
 * @param value - デバウンスしたい値
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた値
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // タイマーを設定
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // クリーンアップ関数：前のタイマーをキャンセル
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

