import { useState, useCallback } from "react"
import { toast } from "sonner"

interface AsyncActionOptions {
  onSuccess?: (data?: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
}

/**
 * Custom hook for handling async actions with loading states and error handling
 * Perfect for on-chain transactions and API calls
 * 
 * @example
 * const { execute, isLoading } = useAsyncAction({
 *   successMessage: "Transaction successful!",
 *   errorMessage: "Transaction failed"
 * })
 * 
 * await execute(async () => {
 *   return await contract.stake(amount)
 * })
 */
export function useAsyncAction(options: AsyncActionOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await action()
        
        if (options.successMessage) {
          toast.success(options.successMessage)
        }
        
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        
        if (options.errorMessage) {
          toast.error(options.errorMessage)
        } else {
          toast.error(error.message)
        }
        
        options.onError?.(error)
        return undefined
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  return {
    execute,
    isLoading,
    error,
  }
}

/**
 * Hook for simulating on-chain transactions (useful for demo/testing)
 */
export function useSimulatedTransaction() {
  const { execute, isLoading } = useAsyncAction({
    successMessage: "Transação confirmada! ✅",
  })

  const simulateTransaction = useCallback(
    async (delay: number = 2000) => {
      return execute(async () => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, delay))
        
        // Simulate success/failure (90% success rate)
        if (Math.random() > 0.1) {
          return {
            hash: `0x${Math.random().toString(16).slice(2)}`,
            status: "success",
          }
        } else {
          throw new Error("Transação rejeitada pela rede")
        }
      })
    },
    [execute]
  )

  return {
    simulateTransaction,
    isLoading,
  }
}
