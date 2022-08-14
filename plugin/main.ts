import {Plugin} from 'obsidian';
import {GroupSnippetsSettings, DEFAULT_SETTINGS, Snippets} from './settings';
import t, {StringFunc} from "./i18n"
import enUS from './i18n/locales/en-us';

export default class GroupSnippetsPlugins extends Plugin {
	settings: GroupSnippetsSettings;

	reloadCommands(){
		this.unload();
		this.load();
	}


	toggleEnabledSnippet(groupSnippet: {name: string, snippets: Snippets[], active:boolean}) {
		// @ts-ignore
		const customCSS = this.app.customCss;
		console.log('Running the group Snippet commands for ' + groupSnippet.name);
		for (const snippet of groupSnippet.snippets) {
			customCSS.setCssEnabledStatus(snippet.snippetName, snippet.enabled);
		}
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
			const stringDarkTheme = t('darkTheme') as string;
			const stringLightTheme = t('lightTheme') as string;
			const translationDarkTheme = [stringDarkTheme, enUS['darkTheme']]
			const translationLightTheme = [stringLightTheme, enUS['lightTheme']]
			// @ts-ignore
			const newTheme = this.app.vault.config?.cssTheme;
			// @ts-ignore
			const isDarkTheme = this.app.vault.config?.theme === 'obsidian'
			const wasDarkTheme = this.settings.isDarkTheme;
			const colorSchemeChanged = isDarkTheme !== wasDarkTheme;
			const colorScheme = isDarkTheme ? translationDarkTheme : translationLightTheme;
			if (newTheme !== currentTheme) {
				const newThemeName = newTheme.replace(/(-{2,}|_)/, '-').split('-');
				const groupedSnippetThemed = groupSnippets.filter(group => newThemeName.some((theme: string) => group.name.toLowerCase().includes(theme.toLowerCase())));
				for (const group of groupedSnippetThemed) {
					if (colorScheme.some((theme: string) => group.name.toLowerCase().includes(theme))) {
						this.toggleEnabledSnippet(group);
					} else if (!translationDarkTheme.some((theme: string) => group.name.toLowerCase().includes(theme)) && !translationLightTheme.some((theme: string) => group.name.toLowerCase().includes(theme))) {
						this.toggleEnabledSnippet(group);
					}
				}
				this.settings.enabledTheme = newTheme;
				this.saveSettings();
			} else if (colorSchemeChanged) { //color scheme changement, activate light / dark theme ;; no need to check CSS theme here
				const groupSnippetThemed = groupSnippets.filter(group => colorScheme.some((theme: string) => group.name.toLowerCase().includes(theme)));
				for (const group of groupSnippetThemed) {
					this.toggleEnabledSnippet(group);
				}
				this.settings.isDarkTheme = isDarkTheme;
				this.saveSettings();
			}
		}));

		// @ts-ignore
		groupSnippets.forEach(group => {
			this.addCommand({
					id: `groupSnippets.${group.name}`,
					name: (t('commandsName') as StringFunc)(group.name),
					callback: async () => {
						console.log((t('commandsName') as StringFunc)(group.name));
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
                console.log(t('reloadGroupCommand') as string);
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



