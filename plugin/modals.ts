import {App, ButtonComponent, FuzzySuggestModal, Modal, Notice, Setting, ExtraButtonComponent} from "obsidian";
import {GroupSnippet, GroupSnippetsSettings, Snippets} from "./interface";
import GroupSnippetsPlugins from "./main";
import i18next from "i18next";

export class GroupSnippetsEdit extends Modal {
	result: GroupSnippet;
	plugin: GroupSnippetsPlugins;
	onSubmit: (result: GroupSnippet) => void;


	constructor(app: App, plugin: GroupSnippetsPlugins, groupSnippet: GroupSnippet, onSubmit: (result: GroupSnippet) => void) {
		super(app);
		this.plugin = plugin;
		this.result = groupSnippet;
		this.onSubmit = onSubmit;
	}
	onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.createEl("h2", {text: i18next.t("modals.edit.title", {snippet: this.result.name}) as string});
		const icon = this.result.active ? "check-in-circle" : "cross-in-box";
		const desc = this.result.active ? i18next.t("settings.everything.enable") as string : i18next.t("settings.everything.disable") as string;

		new Setting(contentEl)
			.setClass("group-snippets-modal-title")
			.addButton((button: ButtonComponent) => {
				button
					.setButtonText(i18next.t("modals.edit.add") as string)
					.onClick(async () => {
						new GroupSnippetsModal(this.app, this.plugin, this.result.name, result=>{
							this.result.snippets = result.snippets;
							this.plugin.saveSettings();
							this.onOpen();
						}).open();
					});
			})
		.addButton((btn: ButtonComponent) => {
			btn
				.setButtonText(desc)
				.onClick(async () => {
					if (this.result.active) {
						this.result.active = false;
						this.result.snippets.forEach(snippet => {
							snippet.enabled = true;
						});
					} else {
						this.result.active = true;
						this.result.snippets.forEach(snippet => {
							snippet.enabled = false;
						});
					}
					this.onOpen();
				});
		})
		for (const snippet of this.result.snippets) {
			new Setting(contentEl)
				.setClass("group-snippets-modal-snippet")
				.setName(snippet.snippetName)
				.addToggle(toggle => {
					toggle.setValue(snippet.enabled)
						.onChange(async (value) => {
							snippet.enabled = value;
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((button) => {
					button
						.setIcon("trash")
						.setTooltip(i18next.t("modals.edit.delete", {snippet: snippet.snippetName}) as string)
						.onClick(async () => {
							this.result.snippets.splice(this.result.snippets.indexOf(snippet), 1);
							await this.plugin.saveSettings();
							this.onOpen();
						});
				});
		}
		
		new Setting(contentEl)
			.addButton((button: ButtonComponent) => {
				button
					.setButtonText(i18next.t("modals.submit") as string)
					.onClick(async () => {
						this.onSubmit(this.result);
						this.close();
					});
			});
	}
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class GroupSnippetsModal extends FuzzySuggestModal<Snippets> {
	app: App;
	plugin: GroupSnippetsPlugins;
	groupSnippetsName: string;
	onSubmit: (result: GroupSnippet) => void;

	constructor(app: App, plugin: GroupSnippetsPlugins, groupSnippetsName: string, onSubmit: (result: GroupSnippet) => void) {
		super(app);
		this.plugin = plugin;
		this.groupSnippetsName = groupSnippetsName;
		this.onSubmit = onSubmit;
	}

	getAllSnippets(settings: GroupSnippetsSettings, groupName: string): Snippets[] {
		// @ts-ignore
		const customCSS = this.app.customCss;
		const groups:Snippets[] = [];
		const inThisGroup = settings.groups.find(group => group.name === groupName);
		for (const snippets of customCSS.snippets) {
			// @ts-ignore
			if (inThisGroup.snippets.find(snippet => snippet.snippetName === snippets) === undefined) {
				groups.push({
					snippetName: snippets,
					enabled: true
				});
			}
		}
		return groups;
	}


	getItems(): Snippets[] {
		return this.getAllSnippets(this.plugin.settings, this.groupSnippetsName);
	}

	getItemText(item: Snippets): string {
		return item.snippetName;

	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onChooseItem(item: Snippets, evt: MouseEvent | KeyboardEvent) {
		const groupSnippets: GroupSnippet | undefined = this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName);
		if (groupSnippets !== undefined) {
			// @ts-ignore
			new Notice(i18next.t("commands.add", {snippet: item.snippetName, group: this.groupSnippetsName}) as string);
			groupSnippets.snippets.push(item);
			
			this.onSubmit(groupSnippets);
		}
	}
}
