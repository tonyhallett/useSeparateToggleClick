import {
  ShouldToggleNonClick,
  UsedSeparateToggleClick,
  useSeparateToggleClick,
} from './useSeparateToggleClick';

export const useIconToggleClick = (
  initialExpanded?: string[],
  shouldToggleNonClick?: ShouldToggleNonClick
): UsedSeparateToggleClick => {
  return useSeparateToggleClick(
    isIconClick => isIconClick,
    initialExpanded,
    shouldToggleNonClick
  );
};
