import {App, FuzzySuggestModal, Modal, Notice, Setting} from "obsidian";
import {GroupSnippet, GroupSnippetsSettings, Snippets} from "./interface";
import {OpenAllDetails, getAllDetailsState} from "./utils";
import GroupSnippetsPlugins from "./main";
import {GroupSnippetsSettingsTabs} from "./settings";

export class GroupSnippetNaming extends Modal {
	result: string;
	plugin: GroupSnippetsPlugins;
	onSubmit: (result: string) => void;


	constructor(app: App, plugin: GroupSnippetsPlugins, onSubmit: (result: string) => void) {
		super(app);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	}
	onOpen() {
		const {contentEl} = this;
		contentEl.createEl('h2', {text: t('groupSnippetNaming') as string});
		new Setting(contentEl)
			.addText((text) =>
				text.onChange((value) => {
					this.result = value
				}));
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText(t('submitButton') as string)
					.setCta()
					.onClick(() => {
						if (this.plugin.settings.groups.find(group => group.name === this.result) === undefined) {
							this.onSubmit(this.result);
							this.close();
						} else {
							new Notice(t('noticeError') as string);
						}
					}));
	}
	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export class GroupSnippetsModal extends FuzzySuggestModal<Snippets> {
	app: App
	plugin: GroupSnippetsPlugins;
	settings: GroupSnippetsSettingsTabs;
	groupSnippetsName: string;

	constructor(app: App, plugin: GroupSnippetsPlugins, settingsTab: GroupSnippetsSettingsTabs, groupSnippetsName: string) {
		super(app);
		this.plugin = plugin;
		this.settings = settingsTab;
		this.groupSnippetsName = groupSnippetsName;
	}

	getAllSnippets(settings: GroupSnippetsSettings, groupName: string): Snippets[] {
		// @ts-ignore
		const customCSS = this.app.customCss;
		const groups:Snippets[] = []
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

	onChooseItem(item: Snippets, evt: MouseEvent | KeyboardEvent) {
		const groupSnippets: GroupSnippet | undefined = this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName);
		if (groupSnippets !== undefined) {
			// @ts-ignore
			this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName).snippets.push(item);
			// @ts-ignore
			const addedSnippets:{name: string, groupName: string} = {name: item.snippetName, groupName: this.groupSnippetsName};
			new Notice((t('addSnippets') as StringFunc)(addedSnippets));
		}
		const openedGroup = getAllDetailsState()
		this.plugin.saveSettings();
		this.settings.display();
		OpenAllDetails(openedGroup);
	}
}
