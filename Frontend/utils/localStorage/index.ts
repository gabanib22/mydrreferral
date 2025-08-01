const getLocalStorageItem = (key: string) => {
  const value = JSON.stringify(window.localStorage.getItem(key)) || null;
  return value;
}

const setLocalStorageItem = (key: string, value: string | { [key: string]: string }[]) => {
  const stringify = JSON.stringify(value);
  window.localStorage.setItem(key, stringify);
}

const removeLocalStorageItem = (key: string) => {
  window.localStorage.removeItem(key);
}

export { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem };