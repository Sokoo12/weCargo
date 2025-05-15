# How to Fix Dialog Accessibility Issues

This guide provides step-by-step instructions for fixing the `DialogContent requires a DialogTitle` accessibility error in the weCargo application.

## Quick Fixes

### Option 1: Use the useEnsureDialogTitle Hook (Easiest)

```tsx
import { useEnsureDialogTitle } from "@/hooks/useEnsureDialogTitle";

function MyComponent() {
  // Add this line to your component
  const dialogRef = useEnsureDialogTitle("My Dialog Title");
  
  return (
    <Dialog>
      {/* Just add the ref to your DialogContent */}
      <DialogContent ref={dialogRef}>
        {/* No other changes needed */}
        Your existing content...
      </DialogContent>
    </Dialog>
  );
}
```

### Option 2: Use DialogAccessibility Component

```tsx
import { DialogAccessibility } from "@/components/ui/ensure-dialog-accessibility";

<DialogContent>
  {/* Add this line at the top of your DialogContent */}
  <DialogAccessibility title="My Dialog Title" />
  
  {/* Rest of your dialog content remains unchanged */}
  Your existing content...
</DialogContent>
```

## Better Solutions (Proper Implementation)

### Option 3: Add Proper DialogTitle (Recommended)

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>My Visible Dialog Title</DialogTitle>
    <DialogDescription>Optional description here</DialogDescription>
  </DialogHeader>
  
  {/* Rest of your dialog content */}
</DialogContent>
```

### Option 4: Add Hidden DialogTitle

If you don't want a visible title but need proper accessibility:

```tsx
import { HiddenDialogTitle } from "@/components/ui/accessible-dialog";

<DialogContent>
  <HiddenDialogTitle>My Hidden Title</HiddenDialogTitle>
  
  {/* Rest of your dialog content */}
</DialogContent>
```

### Option 5: Use AccessibleDialogContent

Replace DialogContent with AccessibleDialogContent:

```tsx
import { AccessibleDialogContent } from "@/components/ui/accessible-dialog";

<Dialog>
  <AccessibleDialogContent title="My Dialog Title" className="your-classes">
    {/* Dialog content */}
  </AccessibleDialogContent>
</Dialog>
```

## Checking for Problem Areas

To find all dialogs that might have accessibility issues:

```bash
# Find DialogContent components that might be missing DialogTitle
grep -r "<DialogContent" --include="*.tsx" src/
```

Then check each file to ensure it has either:
- A `<DialogTitle>` component inside the `<DialogContent>`
- A `<HiddenDialogTitle>` component
- Using an `AccessibleDialogContent` instead of `DialogContent`
- Using the `useEnsureDialogTitle` hook
- Using the `DialogAccessibility` component

## Testing Your Fixes

1. Run the application in development mode
2. Open the browser console and check for the dialog accessibility error
3. If fixed correctly, the error should no longer appear
4. Test with a screen reader to confirm the dialog is properly announced

## Example Files That Need Fixing

These files were identified as having dialog accessibility issues:

- `src/app/admin/components/packages/OrderForm.tsx`
- `src/app/admin/components/packages/StatusHistoryModal.tsx`
- `src/app/admin/components/packages/StatusChangeModal.tsx`
- `src/app/employee/manager/components/orders/BulkOrderUpload.tsx`
- `src/app/employee/deliveries/page.tsx`

Check these files first and apply one of the solution methods described above. 