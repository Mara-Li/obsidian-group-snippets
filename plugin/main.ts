import {Plugin} from 'obsidian';
import {GroupSnippetsSettings, DEFAULT_SETTINGS, Snippets} from './settings';
import t, {StringFunc} from "./i18n"

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
		const groupSnippets = this.settings.groups;
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



