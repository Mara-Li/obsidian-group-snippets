# Obsidian group Snippet

This plugin allow you to set group of CSS snippets to class them and enable them in one click (or command).


## Usage

1. Go to the Settings of the plugin
2. Add a group (clicking on the + button)
3. Add a name to the group
4. Click on the `edit` button to add CSS snippets to the group
5. Reload the plugin with the `reload group snippets` command **from your command palette**. 

After this, you have your group of CSS snippets ! 🎉🎉

So, now, to enable the group, run the command `obsidian group enable group_name`. This commands will enable every snippets "enabled" ! You can check your Appearance tab if you need to check.

You can also run this command directly in the settings, when clicking on the `gear` icon!
The plugin will enable the **enabled** snippet, and **disable** the disabled snippets!


The `eye` icon allow you to enable **every** snippets in the group or **disable** them.

Normally, this plugin can totally override the `Appareance` for Snippets !

🗒️ Some notes : 
- You need to reload the snippets (using the button refresh) when you remove snippets. But, no worry, the plugin can't activate snippet that doesn't exist ! It's just the list that need some refreshing :).
- After each addition of group, you need to reload the plugin using the commands : `Reload Group Snippets`

![](docs_gif.gif)

## 🤖 Development

1. Fork the repository on GitHub
2. Clone the repository on your computer
3. Run `npm install` in the cloned repository
4. Run `npm run build` in the cloned repository to build the plugin, you can also use `npm run dev` to watch the changes !

## Credit and thanks
- [MySnippets](https://github.com/chetachiezikeuzor/MySnippets-Plugin)
- [Snippets Commands](https://github.com/deathau/snippet-commands-obsidian)
