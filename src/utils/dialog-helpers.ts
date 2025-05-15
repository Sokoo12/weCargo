/**
 * Utility functions for working with dialog components and ensuring accessibility
 */

/**
 * checkDialogTitlePresence - Helper function to check if a DialogContent component has a DialogTitle
 * 
 * This is a development helper that can be used to identify components that need to be fixed.
 * It's not meant to be used in production code, but rather as a debugging tool.
 * 
 * @returns {void} Logs warning messages if DialogTitle is missing
 */
export function checkDialogTitlePresence() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

  // Wait for DOM to be ready
  setTimeout(() => {
    const dialogContents = document.querySelectorAll('[role="dialog"] > [role="document"]');
    
    dialogContents.forEach((content, index) => {
      // Check if there's a title element inside
      const hasTitle = content.querySelector('[id^="radix-:"]') !== null;
      
      if (!hasTitle) {
        console.warn(
          `AccessibilityWarning: DialogContent #${index + 1} is missing a DialogTitle component.\n` +
          `This is required for screen reader accessibility.\n` +
          `Fix by adding a <DialogTitle> or using the <AccessibleDialogContent> component.`
        );
      }
    });
  }, 1000);
}

/**
 * A list of common dialog titles that can be used as fallbacks
 * when a specific title isn't available or relevant
 */
export const commonDialogTitles = {
  details: "Item Details",
  confirm: "Confirmation",
  delete: "Delete Confirmation",
  create: "Create New Item",
  edit: "Edit Item",
  upload: "Upload File",
  settings: "Settings",
  info: "Information",
  warning: "Warning",
  error: "Error"
}; 