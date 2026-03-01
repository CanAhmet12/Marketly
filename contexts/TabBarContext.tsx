import React, {
  createContext, useContext, useRef, useCallback, ReactNode,
} from 'react';
import { Animated, Platform } from 'react-native';

export const TAB_BAR_H = Platform.OS === 'ios' ? 84 : 62;

interface TabBarCtx {
  tabBarY: Animated.Value;
  hideTabBar: () => void;
  showTabBar: () => void;
  resetTabBar: () => void;
}

const TabBarContext = createContext<TabBarCtx>({
  tabBarY: new Animated.Value(0),
  hideTabBar: () => {},
  showTabBar: () => {},
  resetTabBar: () => {},
});

export function TabBarProvider({ children }: { children: ReactNode }) {
  const tabBarY = useRef(new Animated.Value(0)).current;
  const hidden  = useRef(false);
  const anim    = useRef<Animated.CompositeAnimation | null>(null);

  const animate = (toValue: number, cb?: () => void) => {
    anim.current?.stop();
    anim.current = Animated.spring(tabBarY, {
      toValue,
      useNativeDriver: true,
      tension: 90,
      friction: 14,
    });
    anim.current.start(cb);
  };

  const hideTabBar = useCallback(() => {
    if (hidden.current) return;
    hidden.current = true;
    animate(TAB_BAR_H + 12);
  }, [tabBarY]);

  const showTabBar = useCallback(() => {
    if (!hidden.current) return;
    hidden.current = false;
    animate(0);
  }, [tabBarY]);

  const resetTabBar = useCallback(() => {
    hidden.current = false;
    tabBarY.setValue(0);
  }, [tabBarY]);

  return (
    <TabBarContext.Provider value={{ tabBarY, hideTabBar, showTabBar, resetTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
}

export const useTabBar = () => useContext(TabBarContext);
