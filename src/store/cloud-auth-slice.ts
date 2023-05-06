import { StoreSlice } from './cloud-auth-store';

export interface CloudAuthSlice {
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleRefreshTokenExpirationTime?: number;
  fileId?: string;
  isAppWriteLoggedIn?: boolean;
  setGoogleAccessToken: (googleAccessToken?: string) => void;
  setGoogleRefreshToken: (googleRefreshToken?: string) => void;
  setGoogleRefreshTokenExpirationTime: (googleRefreshTokenExpirationTime?: number) => void;
  setFileId: (fileId?: string) => void;
  setIsAppWriteLoggedIn: (isAppWriteLoggedIn?: boolean) => void;
}

export const createCloudAuthSlice: StoreSlice<CloudAuthSlice> = (set, get) => ({
  setGoogleAccessToken: (googleAccessToken?: string) => {
    set((prev: CloudAuthSlice) => ({
      ...prev,
      googleAccessToken: googleAccessToken,
    }));
  },
  setGoogleRefreshToken: (googleRefreshToken?: string) => {
    set((prev: CloudAuthSlice) => ({
      ...prev,
      googleRefreshToken: googleRefreshToken,
    }));
  },
  setGoogleRefreshTokenExpirationTime: (googleRefreshTokenExpirationTime?: number) => {
    set((prev: CloudAuthSlice) => ({
      ...prev,
      googleRefreshTokenExpirationTime: googleRefreshTokenExpirationTime,
    }));
  },
  setFileId: (fileId?: string) => {
    set((prev: CloudAuthSlice) => ({
      ...prev,
      fileId: fileId,
    }));
  },
  setIsAppWriteLoggedIn: (isAppWriteLoggedIn?: boolean) => {
    set((prev: CloudAuthSlice) => ({
      ...prev,
      isAppWriteLoggedIn: isAppWriteLoggedIn,
    }));
  },
});
