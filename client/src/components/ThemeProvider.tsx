import { createContext, useContext, ReactNode } from "react";

// 라이트 모드만 지원하는 간단한 테마 프로바이더
interface ThemeContextType {
  theme: "light";
  isDark: false;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: "light", isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
