"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

interface AccessibleDialogProps {
  children: React.ReactNode
  title: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * AccessibleDialog component that automatically includes the required DialogTitle 
 * for accessibility, even if it needs to be visually hidden.
 */
export function AccessibleDialog({ 
  children, 
  title, 
  description, 
  open, 
  onOpenChange,
  className 
}: AccessibleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {/* This hidden title satisfies the accessibility requirement */}
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        
        {children}
      </DialogContent>
    </Dialog>
  )
} 