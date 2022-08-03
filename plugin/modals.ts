import {App, FuzzySuggestModal, Modal, Notice, Setting} from "obsidian";
import {GroupSnippetsSettings, Snippets, openDetails} from "./settings";
import GroupSnippetsPlugins from "./main";

function getAllSnippets(customCSS: any, settings: GroupSnippetsSettings, groupName: string): Snippets[] {
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

export class groupSnippetNaming extends Modal {
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
		contentEl.createEl('h2', {text: 'Group Snippet Name'});
		new Setting(contentEl)
			.addText((text) =>
				text.onChange((value) => {
					this.result = value
				}));
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Submit")
					.setCta()
					.onClick(() => {
						if (this.plugin.settings.groups.find(group => group.name === this.result) === undefined) {
							this.onSubmit(this.result);
							this.close();
						} else {
							new Notice('Error ! This group already exists')
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

	getItems(): Snippets[] {
		const customCSS = (this.app as any).customCss;
		return getAllSnippets(customCSS, this.plugin.settings, this.groupSnippetsName);
	}

	getItemText(item: Snippets): string {
		return item.snippetName;
	}

	onChooseItem(item: Snippets, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Selected ${item.snippetName}`);
		if (this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName) !== undefined) {
			// @ts-ignore
			this.plugin.settings.groups.find(group => group.name === this.groupSnippetsName).snippets.push(item);
		}
		this.plugin.saveSettings();
		this.settings.display();
		openDetails(this.groupSnippetsName);
	}
}
