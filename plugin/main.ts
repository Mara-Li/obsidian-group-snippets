import {Plugin} from 'obsidian';
import {GroupSnippetsSettings, DEFAULT_SETTINGS, Snippets} from './settings';

export function toggleEnabledSnippet(groupSnippet: {name: string, snippets: Snippets[], active:boolean}, customCSS: any) {
	for (const snippet of groupSnippet.snippets) {
		if (snippet.enabled) {
			customCSS.setCssEnabledStatus(snippet.snippetName, !customCSS.enabledSnippets.has(snippet.snippetName));
		}
	}
	return groupSnippet;
}

export default class GroupSnippetsPlugins extends Plugin {
	settings: GroupSnippetsSettings;

	reloadCommands(){
		this.unload();
		this.load();
	}

	async onload() {
		console.log('Enable Group Snippets');
		await this.loadSettings();
		const groupSnippets = this.settings.groups;
		const customCSS = (this.app as any).customCss;
		groupSnippets.forEach(group => {
			this.addCommand({
					id: `groupSnippets.${group.name}`,
					name: `Toggle Group: ${group.name}`,
					callback: async () => {
						console.log(`Toggling group snippets: ${group.name}`);
						toggleEnabledSnippet(group, customCSS);
						group.active = !group.active;
						await this.saveSettings();
					}
				});

		})
		this.addSettingTab(new GroupSnippetsSettings(this.app, this));

		this.addCommand({
			id: 'reloadGroupSnippets',
			name: 'Reload Group Snippets',
			callback: async () => {
                console.log('Reloading Group Snippets');
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

	enableCommand() {
		
	}
}



