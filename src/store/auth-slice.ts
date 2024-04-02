import { defaultAPIEndpoint } from '@constants/auth';
import { StoreSlice } from './store';

export interface AuthSlice {
  apiKey: string;
  apiEndpoint: string;
  orgId: string;
  availableOrgIds: string[];
  firstVisit: boolean;
  setApiKey: (apiKey: string) => void;
  setApiEndpoint: (apiEndpoint: string) => void;
  setOrgId: (orgId: string) => void;
  setAvailableOrgIds: (orgIds: string[]) => void;
  setFirstVisit: (firstVisit: boolean) => void;
}

export const createAuthSlice: StoreSlice<AuthSlice> = (set, get) => ({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  orgId: '',
  availableOrgIds: [''],
  apiEndpoint: defaultAPIEndpoint,
  firstVisit: true,
  setApiKey: (apiKey: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiKey: apiKey,
    }));
  },
  setApiEndpoint: (apiEndpoint: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiEndpoint: apiEndpoint,
    }));
  },
  setOrgId: (orgId: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      orgId: orgId,
    }));
  },
  setAvailableOrgIds: (availableOrgIds: string[]) => {
    set((prev: AuthSlice) => ({
      ...prev,
      availableOrgIds: availableOrgIds,
    }));
  },
  setFirstVisit: (firstVisit: boolean) => {
    set((prev: AuthSlice) => ({
      ...prev,
      firstVisit: firstVisit,
    }));
  },
});
