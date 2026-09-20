import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class PerilsAndPrincessesItemSheet
	extends foundry.appv1.sheets.ItemSheet
{
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["perilsandprincesses", "sheet", "item"],
			width: 520,
			height: 520,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "description",
				},
			],
		});
	}

	/** @override */
	get template() {
		const path = "systems/perigoseprincesas/templates/item";
		// Return a single sheet for all item types.
		// return `${path}/item-sheet.hbs`;

		// Alternatively, you could use the following return statement to do a
		// unique item sheet by type, like `weapon-sheet.hbs`.
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData() {
		// Retrieve base data structure.
		const context = super.getData();

		// Use a safe clone of the item data for further operations.
		const itemData = this.document.toObject(false);

		// Enrich description info for display
		// Enrichment turns text like `[[/r 1d20]]` into buttons
		context.enrichedDescription =
			await foundry.applications.ux.TextEditor.enrichHTML(
				this.item.system.description,
				{
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Necessary in v11, can be removed in v12
					async: true,
					// Data to fill in for inline rolls
					rollData: this.item.getRollData(),
					// Relative UUID resolution
					relativeTo: this.item,
				},
			);

		// Add the item's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;

		// Adding a pointer to CONFIG.PERILSANDPRINCESSES
		context.config = CONFIG.PERILSANDPRINCESSES;

		// Prepare active effects for easier access
		context.effects = prepareActiveEffectCategories(this.item.effects);

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Roll handlers, click handlers, etc. would go here.

		// Active Effect management
		html.on("click", ".effect-control", (ev) =>
			onManageActiveEffect(ev, this.item),
		);

		html.find(".pp-item-roll").click((ev) => {
			const item = this.item;
			const num = item.system.roll.diceNum || 0;
			const size = item.system.roll.diceSize || "0";
			const bonus = item.system.roll.diceBonus
				? ` + ${item.system.roll.diceBonus}`
				: "";

			const formula = `${num}${size}${bonus}`;
			const roll = new Roll(formula);

			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ item: this.item }),
				flavor: `Using ${item.name}`,
			});
		});
	}

	// Example logic for when the item image is clicked
	async _onItemChat(item) {
		const chatContent = `
    <div class="pp-chat-card" data-item-uuid="${item.uuid}">
        <h3 class="pp-font-display">${item.name}</h3>
        <div class="pp-font-main">${item.system.description}</div>
        <button type="button" class="pp-chat-roll-btn">
            <i class="fas fa-dice-d20"></i> Roll Item
        </button>
    </div>`;

		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			content: chatContent,
		});
	}
}
