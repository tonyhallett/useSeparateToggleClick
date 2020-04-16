# Installation

npm install useseparatetoggleclick
**Has typescript definition files**

# Use case

Currently the TreeView will treat a label click and an icon click the same.  If you want to only expand when one or the other is clicked you need to find a solution.  This is a solution using a react hook.

# There are 3 hooks available

useSeparateToggleClick - this has the most control

useLabelToggleClick - use this if you only want label clicks to toggle expansion
useIconToggleClick - use this if you only want icon click to toggle expansion

## Signatures

```typescript
export interface UsedSeparateToggleClick {
  IconWrapper: any;
  expanded: string[];
  onNodeToggle: (evt: React.ChangeEvent<{}>, newExpanded: string[]) => void;
}
export type ShouldToggleClick = (
  isIconClick: boolean,
  isExpanding: boolean
) => boolean;
export type ToggleReason = 'expand' | 'collapse' | 'nochange';
export type ShouldToggleNonClick = (
  reason: ToggleReason,
  newOrRemoved: Array<string>
) => boolean | Array<string>;

export const useSeparateToggleClick = (
  shouldToggleClick: ShouldToggleClick,
  initialExpanded: string[] = [],
  shouldToggleNonClick: ShouldToggleNonClick = () => true
): UsedSeparateToggleClick 

```

useLabelToggleClick and useIconToggleClick only have the two optional parameters as they provide the relevant `ShouldToggleClick`;

# Usage

It is likely that you only need to provide the `ShouldToggleClick` argument.  Return true to proceed with the toggle.

`ShouldToggleNonClick` is for toggling due to the keyboard ( Left arrow, Right arrow and *).  It differs to `ShouldToggleClick` in that the reason is a string rather than isExpanding.  Currently onNodeToggle is called by mui even if there is no change.  Here you can return true to proceed, false to not or you can return an array of node ids that will be the new expanded.

The hook returns an object to be used.  Note that onNodeToggle is created with React.useCallback, so too should your shouldToggleClick and shouldToggleNonClick functions.  

a) Use onNodeToggle as the TreeView onNodeToggle prop.

b) Use expanded as the TreeView expanded prop.

c) Wrap all icons in the IconWrapper.

# Example Sandbox
[Example of all usages](https://codesandbox.io/s/stupefied-tree-xhjxl)
