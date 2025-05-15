"use client"

import { useEffect, useRef } from "react"

/**
 * Hook to ensure a dialog has a title for accessibility
 * 
 * @param title The title to use if a title doesn't exist
 * @returns A ref to attach to the DialogContent component
 * 
 * @example
 * // In a component with a dialog:
 * const dialogRef = useEnsureDialogTitle("My Dialog Title")
 * 
 * return (
 *   <Dialog>
 *     <DialogContent ref={dialogRef}>
 *       {...content}
 *     </DialogContent>
 *   </Dialog>
 * )
 */
export function useEnsureDialogTitle(title: string = "Dialog Content") {
  const dialogRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const dialogContent = dialogRef.current
    if (!dialogContent) return
    
    // Check if the dialog already has a title element
    const hasTitleElement = !!dialogContent.querySelector('[id^="radix-:"]')
    
    // If not, add a hidden title
    if (!hasTitleElement) {
      // Create a title element with the Radix naming pattern
      const titleId = `radix-:${Math.random().toString(36).substr(2, 9)}`
      const titleElement = document.createElement('div')
      titleElement.id = titleId
      titleElement.setAttribute('style', 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;')
      titleElement.textContent = title
      
      // Add it to the dialog content
      dialogContent.insertBefore(titleElement, dialogContent.firstChild)
      
      // Set the aria-labelledby attribute on the dialog
      dialogContent.setAttribute('aria-labelledby', titleId)
      
      if (process.env.NODE_ENV !== 'production') {
        console.info(`Dialog accessibility: Added hidden title "${title}" to dialog`)
      }
    }
  }, [title])
  
  return dialogRef
} 