const isNode: boolean = typeof window === 'undefined';
const windowObj: { localStorage: Storage | Map<string, string> } = isNode 
  ? { localStorage: new Map<string, string>() } 
  : window;
const storage = windowObj.localStorage;

interface GetAppParamOptions {
  defaultValue?: string;
  removeFromUrl?: boolean;
}

interface AppParams {
  appId: string | null;
  token: string | null;
  fromUrl: string | null;
  functionsVersion: string | null;
  appBaseUrl: string | null;
}

const toSnakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (
  paramName: string, 
  { defaultValue = undefined, removeFromUrl = false }: GetAppParamOptions = {}
): string | null | undefined => {
  if (isNode) {
    return defaultValue;
  }
  
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  
  if (removeFromUrl) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  if (searchParam) {
    if (storage instanceof Storage) {
      storage.setItem(storageKey, searchParam);
    } else {
      (storage as Map<string, string>).set(storageKey, searchParam);
    }
    return searchParam;
  }
  
  if (defaultValue) {
    if (storage instanceof Storage) {
      storage.setItem(storageKey, defaultValue);
    } else {
      (storage as Map<string, string>).set(storageKey, defaultValue);
    }
    return defaultValue;
  }
  
  if (storage instanceof Storage) {
    const storedValue = storage.getItem(storageKey);
    if (storedValue) {
      return storedValue;
    }
  } else {
    const storedValue = (storage as Map<string, string>).get(storageKey);
    if (storedValue) {
      return storedValue;
    }
  }
  
  return null;
}

const getAppParams = (): AppParams => {
  if (getAppParamValue("clear_access_token") === 'true') {
    if (storage instanceof Storage) {
      storage.removeItem('base44_access_token');
      storage.removeItem('token');
    } else {
      (storage as Map<string, string>).delete('access_token');
      (storage as Map<string, string>).delete('token');
    }
  }
  
  return {
    appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE__APP_ID }) ?? null,
    token: getAppParamValue("access_token", { removeFromUrl: true }) ?? null,
    fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }) ?? null,
    functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_FUNCTIONS_VERSION }) ?? null,
    appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_4_APP_BASE_URL }) ?? null,
  }
}

export const appParams: AppParams = {
  ...getAppParams()
}