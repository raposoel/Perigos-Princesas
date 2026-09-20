// Import document classes.
import { PerilsAndPrincessesActor } from "./documents/actor.mjs";
import { PerilsAndPrincessesItem } from "./documents/item.mjs";
// Import sheet classes.
import { PerilsAndPrincessesActorSheet } from "./sheets/actor-sheet.mjs";
import { PerilsAndPrincessesItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { PERILSANDPRINCESSES } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
	// Add utility classes to the global game object so that they're more easily
	// accessible in global contexts.
	game.perilsandprincesses = {
		PerilsAndPrincessesActor,
		PerilsAndPrincessesItem,
		rollItemMacro,
	};

	// Add custom constants for configuration.
	CONFIG.PERILSANDPRINCESSES = PERILSANDPRINCESSES;

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	// Set an initiative formula for the system
	CONFIG.Combat.initiative = {
		formula: "1d20 + @virtues.wits.value", // Adjust based on your preferred P&P house rule
		decimals: 2,
	};

	// Define custom Document classes
	CONFIG.Actor.documentClass = PerilsAndPrincessesActor;
	CONFIG.Item.documentClass = PerilsAndPrincessesItem;

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	CONFIG.ActiveEffect.legacyTransferral = false;

	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet(
		"core",
		foundry.appv1.sheets.ActorSheet,
	);
	foundry.documents.collections.Actors.registerSheet(
		"perigoseprincesas",
		PerilsAndPrincessesActorSheet,
		{
			makeDefault: true,
			label: "PERILSANDPRINCESSES.SheetLabels.Actor",
		},
	);
	foundry.documents.collections.Items.unregisterSheet(
		"core",
		foundry.appv1.sheets.ItemSheet,
	);
	foundry.documents.collections.Items.registerSheet(
		"perigoseprincesas",
		PerilsAndPrincessesItemSheet,
		{
			makeDefault: true,
			label: "PERILSANDPRINCESSES.SheetLabels.Item",
		},
	);

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
	return str.toLowerCase();
});

// The 'mult' helper for weight math
Handlebars.registerHelper("mult", function (a, b) {
	const val1 = parseFloat(a) || 0;
	const val2 = parseFloat(b) || 0;
	return val1 * val2;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== "Item") return;
	if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
		return ui.notifications.warn(
			"You can only create macro buttons for owned Items",
		);
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data);

	// Create the macro command using the uuid.
	const command = `game.perilsandprincesses.rollItemMacro("${data.uuid}");`;
	let macro = game.macros.find(
		(m) => m.name === item.name && m.command === command,
	);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "perilsandprincesses.itemMacro": true },
		});
	}
	game.user.assignHotbarMacro(macro, slot);
	return false;
}

/* Use renderChatMessageHTML for V13+ compatibility. 
  Note: 'html' here is a native HTMLElement, not a jQuery object.
*/
Hooks.on("renderChatMessageHTML", (message, html, data) => {
	const rollBtn = html.querySelector(".pp-chat-roll-btn");
	if (!rollBtn) return;

	rollBtn.addEventListener("click", async (ev) => {
		ev.preventDefault();

		const card = ev.currentTarget.closest(".pp-chat-card");
		const itemUuid = card.dataset.itemUuid;

		const item = await fromUuid(itemUuid);
		if (!item) return ui.notifications.error("Item not found!");

		const r = item.system.roll;

		// 1. Guard clause: if there is no dice size, we can't roll.
		if (!r.diceSize) return;

		// 2. Logic for 0 and null values:
		// Use ?? (nullish coalescing) to allow 0.
		// If diceNum is null/undefined, it defaults to 1.
		const dNum = r.diceNum ?? 1;
		const dSize = r.diceSize;
		const dBonus = r.diceBonus ? ` + ${r.diceBonus}` : "";

		const formula = `${dNum}${dSize}${dBonus}`;

		// 3. Execute the roll
		const roll = await new Roll(formula, item.getRollData()).roll();

		return roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: item.actor }),
			flavor: `<span class="pp-font-display">Rolling ${item.name}</span>`,
		});
	});
});

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: "Item",
		uuid: itemUuid,
	};
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid;
			return ui.notifications.warn(
				`Could not find item ${itemName}. You may need to delete and recreate this macro.`,
			);
		}

		// Trigger the item roll
		item.roll();
	});
}
