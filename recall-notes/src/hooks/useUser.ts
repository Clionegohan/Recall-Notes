import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export const useUser = () => {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const createUser = useMutation(api.functions.users.createUser)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true)
        const userId = await createUser({
          name: "テストユーザー",
          email: "test@example.com"
        })
        setCurrentUserId(userId)
        setError(null)
      } catch (err) {
        console.error("ユーザー作成エラー:", err)
        setError("ユーザーの初期化に失敗しました")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (!currentUserId) {
      initializeUser()
    }
  }, [createUser, currentUserId])

  return {
    currentUserId,
    error,
    isLoading,
    setError
  }
}