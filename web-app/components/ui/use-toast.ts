
import * as React from "react"
import { ToastProvider, useToaster, Toast } from "react-hot-toast"

export function useToast() {
  const toaster = useToaster()
  return {
    toast: (message) => toaster.notify(message),
  }
}

export function Toaster() {
  return (
    <ToastProvider>
      <Toast />
    </ToastProvider>
  )
}
