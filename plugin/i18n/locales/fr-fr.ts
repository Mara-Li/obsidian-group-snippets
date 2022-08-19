export default {
	/* ------- Commands ------- */
	commandsName: (groupName: string) => `Activer le groupe : ${groupName}`,
	reloadGroupCommand: 'Recharger les snippets',
	darkTheme: 'sombre',
	lightTheme: 'clair',

	/* ------- Settings ------- */
	snippetListHeader: 'Liste des snippets',
	snippetListDesc: 'Voici la liste des snippets groupés créés par le plugin.',
	snippetListHelp: 'Vous pouvez ajouter/supprimer/modifier les groupes ici.',

	addGroupHeader: 'Ajouter un groupe',
	addGroupTooltip: 'Ajouter un nouveau groupe',

	refreshToolTip: 'Rafraîchir la liste des snippets',
	refreshNotice: 'Snippets rechargés',

	toggleEverything: 'Tout activer',
	disableEverything: 'Tout désactiver',

	addSnippet: 'Ajouter un snippet',
	deleteGroup: 'Supprimer ce groupe',

	toggleSnippet: 'Activer/désactiver les snippets du groupe',
	removeSnippet: 'Supprimer ce snippet',

	loglevel: 'Niveau de log',
	loglevelDesc: 'Le niveau de log pour le module',
	logInfo: 'Info',
	logWarn: 'Avertissement',
	logError: 'Erreur',
	logNone: 'Aucun',


	/* --- Modal ---- */
	groupSnippetNaming: 'Nom du groupe de snippets',
	submitButton: 'Valider',
	noticeError: 'Erreur ! Ce groupe existe déjà.',
	selectedSnippet:(snippetName: string) => `Selection : ${snippetName}`
}

