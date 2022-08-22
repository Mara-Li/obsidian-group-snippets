import {App, FuzzySuggestModal, Modal, Notice, Setting} from "obsidian";
import {GroupSnippetsSettings, Snippets, openDetails} from "./settings";
import t, {StringFunc} from "./i18n"
import GroupSnippetsPlugins from "./main";

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
	settings: GroupSnippetsSettings;
	groupSnippetsName: string;

	constructor(app: App, plugin: GroupSnippetsPlugins, settings: GroupSnippetsSettings, groupSnippetsName: string) {
		super(app);
		this.plugin = plugin;
		this.settings = settings;
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
		new Notice((t('commandsName') as StringFunc)(item.snippetName));
		if (this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName) !== undefined) {
			// @ts-ignore
			this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName).snippets.push(item);
		}
		this.plugin.saveSettings();
		this.settings.display();
		openDetails(this.groupSnippetsName, true);
	}
}
