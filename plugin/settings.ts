import {App, ButtonComponent, Notice, PluginSettingTab, setIcon, Setting} from "obsidian";
import GroupSnippetsPlugins from "./main";
import {toggleEnabledSnippet} from "./main";
import {groupSnippetNaming, GroupSnippetsModal} from "./modals";
import t from './i18n'
export interface Snippets {
	snippetName: string,
	enabled: boolean
}

export interface SnippetGroup {
	name: string,
	snippets: Snippets[],
	active: boolean,
	mobile: number
}

export interface GroupSnippetsSettings {
	groups: SnippetGroup[],
}

// @ts-ignore
export const DEFAULT_SETTINGS: GroupSnippetsSettings = {
	groups: [],
}

function getMobileIcons(group: SnippetGroup): string {
	if (group.mobile ==1) { //all 
		return 'workspace-glyph'
	} else if (group.mobile == 2) { //computer
		return 'presentation-glyph'
	} else if (group.mobile == 3){
        return 'enter'
	}
	return ''
}

function getMobileTooltip(group: SnippetGroup): string {
	if (group.mobile == 1) {
		return (t("mobileTooltipAll") as string)
	} else if (group.mobile == 2) {
		return (t("mobileTooltipPC") as string)
	} else if (group.mobile == 3) {
		return (t("mobileTooltipMobile") as string)
	}
	return ''
}

function getDetailsState(groupName: string) {
	for (let i = 0; i < document.getElementsByTagName('details').length; i++) {
		const details = document.getElementsByTagName('details')[i] as HTMLDetailsElement;
		if (details.innerText === groupName) {
			return details.open;
		}
	}
	return true;
}

export function openDetails(groupName: string, detailsState: boolean) {
	for (let i = 0; i < document.getElementsByTagName('details').length; i++) {
		const details = document.getElementsByTagName('details')[i] as HTMLDetailsElement;
		if (details.innerText === groupName && detailsState) {
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

		containerEl.createEl('h2', {text: (t('snippetListHeader') as string)});
		containerEl.createEl('p', {text: (t('snippetListDesc') as string)});
		containerEl.createEl('p', {text: t('snippetListHelp') as string});
		
		new Setting(containerEl)
			.setName(t('addGroupHeader') as string)
			.addButton((btn: ButtonComponent) => {
				btn
					.setIcon('plus')
					.setTooltip(t('addGroupTooltip') as string)
					.onClick(async () => {
					new groupSnippetNaming(this.app, this.plugin, async (result) => {
						this.plugin.settings.groups.push({
							name: result,
							snippets: [],
							active: false,
							mobile: 1
						});
						await this.plugin.saveSettings();
						const detailState = getDetailsState(result);
						this.display();
						openDetails(result, detailState);
					}).open();
				})
			})
			.addButton((btn: ButtonComponent) => {
				btn
					.setIcon('switch')
					.setTooltip(t('refreshToolTip') as string)
					.onClick(() => {
					const customCSS = (this.app as any).customCss;
					customCSS.readCssFolders();
					removeDeletedSnippets(customCSS, this.plugin);
					this.display();
					new Notice(t('refreshNotice') as string);
				})
			})

		for (const snippets of this.plugin.settings.groups) {
			const groupName = snippets.name;
			const customCSS = (this.app as any).customCss;
			const details = containerEl.createEl('details');
			const summary = details.createEl('summary', {text: groupName});
			summary.addClass('group-snippets-summary');
			const icon = snippets.active ? 'check-in-circle' : 'cross-in-box'
			const iconDesc = snippets.active ? (t('toggleEverything') as string) : (t('disableEverything') as string);
			const iconMobile = getMobileIcons(snippets);
			const mobileTooltip = getMobileTooltip(snippets);

			new Setting(summary)
				.setClass('group-options')
				.addButton((btn: ButtonComponent) => {
					btn
						.setIcon('edit')
						.setTooltip(t('addSnippet') as string)
						.onClick(async () => {
						new GroupSnippetsModal(this.app, this.plugin, this, groupName).open();
					})
				})
				.addButton((btn: ButtonComponent) => {
					btn
                        .setIcon(iconMobile)
						.setTooltip(mobileTooltip)
						.onClick(async () => {
							snippets.mobile = snippets.mobile +1;
							if (snippets.mobile > 4){
								snippets.mobile = 1;
							}
							const detailState = getDetailsState(groupName);
							await this.plugin.saveSettings();
							this.display();
							openDetails(groupName, detailState);
						})
					})
				.addButton((btn: ButtonComponent) => {
					btn
						.setIcon('trash')
						.setTooltip(t('deleteGroup') as string)
						.onClick(async () => {
							this.plugin.settings.groups = this.plugin.settings.groups.filter(group => group.name !== groupName);
							await this.plugin.saveSettings();
							const detailState = getDetailsState(groupName);
							this.display();
							openDetails(groupName, detailState);
						})
				})

				.addButton((btn: ButtonComponent) => {
					btn
						.setIcon(icon)
						.setTooltip(iconDesc)
						.onClick(() => {
							if (snippets.active) {
								snippets.active = false;
								snippets.snippets.forEach(snippet => {
									snippet.enabled = true;
								})
							} else {
								snippets.active = true;
								snippets.snippets.forEach(snippet => {
									snippet.enabled = false;
								})
							}
							const detailState = getDetailsState(groupName);
							this.plugin.saveSettings();
							this.display();
							openDetails(groupName, detailState);
						})
				})
				.addButton((btn) => {
					btn
						.setTooltip(t('toggleSnippet') as string)
						.setIcon('command-glyph')
						.onClick(() => {
							toggleEnabledSnippet(snippets, customCSS);
							const detailState = getDetailsState(groupName);
							this.display();
							openDetails(groupName, detailState);
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
							.setTooltip(t('removeSnippet') as string)
							.onClick(() => {
							snippets.snippets.splice(snippets.snippets.indexOf(snippet), 1);
							this.plugin.saveSettings();
							const detailState = getDetailsState(groupName);
							this.display();
							openDetails(groupName, detailState);
						})
					});
			}
		}
	}
}
