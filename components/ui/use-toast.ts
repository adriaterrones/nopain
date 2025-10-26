"use client"

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners = new Set<(toasts: ToasterToast[]) => void>()
let toasts: ToasterToast[] = []

function dispatch(action: { type: "ADD" | "REMOVE"; toast?: ToasterToast }) {
  switch (action.type) {
    case "ADD":
      if (action.toast) {
        toasts = [action.toast, ...toasts].slice(0, TOAST_LIMIT)
        listeners.forEach((listener) => listener(toasts))
      }
      break
    case "REMOVE":
      if (action.toast) {
        toasts = toasts.filter((t) => t.id !== action.toast!.id)
        listeners.forEach((listener) => listener(toasts))
      }
      break
  }
}

export function useToast() {
  const [state, setState] = React.useState<ToasterToast[]>(toasts)

  React.useEffect(() => {
    const listener = (newToasts: ToasterToast[]) => setState(newToasts)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const toast = React.useCallback((toast: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...toast }
    dispatch({ type: "ADD", toast: newToast })
    toastTimeouts.set(
      id,
      setTimeout(() => dispatch({ type: "REMOVE", toast: newToast }), TOAST_REMOVE_DELAY)
    )
  }, [])

  return { toasts: state, toast }
}
