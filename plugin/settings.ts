import {App, ButtonComponent, ExtraButtonComponent, Notice, PluginSettingTab, Setting} from "obsidian";
import GroupSnippetsPlugins from "./main";
import {GroupSnippetsEdit} from "./modals";
import i18next from "i18next";

export class GroupSnippetsSettingsTabs extends PluginSettingTab {
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

		containerEl.createEl("h2", {text: (i18next.t("settings.title") as string)});
		containerEl.createEl("p", {text: (i18next.t("settings.desc") as string)});
		containerEl.createEl("p", {text: i18next.t("settings.help") as string});

		new Setting(containerEl)
			.setName(i18next.t("settings.add.title") as string)
			.setClass("group-snippets-button-container")
			.addButton((btn: ButtonComponent) => {
				btn
					.setIcon("plus")
					.setTooltip(i18next.t("settings.add.tooltip"))
					.onClick(async () => {
						this.plugin.settings.groups.push({
							name: i18next.t("settings.add.untitled"),
							snippets: [],
							active: false,
							themeLinked: "",
							colorScheme: "both",
							support: "both"
						});
						await this.plugin.saveSettings();
						await this.plugin.addNewCommand(undefined, this.plugin.settings.groups[this.plugin.settings.groups.length - 1]);
						this.display();
					});
			})
			.addButton((btn: ButtonComponent) => {
				btn
					.setIcon("switch")
					.setTooltip(i18next.t("settings.refresh.tooltip"))
					.onClick(async () => {
						//@ts-ignore
						const customCSS = (this.app as unknown).customCss;
						customCSS.readCssFolders();
						await this.removeDeletedSnippets(this.plugin);
						new Notice(i18next.t("settings.refresh.notice") as string);
					});
			});

		for (const snippets of this.plugin.settings.groups) {
			const icon = snippets.active ? "check-in-circle" : "cross-in-box";
			const desc = snippets.active ? i18next.t("settings.everything.enable") as string : i18next.t("settings.everything.disable") as string;
			const groupName = snippets.name;
			new Setting(containerEl)
				.setClass("group-options")
				.addText((text) => {
					text
						.setValue(groupName)
						.onChange(async (value) => {
							snippets.name = value;
							snippets.themeLinked = this.plugin.themeLinkedToGroupSnippet(value);
							snippets.colorScheme = this.plugin.isDarkOrLightColorScheme(value);
							snippets.support = this.plugin.isMobileOrDesktop(value);
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setIcon("trash")
						.setTooltip(i18next.t("settings.remove", {name: groupName}))
						.onClick(async () => {
							this.plugin.settings.groups = this.plugin.settings.groups.filter(group => group.name !== groupName);
							await this.plugin.saveSettings();
							await this.plugin.removeCommand();
							this.display();
						});
				})
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setIcon("edit")
						.setTooltip(i18next.t("modals.edit.title", {snippet: groupName}) as string)
						.onClick( async () => {
							new GroupSnippetsEdit(this.app, this.plugin, snippets, result => {
								snippets.snippets = result.snippets;
							}).open();
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setIcon(icon)
						.setTooltip(desc)
						.onClick(async () => {
							if (snippets.active) {
								snippets.active = false;
								snippets.snippets.forEach(snippet => {
									snippet.enabled = true;
								});
							} else {
								snippets.active = true;
								snippets.snippets.forEach(snippet => {
									snippet.enabled = false;
								});
							}
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.addExtraButton((btn: ExtraButtonComponent) => {
					btn
						.setTooltip(i18next.t("commands.name", {name: groupName}) as string)
						.setIcon("command-glyph")
						.onClick(async () => {
							this.plugin.toggleEnabledSnippet(snippets);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		}
		new Setting(containerEl)
			.setName(i18next.t("settings.log.title") as string)
			.setDesc(i18next.t("settings.log.desc") as string)
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						"info": i18next.t("settings.log.options.info"),
						"warn": i18next.t("settings.log.options.warn"),
						"error": i18next.t("settings.log.options.error"),
						"none": i18next.t("settings.log.options.none")
					})
					.setValue(this.plugin.settings.log)
					.onChange(async (value) => {
						this.plugin.settings.log = value;
						await this.plugin.saveSettings();
					});
			});
	}

}
