import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class ColorTextPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);

		const htmlWrapperStart = '<font style="color:0BDA51">';
		const htmlWrapperEnd = "</font>";

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"palette",
			"Color Text Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
				if (markdownView) {
					const colorModal = new ColorModal(this.app);
					colorModal.open();
					// Wait for color modal close or maybe just when user submits a color
					// const selection = markdownView.editor.getSelection();
					// markdownView.editor.replaceSelection(
					// 	htmlWrapperStart + selection + htmlWrapperEnd
					// );
				}
			}
		);

		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "color-text",
			name: "Color text",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Color text Command");
			},
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				// const markdownView =
				// 	this.app.workspace.getActiveViewOfType(MarkdownView);
				// if (markdownView) {
				// 	// If checking is true, we're simply "checking" if the command can be run.
				// 	// If checking is false, then we want to actually perform the operation.
				// 	if (!checking) {
				new SampleModal(this.app).open();
				// 	}

				// 	// This command will only show up in Command Palette when the check function returns true
				// 	return true;
				// }
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ColorModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: "Enter Hex Color" });

		const colorPicker = contentEl.createEl("input", { type: "color" });
		colorPicker.name = "colorPicker";
	}

	onClose() {
		const { contentEl } = this;
		const inputs = contentEl.getElementsByTagName("input");
		const colorPicker = inputs.namedItem("colorPicker");

		contentEl.empty();
		if (colorPicker) {
			const markdownView =
				this.app.workspace.getActiveViewOfType(MarkdownView);
			if (markdownView) {
				// Wait for color modal close or maybe just when user submits a color
				console.log(colorPicker.value);
				// TODO: Use span instead of font
				const htmlWrapperStart =
					'<span name="!pickedColor" style="color:' +
					colorPicker.value +
					'">';
				const htmlWrapperEnd = "</span>";
				const selection = markdownView.editor.getSelection();

				let selectionBody = selection;

				// If there already exists a color wrapper (oof probably should not be coloring any formatting)
				if (selection.contains("!pickedColor")) {
					const htmlFontStartPos = selection.indexOf("<span"); //Probably unnecessary, but just to be safe?
					const htmlFontEndPos = selection.indexOf(
						">",
						htmlFontStartPos
					);
					const htmlWrapperEndPos = selection.indexOf("</span>");
					selectionBody = selection.substring(
						htmlFontEndPos + 1,
						htmlWrapperEndPos
					);
				}

				markdownView.editor.replaceSelection(
					htmlWrapperStart + selectionBody + htmlWrapperEnd
				);
			}
		}
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: ColorTextPlugin;

	constructor(app: App, plugin: ColorTextPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
