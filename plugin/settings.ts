import {App, ButtonComponent, ExtraButtonComponent, Notice, PluginSettingTab, Setting} from "obsidian";
import GroupSnippetsPlugins from "./main";
import {GroupSnippetsModal, GroupSnippetNaming} from "./modals";
import t from './i18n'
export interface Snippets {
	snippetName: string,
	enabled: boolean
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
	info = 'info',
	warn = 'warn',
	error = 'error',
	none = 'none',
}

// @ts-ignore
export const DEFAULT_SETTINGS: GroupSnippetsSettings = {
	groups: [],
	enabledTheme: '',
	isDarkTheme: null,
	log: LogLevel.none
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


export class GroupSnippetsSettings extends PluginSettingTab {
	plugin: GroupSnippetsPlugins;

	constructor(app: App, plugin: GroupSnippetsPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}
	async removeDeletedSnippets(plugin: GroupSnippetsPlugins) {
		// @ts-ignore
		const customCSS = this.app.customCss;
		for (const snippets of plugin.settings.groups) {
			for (const snippet of snippets.snippets) {
				if (!customCSS.snippets.includes(snippet.snippetName)) {
					snippets.snippets.splice(snippets.snippets.indexOf(snippet), 1);
				}
			}
		}
		await plugin.saveSettings();
	}

	display(): void {
		const {containerEl} = this;
		this.removeDeletedSnippets(this.plugin);


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
					new GroupSnippetNaming(this.app, this.plugin, async (result) => {
						this.plugin.settings.groups.push({
							name: result,
							snippets: [],
							active: false,
							themeLinked: this.plugin.themeLinkedToGroupSnippet(result),
							colorScheme: this.plugin.isDarkOrLightColorScheme(result),
							support: this.plugin.isMobileOrDesktop(result)
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
					this.removeDeletedSnippets(this.plugin);
					this.display();
					new Notice(t('refreshNotice') as string);
				})
			});

		for (const snippets of this.plugin.settings.groups) {
			const groupName = snippets.name;
			const details = containerEl.createEl('details');
			const summary = details.createEl('summary', {text: groupName});
			summary.addClass('group-snippets-summary');
			const icon = snippets.active ? 'check-in-circle' : 'cross-in-box'
			const iconDesc = snippets.active ? (t('toggleEverything') as string) : (t('disableEverything') as string);
			new Setting(summary)
				.setClass('group-options')
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setIcon('edit')
						.setTooltip(t('addSnippet') as string)
						.onClick(async () => {
						new GroupSnippetsModal(this.app, this.plugin, this, groupName).open();
					})
				})
				.addExtraButton((btn: ExtraButtonComponent) => {
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

				.addExtraButton((btn: ExtraButtonComponent) => {
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
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setTooltip(t('toggleSnippet') as string)
						.setIcon('command-glyph')
						.onClick(() => {
							this.plugin.toggleEnabledSnippet(snippets);
							const detailState = getDetailsState(groupName);
							this.display();
							openDetails(groupName, detailState);
						})
				});
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
					.addExtraButton((btn: ExtraButtonComponent) => {
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
		new Setting(containerEl)
			.setName(t('loglevel') as string)
			.setDesc(t('loglevelDesc') as string)
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						'info': t('logInfo') as string,
						'warn': t('logWarn') as string,
						'error': t('logError') as string,
						'none': t('logNone') as string
					})
					.setValue(this.plugin.settings.log)
					.onChange((value) => {
						this.plugin.settings.log = value;
						this.plugin.saveSettings();
					});
			});
	}

}
