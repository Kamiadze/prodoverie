'use client'

import React, { createContext, useContext, useState } from 'react'

interface Toast {
  id: number
  title?: string
  description?: string
  action?: React.ReactNode
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white rounded-lg shadow-lg p-4 max-w-sm"
            onClick={() => removeToast(toast.id)}
          >
            {toast.title && <h4 className="font-semibold">{toast.title}</h4>}
            {toast.description && <p>{toast.description}</p>}
            {toast.action}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return {
    toast: {
      error: (message: string) => {
        context.addToast({
          title: 'Ошибка',
          description: message,
        })
      },
      success: (message: string) => {
        context.addToast({
          title: 'Успешно',
          description: message,
        })
      }
    }
  }
} 