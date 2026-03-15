import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          color: '#FFFFFF',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
        classNames: {
          success: 'border-secondary',
          error: 'border-destructive',
          warning: 'border-primary',
        },
      }}
      gap={12}
    />
  )
}

/**
 * Usage Example:
 * 
 * import { toast } from "sonner"
 * 
 * toast.success("Rendimento ativado com sucesso!")
 * toast.error("Falha na transação")
 * toast("Processando...", { duration: 2000 })
 */
