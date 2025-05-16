import { DependencyList, useEffect, useRef } from "react";

// Modified slightly from:
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/

export type Callback = () => void;

export function useInterval(
  callback: Callback,
  delay: number | null,
  deps?: DependencyList,
) {
  const savedCallback = useRef<Callback | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Set up the interval.
  useEffect(() => {
    function tick() {
      const func = savedCallback.current;
      if (func) func();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, ...(deps || [])]);
}
