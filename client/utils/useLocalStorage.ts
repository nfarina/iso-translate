import { useEffect, useState } from "react";

// Adapted from:
// https://github.com/rehooks/local-storage/blob/master/src/use-localstorage.ts

type Setter<S> = (value: S | ((prevState: S) => S)) => void;

/**
 * React hook to enable updates to state via localStorage.
 * This updates when the {writeLocalStorage} function is used, when the returned function
 * is called, or when the "storage" event is fired from another tab in the browser.
 *
 * @example
 * ```js
 * const MyComponent = () => {
 *   const [myStoredItem, setMyStoredItem] = useLocalStorage('myStoredItem');
 *   return (
 *     <p>{myStoredItem}</p>
 *   );
 * };
 * ```
 *
 * @export
 * @param {string} key The key in the localStorage that you wish to watch.
 * @returns An array containing the value associated with the key in position 0,
 * and a function to set the value in position 1.
 */
export function useLocalStorage<S>(
  key: string,
  initialValue: S | (() => S),
): [S, Setter<S>] {
  // The initialValue arg is only used if there is nothing in localStorage,
  // otherwise we use the value in localStorage so state persists through a
  // page refresh. We pass a function to useState so localStorage lookup only
  // happens once.
  const [item, setInnerItem] = useState<S>(() => {
    const existingValue = localStorage.getItem(key);

    if (existingValue != null) {
      return JSON.parse(existingValue);
    }

    if (initialValue instanceof Function) {
      return initialValue();
    }

    return initialValue;
  });

  // Create an event listener so we can be notified of changes to local state
  // (only works if the other person is using useLocalStorage() as well).
  const onLocalStorageChange = (event: Event) => {
    if (event.type === LocalStorageChanged.eventName) {
      const { detail } = event as LocalStorageChanged;
      if (detail.key === key) {
        const { value } = detail;
        setInnerItem(value != null ? JSON.parse(value) : null);
      }
    } else if (event instanceof StorageEvent) {
      if (event.key === key) {
        const { newValue } = event;
        setInnerItem(newValue != null ? JSON.parse(newValue) : null);
      }
    }
  };

  // Return a wrapped version of useState's setter function that persists the
  // new value to localStorage.
  const setItem: Setter<S> = (value) => {
    if (value instanceof Function) {
      setInnerItem((prevState) => {
        const newValue = value(prevState);
        writeLocalStorage(
          key,
          newValue != null ? JSON.stringify(newValue) : null,
        );
        return newValue;
      });
    } else {
      setInnerItem(value);
      writeLocalStorage(key, value != null ? JSON.stringify(value) : null);
    }
  };

  useEffect(() => {
    // The custom storage event allows us to update our component
    // when a change occurs in localStorage outside of our component
    window.addEventListener(
      LocalStorageChanged.eventName,
      onLocalStorageChange,
    );

    // The storage event only works in the context of other documents (eg. other browser tabs)
    window.addEventListener("storage", onLocalStorageChange);

    return () => {
      window.removeEventListener(
        LocalStorageChanged.eventName,
        onLocalStorageChange,
      );
      window.removeEventListener("storage", onLocalStorageChange);
    };
  }, []);

  return [item, setItem];
}

//
// Low-level methods for modifying localStorage in a way that keeps our hook
// working.
//

export interface LocalStorageEventDetail {
  key: string;
  value: string | null;
}

/**
 * Used for creating new events for LocalStorage. This enables us to
 * have the ability of updating the LocalStorage from outside of the component,
 * but still update the component without prop drilling or creating a dependency
 * on a large library such as Redux.
 *
 * @class LocalStorageChanged
 * @extends {CustomEvent<LocalStorageEventDetail>}
 */
export class LocalStorageChanged extends CustomEvent<LocalStorageEventDetail> {
  public static eventName = "onLocalStorageChange";

  constructor(detail: LocalStorageEventDetail) {
    super(LocalStorageChanged.eventName, { detail });
  }
}

/**
 * Use this instead of directly using localStorage.setItem
 * in order to correctly send events within the same window.
 *
 * @example
 * ```js
 * writeLocalStorage('hello', JSON.stringify({ name: 'world' }));
 * const { name } = JSON.parse(localStorage.getItem('hello'));
 * ```
 *
 * @export
 * @param {string} key The key to write to in the localStorage.
 * @param {string} value The value to write to in the localStorage.
 */
export function writeLocalStorage(key: string, value: string | null) {
  if (value != null) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new LocalStorageChanged({ key, value }));
}
