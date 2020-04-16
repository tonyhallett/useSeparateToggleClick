import {
  ShouldToggleNonClick,
  UsedSeparateToggleClick,
  useSeparateToggleClick,
} from './useSeparateToggleClick';

export const useLabelToggleClick = (
  initialExpanded?: string[],
  shouldToggleNonClick?: ShouldToggleNonClick
): UsedSeparateToggleClick => {
  return useSeparateToggleClick(
    isIconClick => !isIconClick,
    initialExpanded,
    shouldToggleNonClick
  );
};
