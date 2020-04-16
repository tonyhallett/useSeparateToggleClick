import * as React from 'react';

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
) => boolean;

interface ILastIconClickManager {
  isLastIconClick(evt: React.ChangeEvent<{}>): boolean;
  setLastIconClickEvent(evt: React.ChangeEvent<{}>): void;
}

class LastIconClickTimestampManager implements ILastIconClickManager {
  private timestamp!: number;
  isLastIconClick(evt: React.ChangeEvent<{}>) {
    return evt.timeStamp === this.timestamp;
  }

  setLastIconClickEvent(evt: React.ChangeEvent<{}>) {
    this.timestamp = evt.timeStamp;
  }
}
export const useSeparateToggleClick = (
  shouldToggleClick: ShouldToggleClick,
  initialExpanded: string[] = [],
  shouldToggleNonClick: ShouldToggleNonClick = () => true
): UsedSeparateToggleClick => {
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const lastIconClickManager = React.useRef<ILastIconClickManager>(
    new LastIconClickTimestampManager()
  );
  const IconWrapper = function IconClickedEventAttacher(props: {
    children: any;
  }) {
    return React.cloneElement(props.children, {
      onClick: (evt: React.ChangeEvent) => {
        lastIconClickManager.current.setLastIconClickEvent(evt);
        const elem: React.ReactElement = props.children;
        if (elem && elem.props && typeof elem.props.onClick === 'function') {
          elem.props.onClick(evt);
        }
      },
    });
  };
  return {
    IconWrapper,
    expanded,
    onNodeToggle: React.useCallback(
      (evt: React.ChangeEvent<{}>, newExpanded: string[]) => {
        setExpanded(oldExpanded => {
          const isExpanding = newExpanded.length > oldExpanded.length;
          if (evt.nativeEvent && evt.nativeEvent.type === 'click') {
            const isIconClick = lastIconClickManager.current.isLastIconClick(
              evt
            );
            const toggleClick = shouldToggleClick(isIconClick, isExpanding);
            if (toggleClick) {
              return newExpanded;
            }
            return oldExpanded;
          }
          let newOrRemoved;
          if (isExpanding) {
            newOrRemoved = newExpanded.filter(
              nodeId => oldExpanded.indexOf(nodeId) === -1
            );
          } else {
            newOrRemoved = oldExpanded.filter(
              nodeId => newExpanded.indexOf(nodeId) === -1
            );
          }
          const toggleNonClick = shouldToggleNonClick(
            isExpanding
              ? 'expand'
              : newExpanded.length === oldExpanded.length
              ? 'nochange'
              : 'collapse',
            newOrRemoved
          );
          if (typeof toggleNonClick === 'boolean') {
            if (toggleNonClick) {
              return newExpanded;
            }
            return oldExpanded;
          }
          return toggleNonClick;
        });
      },
      [setExpanded, shouldToggleNonClick, shouldToggleClick]
    ),
  };
};
