import { reorderQueue, removeQueuedItem } from 'audio-channel-queue';

interface UseQueueManipulationReturn {
  handleMoveUp: (fromIndex: number, channelNumber: number) => Promise<void>;
  handleMoveDown: (fromIndex: number, channelNumber: number) => Promise<void>;
  handleRemoveItem: (fromIndex: number, channelNumber: number) => Promise<void>;
}

export function useQueueManipulation(): UseQueueManipulationReturn {
  const handleMoveUp = async (fromIndex: number, channelNumber: number): Promise<void> => {
    if (fromIndex <= 1) return; // Can't move up if already at position 1 (after currently playing)

    const result = await reorderQueue(fromIndex, fromIndex - 1, channelNumber);
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to move item up:', result.error);
    }
  };

  const handleMoveDown = async (fromIndex: number, channelNumber: number): Promise<void> => {
    const result = await reorderQueue(fromIndex, fromIndex + 1, channelNumber);
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to move item down:', result.error);
    }
  };

  const handleRemoveItem = async (fromIndex: number, channelNumber: number): Promise<void> => {
    const result = await removeQueuedItem(fromIndex, channelNumber);
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('Failed to remove item:', result.error);
    }
  };

  return {
    handleMoveDown,
    handleMoveUp,
    handleRemoveItem
  };
}
