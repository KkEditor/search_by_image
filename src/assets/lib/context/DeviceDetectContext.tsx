import React, {
  createContext,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SCREEN_BREAK_POINTS } from "../constants/theme";

import { isMobile as getIsMobile } from "../userAgent";

export const DeviceDetectContext = createContext({
  mobile: getIsMobile(),
});

interface Props {
  userAgent?: string;
  children?: ReactNode;
}

// Responsive Context: determines whether mobile according 'userAgent' and 'resize' (matchMedia)

export const DeviceDetectProvider: FC<Props> = ({ userAgent, children }) => {
  const [isMobile, setIsMobile] = useState(getIsMobile(userAgent));
  const isBrowser = typeof window !== "undefined";

  useEffect(() => {
    setIsMobile(getIsMobile(userAgent));
  }, [userAgent]);

  useEffect(() => {
    if (isBrowser) {
      const mediaQuery = `screen and (max-width: ${
        SCREEN_BREAK_POINTS.lg - 1
      }px)`;

      const matchMedia = window.matchMedia(mediaQuery);

      const handleResizeForMobile = (e: MediaQueryListEvent) => {
        setIsMobile(e.matches);
      };

      const initialWidthCheck = () => {
        if (window.innerWidth < SCREEN_BREAK_POINTS.lg - 1) {
          setIsMobile(true);
        }
      };
      /* update window width at mount, before subscription
       * because value may be changed between render and effect handler
       */
      initialWidthCheck();

      if (typeof matchMedia.addEventListener === "function") {
        matchMedia.addEventListener("change", handleResizeForMobile);
      } else {
        matchMedia.addListener(handleResizeForMobile);
      }
      return () => {
        if (typeof matchMedia.removeEventListener === "function") {
          matchMedia.removeEventListener("change", handleResizeForMobile);
        } else {
          matchMedia.removeListener(handleResizeForMobile);
        }
      };
    }
  }, [isBrowser]);

  return (
    <DeviceDetectContext.Provider
      value={{
        mobile: isMobile,
      }}
    >
      {children}
    </DeviceDetectContext.Provider>
  );
};
