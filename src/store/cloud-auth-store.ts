import { StoreApi, create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CloudAuthSlice, createCloudAuthSlice } from './cloud-auth-slice';

export type StoreState = CloudAuthSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

const useCloudAuthStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createCloudAuthSlice(set, get),
    }),
    {
      name: 'cloud',
      partialize: (state) => ({
        googleAccessToken: state.googleAccessToken,
        googleRefreshToken: state.googleRefreshToken,
        googleRefreshTokenExpirationTime: state.googleRefreshTokenExpirationTime,
        fileId: state.fileId,
        isAppWriteLoggedIn: state.isAppWriteLoggedIn,
      }),
      version: 1,
    }
  )
);

export default useCloudAuthStore;
