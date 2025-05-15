"use client"

import { useEffect } from "react"
import { HiddenDialogTitle } from "@/components/ui/accessible-dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { DialogTitle } from "@/components/ui/dialog"

/**
 * This component provides a global fix for dialog accessibility issues
 * It automatically injects a hidden title into any dialog that doesn't have one
 * Should be imported and used in the layout.tsx file
 */
export function EnsureDialogAccessibility() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

    // Give time for dialogs to render
    const checkInterval = setInterval(() => {
      const dialogContents = document.querySelectorAll('[role="dialog"] > [role="document"]');
      
      dialogContents.forEach((content, index) => {
        // Check if there's a title element inside
        const hasTitleElement = !!content.querySelector('[id^="radix-:"]');
        
        if (!hasTitleElement) {
          console.warn(
            `AccessibilityWarning: DialogContent #${index + 1} is missing a DialogTitle component.\n` +
            `This is required for screen reader accessibility.\n` +
            `Fix by adding a <DialogTitle> or using the <HiddenDialogTitle> component.`
          );
          
          // Add a hidden title for development
          const titleId = `radix-auto-${Math.random().toString(36).substr(2, 9)}`;
          const existingAutoTitle = content.querySelector(`#${titleId}`);
          
          if (!existingAutoTitle) {
            const titleElement = document.createElement('div');
            titleElement.id = titleId;
            titleElement.setAttribute('role', 'heading');
            titleElement.setAttribute('aria-level', '2');
            titleElement.setAttribute('style', 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;');
            titleElement.textContent = 'Dialog Content';
            
            content.insertBefore(titleElement, content.firstChild);
            (content as HTMLElement).setAttribute('aria-labelledby', titleId);
            
            console.info(`Auto-added hidden title to DialogContent #${index + 1} for development`);
          }
        }
      });
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, []);
  
  return null;
}

/**
 * Component to be used in specific dialogs to ensure they have titles
 */
export function DialogAccessibility({ title = "Dialog Content" }: { title?: string }) {
  return <HiddenDialogTitle>{title}</HiddenDialogTitle>
}

/**
 * Utility component to add a visually-hidden title to a dialog
 * without having to import multiple components
 */
export function SimpleHiddenDialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <VisuallyHidden>
      <DialogTitle>{children}</DialogTitle>
    </VisuallyHidden>
  );
} 