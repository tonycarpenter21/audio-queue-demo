import { ChannelState, ChannelStore, createChannelStore } from 'audioq';
import { useSyncExternalStore } from 'react';

const stores = new Map<number, ChannelStore>();

/** A channel's live state. Re-renders only when something visible changes. */
export function useChannel(channel: number = 0): ChannelState {
  let store: ChannelStore | undefined = stores.get(channel);
  if (!store) {
    store = createChannelStore(channel);
    stores.set(channel, store);
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
