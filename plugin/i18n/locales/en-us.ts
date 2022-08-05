export default {
	/* ------- Commands ------- */
	commandsName: (groupName: string) => `Toggle Group: ${groupName}`,
	reloadGroupCommand: 'Reload Group Snippets',

	/* ------- Settings ------- */
	snippetListHeader: 'Snippet List',
	snippetListDesc: 'The following is a list of the group snippets created by the plugin.',
	snippetListHelp: 'You can add/remove/edit the groups here.',

	addGroupHeader: 'Add Group',
	addGroupTooltip: 'Add a new group',

	refreshToolTip: 'Refresh the snippet list',
	refreshNotice: 'Snippets reloaded',

	toggleEverything: 'Toggle Everything',
	disableEverything: 'Disable Everything',

	addSnippet: 'Add Snippet',
	deleteGroup: 'Delete this group',

	toggleSnippet: 'Toggle the grouped snippets in on/off',
	removeSnippet: 'Remove this snippet',

	/* --- Modal ---- */
	groupSnippetNaming: 'Group Snippet Name',
	submitButton: 'Submit',
	noticeError: 'Error ! This group already exists.',
	selectedSnippet:(snippetName: string) => `Selected: ${snippetName}`
}

