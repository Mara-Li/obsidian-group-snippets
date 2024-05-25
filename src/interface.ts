
export interface Snippets {
	snippetName: string,
	enabled: boolean
}

export interface WhichPlatform {
    "isDesktop": boolean,
    "isMobile": boolean,
    "isIosApp": boolean,
    "isAndroidApp": boolean,
    "isPhone": boolean,
    "isTablet": boolean,
    "isMacOS": boolean,
    "isWin": boolean,
    "isLinux": boolean,
}

export interface GroupSnippet{
	name: string,
	snippets: Snippets[]
	active: boolean
	themeLinked: string,
	colorScheme: string,
	support: string,
}

export interface GroupSnippetsSettings {
	enabledTheme: string,
	isDarkTheme: boolean | null,
	groups: GroupSnippet[],
	log: string
}

export enum LogLevel {
	info = "info",
	warn = "warn",
	error = "error",
	none = "none",
}

export const DEFAULT_SETTINGS: GroupSnippetsSettings = {
	groups: [],
	enabledTheme: "",
	isDarkTheme: null,
	log: LogLevel.none
};

