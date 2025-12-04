# Persistence UI Implementation

## Overview

The persistence status UI has been fully integrated across all project pages, providing real-time feedback on save status.

## Components

### `PersistenceStatus` Component

A visual indicator that shows:
- **Loading state**: When project is being loaded from Supabase
- **Saving state**: Animated pulse when changes are being saved
- **Saved state**: Green dot with "Saved X ago" timestamp
- **Mock mode**: Shows simulated saves when Supabase isn't configured

### Features

1. **Auto-updating timestamps**: Updates every 5 seconds to show relative time
2. **Smooth animations**: Pulse animation during saves
3. **Mock mode**: Simulates saving behavior for demo purposes
4. **Graceful degradation**: Hides when Supabase is disabled and mock is off

## Integration Points

### 1. Dashboard (`/dashboard`)
- Shows overall persistence status
- Info banner when Supabase is not configured
- Mock status indicator

### 2. Project Overview (`/project/[id]`)
- Status in header next to project name
- Updates when project name is edited

### 3. Script Editor (`/project/[id]/editor`)
- Status next to "Script" heading
- Shows auto-save status as user types

### 4. Media Page (`/project/[id]/media`)
- Status next to project title
- Updates when clips are added/modified

### 5. Render Page (`/project/[id]/render`)
- Status next to "Final Render" heading
- Shows persistence status for exports

## Visual States

### Loading
```
🟣 Loading...
```
- Pulsing purple dot
- Shown during initial project load

### Saving
```
🟣 Saving...
```
- Animated pulsing purple dot with ping effect
- Shown during active save operation

### Saved
```
🟢 Saved 3s ago
```
- Green dot with shadow
- Shows relative time (just now, Xs ago, Xm ago, Xh ago)

### Mock Mode
```
🟢 Saved 2s ago (mock)
```
- Same as saved but with "(mock)" indicator
- Simulates saves every 3-4 seconds

## Usage

```tsx
import PersistenceStatus from '@/components/PersistenceStatus'
import { useProjectSync } from '@/hooks/useProjectSync'

const supabaseEnabled = !!(process.env.NEXT_PUBLIC_SUPABASE_URL)

const { isInitialLoad, isSaving, lastSaved } = useProjectSync({
  projectId: id,
  enabled: supabaseEnabled,
})

<PersistenceStatus
  enabled={supabaseEnabled}
  isInitialLoad={isInitialLoad}
  isSaving={isSaving}
  lastSaved={lastSaved}
  showMock={!supabaseEnabled}
/>
```

## Mock Mode Behavior

When `showMock={true}` and `enabled={false}`:
- Simulates periodic saves every 3-4 seconds
- Shows "Saving..." for 600-1000ms
- Updates "Saved X ago" timestamp
- Adds "(mock)" label to indicate demo mode

This allows users to see the persistence UI in action even without Supabase configured.

## Styling

Uses OmegaFrame design system:
- `omega-accent` for saving state
- `green-500` for saved state
- `omega-text/60` for text
- Small, unobtrusive size (text-xs)
- Smooth animations and transitions
