"use client"

import { useCallback } from "react"
import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "destructive"

interface ToasterToast {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: ToastVariant
}

// Define the shape of our toast function with its methods
interface ToastFunction {
  (props: ToasterToast): string | number
  error: (title: string, options?: ToasterToast) => string | number
  success: (title: string, options?: ToasterToast) => string | number
  info: (title: string, options?: ToasterToast) => string | number
  warning: (title: string, options?: ToasterToast) => string | number
  dismiss: (toastId?: string | number) => void
}

// This is just a convenience wrapper around sonner's toast
// to maintain API compatibility with older code
function useToast(): ToastFunction {
  const toast = useCallback(
    ({ title, description, variant, ...props }: ToasterToast) => {
      if (variant === "destructive") {
        return sonnerToast.error(title, {
          description,
          ...props,
        })
      }
      
      return sonnerToast(title, {
        description,
        ...props,
      })
    },
    []
  ) as ToastFunction
  
  toast.error = useCallback(
    (title: string, options?: ToasterToast) => {
      return sonnerToast.error(title, options)
    },
    []
  )
  
  toast.success = useCallback(
    (title: string, options?: ToasterToast) => {
      return sonnerToast.success(title, options)
    },
    []
  )
  
  toast.info = useCallback(
    (title: string, options?: ToasterToast) => {
      return sonnerToast(title, { ...options })
    },
    []
  )
  
  toast.warning = useCallback(
    (title: string, options?: ToasterToast) => {
      return sonnerToast.warning(title, options)
    },
    []
  )

  toast.dismiss = sonnerToast.dismiss

  return toast
}

export { useToast, type ToasterToast }
export default useToast 