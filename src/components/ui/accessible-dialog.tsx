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

/**
 * HiddenDialogTitle - A component that visually hides the DialogTitle while keeping it accessible
 * Use this when you need to add a DialogTitle for accessibility but don't want it visible.
 */
export function HiddenDialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <VisuallyHidden>
      <DialogTitle>{children}</DialogTitle>
    </VisuallyHidden>
  )
}

/**
 * AccessibleDialogContent - A component that wraps DialogContent with a hidden DialogTitle
 * This ensures accessibility requirements are met without changing the visual design.
 */
export function AccessibleDialogContent({
  children,
  title,
  className
}: {
  children: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <DialogContent className={className}>
      <HiddenDialogTitle>{title}</HiddenDialogTitle>
      {children}
    </DialogContent>
  )
} 