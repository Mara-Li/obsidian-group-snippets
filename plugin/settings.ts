import {App, ButtonComponent, Notice, PluginSettingTab, setIcon, Setting} from "obsidian";
import GroupSnippetsPlugins from "./main";
import {toggleEnabledSnippet} from "./main";
import {groupSnippetNaming, GroupSnippetsModal} from "./modals";

export interface Snippets {
	snippetName: string,
	enabled: boolean
}

export interface GroupSnippetsSettings {
	groups: {
		name: string,
		snippets: Snippets[],
		active: boolean
	}[],

}

// @ts-ignore
export const DEFAULT_SETTINGS: GroupSnippetsSettings = {
	groups: [],
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
				btn
					.setIcon('plus')
					.setTooltip('Add a new group')
					.onClick(async () => {
					new groupSnippetNaming(this.app, this.plugin, async (result) => {
						this.plugin.settings.groups.push({
							name: result,
							snippets: [],
							active: false
						});
						await this.plugin.saveSettings();
						this.display();
						openDetails(result);
					}).open();
				})
			})
			.addButton((btn: ButtonComponent) => {
				btn
					.setIcon('switch')
					.setTooltip('Refresh the snippet list')
					.onClick(() => {
					const customCSS = (this.app as any).customCss;
					customCSS.readCssFolders();
					removeDeletedSnippets(customCSS, this.plugin);
					this.display();
					new Notice('Snippets reloaded');
				})
			});

		for (const snippets of this.plugin.settings.groups) {
			const groupName = snippets.name;
			const customCSS = (this.app as any).customCss;
			const details = containerEl.createEl('details');
			const summary = details.createEl('summary', {text: groupName});
			const icon = snippets.active ? 'eye' : 'eye-off'
			new Setting(summary)
				.setClass('group-options')
				.addButton((btn: ButtonComponent) => {
					btn
						.setIcon('edit')
						.setTooltip('Add snippets!')
						.onClick(async () => {
						new GroupSnippetsModal(this.app, this.plugin, this, groupName).open();
					})
				})
				.addButton((btn: ButtonComponent) => {
					btn
						.setIcon('trash')
						.setTooltip('Delete this group')
						.onClick(async () => {
							this.plugin.settings.groups = this.plugin.settings.groups.filter(group => group.name !== groupName);
							await this.plugin.saveSettings();
							this.display();
							openDetails(groupName);
						})
				})

				.addButton((btn) => {
					btn
						.setTooltip('Toggle this group')
						.setIcon(icon)
						.onClick(() => {
							toggleEnabledSnippet(snippets, customCSS);
							snippets.active = !snippets.active;
							this.display();
						})
				});
			details.createEl('p');
			for (const snippet of snippets.snippets) {
				new Setting(details)
					.setClass('group-snippet-setting')
					.setName(snippet.snippetName)
					.addToggle((toggle) => {
						toggle
							.setValue(snippet.enabled)
							.onChange((value) => {
							snippet.enabled = value;
							this.plugin.saveSettings();
						});
					})
					.addButton((btn: ButtonComponent) => {
						btn
							.setIcon('trash')
							.setTooltip('Remove this snippet')
							.onClick(() => {
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
