"use client";

import "driver.js/dist/driver.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type Config, type DriveStep } from "driver.js";

export type TourStep = DriveStep;

export type UseTourOptions = Omit<Config, "steps">;

export function useTour(options: UseTourOptions = {}) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(
    (steps: TourStep[]) => {
      driverRef.current?.destroy();
      const { onDestroyStarted, ...rest } = options;
      driverRef.current = driver({
        animate: true,
        overlayOpacity: 0.45,
        showProgress: true,
        ...rest,
        steps,
        onDestroyStarted: (el, step, opts) => {
          driverRef.current?.destroy();
          setIsActive(false);
          onDestroyStarted?.(el, step, opts);
        },
      });
      setIsActive(true);
      driverRef.current.drive();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const destroy = useCallback(() => {
    driverRef.current?.destroy();
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { start, destroy, isActive };
}
