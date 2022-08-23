import {Plugin, Platform, Notice} from 'obsidian';
import {GroupSnippetsSettings, DEFAULT_SETTINGS, GroupSnippet, LogLevel} from './settings';
import t, {StringFunc} from "./i18n"
import enUS from './i18n/locales/en-us';

export default class GroupSnippetsPlugins extends Plugin {
	settings: GroupSnippetsSettings;

	reloadCommands(){
		this.unload();
		this.load();
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
		const mobile = ['ios', 'android', 'mobile'];
		const desktop = ['windows', 'mac', 'linux', 'desktop', 'PC'];
		if (mobile.some((device: string) => groupName.toLowerCase().includes(device.toLowerCase()))) {
			return 'mobile';
		} else if (desktop.some((device: string) => groupName.toLowerCase().includes(device.toLowerCase()))) {
			return 'desktop';
		}
		return 'both';
	}

	isDarkOrLightColorScheme(groupName: string) {
		const translationDarkTheme = [t('darkTheme') as string, enUS['darkTheme']];
		const translationLightTheme = [t('lightTheme'), enUS['lightTheme']]
		if (translationLightTheme.some((theme: string) => groupName.toLowerCase().includes(theme))) {
			return 'light';
		} else if (translationDarkTheme.some((theme: string) => groupName.toLowerCase().includes(theme))) {
			return 'dark';
		}
		return 'both';
	}

	themeLinkedToGroupSnippet(groupName: string) {
		// @ts-ignore
		const downloadedTheme = this.app.customCss.themes;
		for (const theme of downloadedTheme) {
			const themeName = theme.replace(/(-{2,}|_)/, '-').split('-');
			if (themeName.some((name: string) => groupName.toLowerCase().includes(name.toLowerCase()))) {
				return theme;
			}
		}
		return '';
	}

	disableOtherThemeGroup(themeName: string) {
		const allGroupSnippet = this.settings.groups;
		const notThisTheme= allGroupSnippet.filter((group: GroupSnippet) => group.themeLinked !== themeName && group.themeLinked !== '');
		for (const group of notThisTheme) {
			this.logging('Disabling ' + group.name);
			for (const snippet of group.snippets) {
				// @ts-ignore
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}

	disableByPlatform(platform: string) {
		const allGroupSnippet = this.settings.groups;
		const notThisPlatform= allGroupSnippet.filter((group: GroupSnippet) => group.support !== platform && group.support !== 'both');
		for (const group of notThisPlatform) {
			this.logging('Disabling ' + group.name);
			for (const snippet of group.snippets) {
				// @ts-ignore
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}

	disableOtherColorScheme(colorScheme: string) {
		const allGroupSnippet = this.settings.groups;
		const notThisColorScheme= allGroupSnippet.filter((group: GroupSnippet) => group.colorScheme !== colorScheme && group.colorScheme !== 'both');
		for (const group of notThisColorScheme) {
			this.logging('Disabling ' + group.name);
			for (const snippet of group.snippets) {
				// @ts-ignore
				this.app.customCss.setCssEnabledStatus(snippet.snippetName, false);
			}
		}
	}

	toggleEnabledSnippet(groupSnippet: GroupSnippet) {
		// @ts-ignore
		const customCSS = this.app.customCss;
		this.logging('Running the group Snippet commands for ' + groupSnippet.name);
		for (const snippet of groupSnippet.snippets) {
			customCSS.setCssEnabledStatus(snippet.snippetName, snippet.enabled);
		}
		new Notice((t('enablingGroup') as StringFunc)(groupSnippet.name))
	}

	async onload() {
		console.log('Enable Group Snippets');
		await this.loadSettings();
		const enabledTheme = this.settings.enabledTheme;
		if (!enabledTheme || enabledTheme.length === 0) {
			// @ts-ignore
			this.settings.enabledTheme = this.app.vault.config?.cssTheme;
			await this.saveSettings();
		}

		if (this.settings.isDarkTheme === null) {
			// @ts-ignore
			this.settings.isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
			await this.saveSettings();
		}

		const groupSnippets = this.settings.groups;

		this.registerEvent(this.app.workspace.on('css-change', () => {
			const currentTheme = this.settings.enabledTheme;
			// @ts-ignore
			const newTheme = this.app.vault.config?.cssTheme;
			// @ts-ignore
			const isDarkTheme = this.app.vault.config?.theme === 'obsidian'
			const wasDarkTheme = this.settings.isDarkTheme;
			const colorScheme = isDarkTheme ? 'dark' : 'light';
			const platform = Platform.isDesktop ? 'desktop' : 'mobile';
			if (newTheme !== currentTheme) {
				this.disableOtherThemeGroup(newTheme);
				this.disableByPlatform(platform);
				const groupedSnippetThemed = groupSnippets.filter(group => newTheme === group.themeLinked || group.themeLinked === '');
				for (const group of groupedSnippetThemed) {
					if (
						(group.colorScheme === colorScheme || group.colorScheme === 'both')
						&& (platform === group.support || group.support === 'both')
					)  {
						this.toggleEnabledSnippet(group);
					}
				}
				this.settings.enabledTheme = newTheme;
				this.saveSettings();
			} else if (isDarkTheme !== wasDarkTheme) { //color scheme changement, activate light / dark theme ;; no need to check CSS theme here
				const groupSnippetThemed = groupSnippets.filter(group => group.colorScheme === colorScheme || group.colorScheme === 'both');
				this.disableOtherColorScheme(colorScheme);
				this.disableByPlatform(platform);
				for (const group of groupSnippetThemed) {
					if ((group.themeLinked === '' || group.themeLinked === this.settings.enabledTheme)
						&& (group.support === platform || group.support === 'both')) {
						this.toggleEnabledSnippet(group);
					}
				}
				this.settings.isDarkTheme = isDarkTheme;
				this.saveSettings();
			}
		}));

		// @ts-ignore
		groupSnippets.forEach(group => {
			if (!group.colorScheme) {
				group.colorScheme = this.isDarkOrLightColorScheme(group.name);
			}
			if (!group.themeLinked || group.themeLinked === '') {
				group.themeLinked = this.themeLinkedToGroupSnippet(group.name);
			}
			if (!group.support) {
				group.support = this.isMobileOrDesktop(group.name);
			}
			this.saveSettings();
			this.addCommand({
					id: `groupSnippets.${group.name}`,
					name: (t('commandsName') as StringFunc)(group.name),
					callback: async () => {
						this.logging((t('commandsName') as StringFunc)(group.name));
						this.toggleEnabledSnippet(group);
						await this.saveSettings();
					}
				});

		})
		this.addSettingTab(new GroupSnippetsSettings(this.app, this));

		this.addCommand({
			id: 'reloadGroupSnippets',
			name: (t('reloadGroupCommand') as string),
			callback: async () => {
				this.logging(t('reloadGroupCommand') as string);
				this.reloadCommands();
			}
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}



