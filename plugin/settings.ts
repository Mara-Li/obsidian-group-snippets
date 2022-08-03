import {App, ButtonComponent, Notice, PluginSettingTab, Setting} from "obsidian";
import GroupSnippetsPlugins from "./main";
import {groupSnippetNaming, GroupSnippetsModal} from "./modals";

export interface Snippets {
	snippetName: string,
	enabled: boolean
}

export interface GroupSnippetsSettings {
	groups: {
		name: string,
		snippets: Snippets[]
	}[]

}

// @ts-ignore
export const DEFAULT_SETTINGS: GroupSnippetsSettings = {
	groups: []
}

export function openDetails(groupName: string) {
	for (let i = 0; i < document.getElementsByTagName('details').length; i++) {
		const details = document.getElementsByTagName('details')[i];
		if (details.innerText === groupName) {
			details.open = true;
		}
	}
}

async function removeDeletedSnippets(customCSS: any, plugin: GroupSnippetsPlugins) {
	for (const snippets of plugin.settings.groups) {
		for (const snippet of snippets.snippets) {
			if (!customCSS.snippets.includes(snippet.snippetName)) {
				snippets.snippets.splice(snippets.snippets.indexOf(snippet), 1);
			}
		}
	}
	await plugin.saveSettings();
}

export class GroupSnippetsSettings extends PluginSettingTab {
	plugin: GroupSnippetsPlugins;

	constructor(app: App, plugin: GroupSnippetsPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		const customCSS = (this.app as any).customCss;
		removeDeletedSnippets(customCSS, this.plugin);


		containerEl.empty();

		containerEl.createEl('h2', {text: 'Snippets List'});
		containerEl.createEl('p', {text: 'The following is a list of the group snippets created by the plugin.'});
		containerEl.createEl('p', {text: 'You can add/remove/edit the groups here.'});

		new Setting(containerEl)
			.setName('Add Group')
			.addButton((btn: ButtonComponent) => {
				btn.setIcon('plus');
				btn.setTooltip('Add a new group');
				btn.onClick(async () => {
					new groupSnippetNaming(this.app, this.plugin, async (result) => {
						this.plugin.settings.groups.push({
							name: result,
							snippets: []
						});
						await this.plugin.saveSettings();
						this.display();
						openDetails(result);
					}).open();
				})
			})
			.addButton((btn: ButtonComponent) => {
				btn.setIcon('switch');
				btn.setTooltip('Refresh the snippet list');
				btn.onClick(() => {
					const customCSS = (this.app as any).customCss;
					customCSS.readCssFolders();
					removeDeletedSnippets(customCSS, this.plugin);
					this.display();
					new Notice('Snippets reloaded');
				})
			});

		for (const snippets of this.plugin.settings.groups) {
			const groupName = snippets.name;
			const details = containerEl.createEl('details');
			const summary = details.createEl('summary', {text: groupName});
			new Setting(summary)
				.setClass('group-options')
				.addButton((btn: ButtonComponent) => {
					btn.setIcon('edit');
					btn.setTooltip('Add snippets!');
					btn.onClick(async () => {
						new GroupSnippetsModal(this.app, this.plugin, this, groupName).open();
					})
				})
				.addButton((btn: ButtonComponent) => {
					btn.setIcon('trash');
					btn.setTooltip('Delete this group');
					btn.onClick(async () => {
						this.plugin.settings.groups = this.plugin.settings.groups.filter(group => group.name !== groupName);
						await this.plugin.saveSettings();
						this.display();
						openDetails(groupName);
					})
				});
			details.createEl('p');
			for (const snippet of snippets.snippets) {
				new Setting(details)
					.setClass('group-snippet-setting')
					.setName(snippet.snippetName)
					.addToggle((toggle) => {
						toggle.setValue(snippet.enabled);
						toggle.onChange((value) => {
							snippet.enabled = value;
							this.plugin.saveSettings();
						});
					})
					.addButton((btn: ButtonComponent) => {
						btn.setIcon('trash');
						btn.setTooltip('Remove this snippet');
						btn.onClick(() => {
							snippets.snippets.splice(snippets.snippets.indexOf(snippet), 1);
							this.plugin.saveSettings();
							this.display();
							openDetails(groupName);
						})
					});
			}
		}
	}
}
