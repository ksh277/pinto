// 라이트 모드만 지원하는 간단한 테마 훅
export type Theme = "light";

export function useTheme() {
  return {
    theme: "light" as Theme,
    setTheme: () => {}, // 아무것도 하지 않음
    toggleTheme: () => {}, // 아무것도 하지 않음
    isDark: false,
  };
}