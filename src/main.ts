import {Plugin, Platform, Notice} from "obsidian";
import {type GroupSnippetsSettings, DEFAULT_SETTINGS, type GroupSnippet, LogLevel, type WhichPlatform} from "./interface";
import {GroupSnippetsSettingsTabs} from "./settings";
import i18next from "i18next";
import { ressources, translationLanguage } from "./i18n/i18next";

export default class GroupSnippetsPlugins extends Plugin {
	settings!: GroupSnippetsSettings;

	async addNewCommand(oldGroupName: GroupSnippet | undefined, newGroupName: GroupSnippet |undefined) {
		if (oldGroupName !== undefined) {
			this.app.commands.removeCommand(`obsidian-group-snippets:${oldGroupName.name}`);
		}
		if (newGroupName !== undefined) {
			this.addCommand({
				id: `${newGroupName.name}`,
				name: i18next.t("commands.name", {name: newGroupName.name}),
				callback: async () => {
					this.logging(i18next.t("commands.name", {name: newGroupName.name}));
					this.toggleEnabledSnippet(newGroupName);
					await this.saveSettings();
				}
			});
		}
	}
	
	async removeCommand() {
		const pluginCommands = Object.keys(this.app.commands.commands).filter((command) => command.startsWith("create-note-in-folder"));
		for (const command of pluginCommands) {
			if (!this.settings.groups.some((grp) => grp.name === command.replace("obsidian-group-snippets:", ""))) {
				this.app.commands.removeCommand(command);
			}
		}
	}

	logging(message: string) {
		if (this.settings.log === LogLevel.warn) {
			console.warn(message);
		} else if (this.settings.log === LogLevel.error) {
			console.error(message);
		} else if (this.settings.log === LogLevel.info) {
			console.info(message);
		}
	}

	isMobileOrDesktop(groupName: string) {
		const name = groupName.toLowerCase();
		//add more precise support
		if (name.includes("ios")) {
			return "isIosApp";
		} else if (name.includes("android")) {
			return "isAndroidApp";
		} else if (name.includes("mobile")) {
			return "isMobile"; //include ios and android ; Tablet & Phone size
		} else if (name.includes("phone")) {
			return "isPhone"; //Phone size
		} else if (name.includes("win") || name.includes("windows")) {
			return "isWin";
		} else if (name.includes("mac") || name.includes("macos")) {
			return "isMacOS";
		} else if (name.includes("linux")) {
			return "isLinux";
		} else if (name.includes("tablet")) {
			return "isTablet";
		} else if (name.includes("desktop") || name.includes("pc")) {
			return "isDesktop";
		}
		return "both";
	}

	isDarkOrLightColorScheme(groupName: string) {
		const translationDarkTheme = [i18next.t("theme.dark") as string, "dark"];
		const translationLightTheme = [i18next.t("theme.light"), "light"];
		if (translationLightTheme.some((theme: string) => groupName.toLowerCase().includes(theme))) {
			return "light";
		} else if (translationDarkTheme.some((theme: string) => groupName.toLowerCase().includes(theme))) {
			return "dark";
		}
		return "both";
	}

	themeLinkedToGroupSnippet(groupName: string) {
		const newObsidianThemes = Object.keys(this.app.customCss.themes);
		const legacyThemes = this.app.customCss.oldThemes;
		const downloadedTheme = [...newObsidianThemes, ...legacyThemes];

		for (const theme of downloadedTheme) {
			const themeName = theme.replace(/(-{2,}|_)/, "-").split("-");
			if (themeName.some((name: string) => groupName.toLowerCase().includes(name.toLowerCase()))) {
				return theme;
			}
		}
		return "";
	}

	disableOtherThemeGroup(themeName?: string) {
		if (!themeName) return;
		const allGroupSnippet = this.settings.groups;
		const notThisTheme= allGroupSnippet.filter((group: GroupSnippet) => group.themeLinked !== themeName && group.themeLinked !== "");
		for (const group of notThisTheme) {
			this.logging(i18next.t("log.disabling", {name: group.name}));
			for (const snippet of group.snippets) {
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}
	
	enableByPlatform(platform: WhichPlatform, activatedSnippets: GroupSnippet) {
		if (activatedSnippets.support === "both") {
			return true;
		}
		
		const isThisPlatform = Object.entries(platform).filter((support: [string, boolean]) => support[1]);
		
		for (const support of isThisPlatform) {
			if (activatedSnippets.support === support[0]) {
				return true;
			} else if (activatedSnippets.support === "mobile" && support[0] === "isMobile") {
				return true;
			} else if (activatedSnippets.support === "desktop" && support[0] === "isDesktop") {
				return true;
			}
		}
		return false;
	}

	disableByPlatform(platform: WhichPlatform) {
		const allGroupSnippet = this.settings.groups;
		const notThis: string[] = [];
		for (const support of Object.entries(platform)) {
			if (!support[1]) {
				notThis.push(support[0]);
			}
		}
		allGroupSnippet.forEach((group: GroupSnippet) => {
			if (group.support === "desktop") {
				group.support = "isDesktop";
			} else if (group.support === "mobile") {
				group.support = "isMobile";
			}
			return group;
		});
		const notThisPlatform = allGroupSnippet.filter((group: GroupSnippet) => notThis.includes(group.support));
		for (const group of notThisPlatform) {
			this.logging(i18next.t("log.disabling", {name: group.name}));
			for (const snippet of group.snippets) {
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}

	disableOtherColorScheme(colorScheme: string) {
		const allGroupSnippet = this.settings.groups;
		const notThisColorScheme= allGroupSnippet.filter((group: GroupSnippet) => group.colorScheme !== colorScheme && group.colorScheme !== "both");
		for (const group of notThisColorScheme) {
			this.logging(i18next.t("log.disabling", { name: group.name }));
			for (const snippet of group.snippets) {
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}

	toggleEnabledSnippet(groupSnippet: GroupSnippet) {
		const customCSS = this.app.customCss;
		this.logging(i18next.t("log.running", {name: groupSnippet.name}));
		for (const snippet of groupSnippet.snippets) {
			customCSS.setCssEnabledStatus(snippet.snippetName, snippet.enabled);
		}
		new Notice(i18next.t("commands.enable", {group: groupSnippet.name}) as string);
	}

	async onload() {
		console.log(`
		Enable Group Snippets v.${this.manifest.version} [language : ${translationLanguage}]`);
		await i18next.init({
			lng: translationLanguage,
			fallbackLng: "en",
			resources: ressources,
			returnNull: false,
		});
		await this.loadSettings();

		const platform: WhichPlatform = {
			isDesktop : Platform.isDesktop,
			isWin: Platform.isWin,
			isMobile : Platform.isMobile,
			isIosApp: Platform.isIosApp,
			isAndroidApp: Platform.isAndroidApp,
			isPhone: Platform.isPhone,
			isTablet: Platform.isTablet,
			isMacOS: Platform.isMacOS && !Platform.isIosApp,
			isLinux: Platform.isLinux,
		};
		const enabledTheme = this.settings.enabledTheme;
		const vaultTheme = this.app.vault.config.cssTheme;
		if ((!enabledTheme || enabledTheme.length === 0) && vaultTheme) {
			this.settings.enabledTheme = vaultTheme;
			await this.saveSettings();
		}

		if (this.settings.isDarkTheme === null) {
			this.settings.isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
			await this.saveSettings();
		}

		const groupSnippets = this.settings.groups;
		
		this.registerEvent(this.app.workspace.on("css-change", () => {
			const currentTheme = this.settings.enabledTheme;
			const newTheme = this.app.vault.config?.cssTheme;
			if (!newTheme) return;
			const isDarkTheme = this.app.vault.config?.theme === "obsidian";
			const wasDarkTheme = this.settings.isDarkTheme;
			const colorScheme = isDarkTheme ? "dark" : "light";

			if (newTheme !== currentTheme) {
				this.logging(`${newTheme} !== ${currentTheme}`);
				this.disableOtherThemeGroup(newTheme);
				this.disableByPlatform(platform);
				const groupedSnippetThemed: GroupSnippet[] = [];
				for (const group of groupSnippets) {
					if (group.themeLinked === "") {
						groupedSnippetThemed.push(group);
					} else if (group.themeLinked === newTheme) {
						groupedSnippetThemed.push(group);
					}
					else  {
						const excludedWord = ["BRAT", "obsidian", ""];
						const themes = group.themeLinked.split("-").filter(theme=> !excludedWord.includes(theme)).map(theme => theme.toLowerCase());
						const newThemes = newTheme.split("-").filter((theme: string)=> !excludedWord.includes(theme)).map((theme: string)=> theme.toLowerCase());
						if (themes.some(theme => newThemes.includes(theme))) {
							groupedSnippetThemed.push(group);
						}
					}
				}
				for (const group of groupedSnippetThemed) {
					if (
						(group.colorScheme === colorScheme || group.colorScheme === "both")
						&& (this.enableByPlatform(platform, group) || group.support === "both")
					)  {
						this.toggleEnabledSnippet(group);
					}
				}
				this.settings.enabledTheme = newTheme;
				this.saveSettings();
				return;
			}
			if (isDarkTheme !== wasDarkTheme) { //color scheme changement, activate light / dark theme ;; no need to check CSS theme here
				const groupSnippetThemed = groupSnippets.filter(group => group.colorScheme === colorScheme || group.colorScheme === "both");
				this.disableOtherColorScheme(colorScheme);
				this.disableByPlatform(platform);
				for (const group of groupSnippetThemed) {
					if ((group.themeLinked === "" || group.themeLinked === this.settings.enabledTheme)
						&& (this.enableByPlatform(platform, group) || group.support === "both")) {
						this.toggleEnabledSnippet(group);
					}
				}
				this.settings.isDarkTheme = isDarkTheme;
				this.saveSettings();
			}
		}));

		groupSnippets.forEach(group => {
			if (!group.colorScheme) {
				group.colorScheme = this.isDarkOrLightColorScheme(group.name);
			}
			if (!group.themeLinked || group.themeLinked === "") {
				group.themeLinked = this.themeLinkedToGroupSnippet(group.name);
			}
			if (!group.support) {
				group.support = this.isMobileOrDesktop(group.name);
			}
			this.saveSettings();
			this.addNewCommand(undefined, group);

		});
		this.addSettingTab(new GroupSnippetsSettingsTabs(this.app, this));
		
	}

	onunload() {
		console.log("unloading GROUP SNIPPETS plugin");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}



