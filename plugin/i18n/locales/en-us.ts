export default {
	/* ------- Commands ------- */
	commandsName: (groupName: string) => `Toggle Group: ${groupName}`,
	addSnippets: (snippets:{name: string, groupName: string}) => `Adding ${snippets.name} to ${snippets.groupName}`,
	enablingGroup: (groupName: string) => `The group ${groupName} has been activated.`,
	reloadGroupCommand: 'Reload Group Snippets',
	darkTheme: 'dark',
	lightTheme: 'light',

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
	loglevel: 'Log Level',
	loglevelDesc: 'The log level for the plugin.',
	logInfo: 'Info',
	logWarn: 'Warning',
	logError: 'Error',
	logNone: 'None',

	/* --- Modal ---- */
	groupSnippetNaming: 'Group Snippet Name',
	submitButton: 'Submit',
	noticeError: 'Error ! This group already exists.',
	selectedSnippet:(snippetName: string) => `Selected: ${snippetName}`
}

