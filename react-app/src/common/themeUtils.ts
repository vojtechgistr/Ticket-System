export function setTheme(theme: string): void {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
}

const themes: string[] = ["light", "dark"];

export function toggleTheme(): string {
    let currentTheme: string = getCurrentTheme();
    const currentIndex: number = themes.indexOf(currentTheme);
    const targetIndex: number = (currentIndex + 1) % themes.length;
    const targetTheme: string = themes[targetIndex];
    
    setTheme(targetTheme);
    return targetTheme;
}

export function initTheme(): void {
    const currentTheme: string = getCurrentTheme();
    setTheme(currentTheme);
}

export function getCurrentTheme(): string {
    let theme: string | null = localStorage.getItem("theme");
    if (!theme) {
        theme = window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light" : "dark";
    }

    return theme;
}