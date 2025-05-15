# Dialog Accessibility in weCargo

## Issue

Radix UI's Dialog component requires a `DialogTitle` for the component to be accessible for screen reader users. Without it, the following error occurs:

```
Error: `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

If you want to hide the `DialogTitle`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/dialog
```

## Solutions

We've implemented several solutions to address this issue:

### 1. Using the AccessibleDialog Component

For new dialogs, use the `AccessibleDialog` component which automatically includes a visually hidden title:

```tsx
import { AccessibleDialog } from "@/components/ui/accessible-dialog";

<AccessibleDialog 
  title="Dialog Title" 
  open={isOpen} 
  onOpenChange={setIsOpen}
>
  {/* Dialog content */}
</AccessibleDialog>
```

### 2. Using AccessibleDialogContent

For existing dialogs where you want to keep the same structure but add accessibility:

```tsx
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <AccessibleDialogContent 
    title="Hidden Title for Screen Readers"
    className="your-existing-classes"
  >
    {/* Dialog content */}
  </AccessibleDialogContent>
</Dialog>
```

### 3. Adding HiddenDialogTitle

For minimal changes to existing dialogs:

```tsx
import { HiddenDialogTitle } from "@/components/ui/accessible-dialog";

<DialogContent className="your-classes">
  <HiddenDialogTitle>Dialog Title</HiddenDialogTitle>
  
  {/* Rest of dialog content */}
</DialogContent>
```

### 4. Using DialogAccessibility Component

The simplest quick fix for existing dialogs:

```tsx
import { DialogAccessibility } from "@/components/ui/ensure-dialog-accessibility";

<DialogContent className="your-classes">
  <DialogAccessibility title="Dialog Title" />
  
  {/* Rest of dialog content */}
</DialogContent>
```

### 5. Global Fix with EnsureDialogAccessibility

For a project-wide solution, add this component to your root layout:

```tsx
import { EnsureDialogAccessibility } from "@/components/ui/ensure-dialog-accessibility";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EnsureDialogAccessibility />
        {children}
      </body>
    </html>
  );
}
```

This will automatically add hidden titles to all dialogs without them. Note that this is a development-only solution and should be combined with proper fixes for production.

## Testing

To test if your dialog is properly accessible:

1. Use a screen reader like NVDA, JAWS, or VoiceOver
2. Open the dialog and ensure it announces the dialog title
3. Check for absence of console errors about missing DialogTitle

## Further Reading

- [Radix UI Dialog Documentation](https://radix-ui.com/primitives/docs/components/dialog)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Dialog Element Accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog#accessibility_considerations) 