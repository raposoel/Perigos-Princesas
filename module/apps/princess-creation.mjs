import { GIFTS_DATA, GIFT_ORDER, GIFT_LABELS } from "../helpers/gifts-data.mjs";

/**
 * Assistente de Criação de Princesa.
 *
 * Dois modos:
 *  - "full": fluxo completo usado na criação inicial da ficha (Dom -> Atributos -> PC).
 *  - "gift": reabre só a escolha de Dom (usado pelo lapisinho ao lado do nome do Dom
 *    na ficha, depois que a criação completa já foi feita uma vez).
 *
 * Regras implementadas (Livro Básico):
 *  - Role um d8 ou escolha seu Dom (aqui vira uma lista clicável com prévia de imagem).
 *  - Role 4d4 para cada Virtude (Determinação, Graça, Astúcia), nessa ordem. Depois,
 *    escolha UMA ação de ajuste: rerrolar uma única Virtude OU trocar os valores de
 *    duas Virtudes (nunca as duas coisas).
 *  - PC inicial: d4+4.
 */
export class PrincessCreationApp extends foundry.appv1.api.Application {
	/**
	 * @param {Actor} actor
	 * @param {object} [options]
	 * @param {"full"|"gift"} [options.mode="full"]
	 */
	constructor(actor, options = {}) {
		super(options);
		this.actor = actor;
		this.mode = options.mode === "gift" ? "gift" : "full";

		// Estado do assistente
		this.step = "gift";
		this.selectedGift = actor.system.giftChoice?.value || "";
		this.virtues = null; // { resolve, grace, wits } depois de rolado
		this.adjustMode = null; // null | "reroll" | "swap"
		this.adjustmentUsed = false;
		this.swapFirst = null;
		this.pc = null;

		// Colore a janela de acordo com o tema já escolhido na ficha (Rosa/Dourado/Roxo/Verde)
		const theme = actor.system?.princessTheme?.value || "default";
		this.options.classes.push(theme);
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template:
				"systems/perigoseprincesas/templates/apps/princess-creation.hbs",
			classes: ["pp-dialog", "pp-creation-app"],
			width: 680,
			height: "auto",
			resizable: true,
		});
	}

	/** @override */
	get id() {
		return `pp-creation-${this.actor.id}`;
	}

	/** @override */
	get title() {
		return this.mode === "gift" ? "Trocar Dom" : "Criar Princesa";
	}

	/** @override */
	getData() {
		const giftEntries = GIFT_ORDER.map((key) => {
			const data = GIFTS_DATA[key];
			return {
				key,
				title: data?.title || GIFT_LABELS[key] || key,
				img: data?.img || "icons/svg/mystery-man.svg",
				selected: key === this.selectedGift,
			};
		});

		const selectedGiftData = this.selectedGift
			? GIFTS_DATA[this.selectedGift]
			: null;

		let virtueList = null;
		if (this.virtues) {
			const virtueDefs = this.actor.system.virtues;
			virtueList = ["resolve", "grace", "wits"].map((key) => ({
				key,
				label: virtueDefs[key].label,
				value: this.virtues[key],
				swapSelected: this.swapFirst === key,
			}));
		}

		return {
			isFullMode: this.mode === "full",
			isGiftMode: this.mode === "gift",
			isGiftStep: this.step === "gift",
			isAttributesStep: this.step === "attributes",
			isPcStep: this.step === "pc",
			gifts: giftEntries,
			selectedGift: this.selectedGift,
			selectedGiftData,
			virtues: virtueList,
			attributesRolled: !!this.virtues,
			isRerollMode: this.adjustMode === "reroll",
			isSwapMode: this.adjustMode === "swap",
			canAdjust: !this.adjustmentUsed,
			pc: this.pc,
		};
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// --- Passo 1: Dom ---
		html.find(".pp-cp-gift-item").on("click", (ev) => {
			this.selectedGift = ev.currentTarget.dataset.gift;
			this.render(false);
		});

		html.find(".pp-cp-next").on("click", () => {
			if (!this.selectedGift) return;
			this.step = "attributes";
			this.render(false);
		});

		html.find(".pp-cp-finish-gift").on("click", async () => {
			if (!this.selectedGift) return;
			await this.actor.update({
				"system.giftChoice.value": this.selectedGift,
			});
			this.close();
		});

		// --- Navegação ---
		html.find(".pp-cp-back").on("click", () => {
			if (this.step === "attributes") this.step = "gift";
			else if (this.step === "pc") this.step = "attributes";
			this.render(false);
		});

		// --- Passo 2: Atributos ---
		html.find(".pp-cp-roll-attributes").on("click", async () => {
			const values = {};
			for (const key of ["resolve", "grace", "wits"]) {
				const roll = await new Roll("4d4").evaluate();
				values[key] = roll.total;
			}
			this.virtues = values;
			this.adjustMode = null;
			this.adjustmentUsed = false;
			this.swapFirst = null;
			this.render(false);
		});

		html.find(".pp-cp-start-reroll").on("click", () => {
			this.adjustMode = "reroll";
			this.swapFirst = null;
			this.render(false);
		});

		html.find(".pp-cp-start-swap").on("click", () => {
			this.adjustMode = "swap";
			this.swapFirst = null;
			this.render(false);
		});

		html.find(".pp-cp-cancel-adjust").on("click", () => {
			this.adjustMode = null;
			this.swapFirst = null;
			this.render(false);
		});

		html.find(".pp-cp-virtue-box").on("click", async (ev) => {
			if (!this.adjustMode || this.adjustmentUsed) return;
			const key = ev.currentTarget.dataset.virtue;

			if (this.adjustMode === "reroll") {
				const roll = await new Roll("4d4").evaluate();
				this.virtues[key] = roll.total;
				this.adjustmentUsed = true;
				this.adjustMode = null;
				this.render(false);
				return;
			}

			// Modo troca
			if (!this.swapFirst) {
				this.swapFirst = key;
				this.render(false);
				return;
			}
			if (this.swapFirst === key) return;

			const a = this.swapFirst;
			const b = key;
			[this.virtues[a], this.virtues[b]] = [this.virtues[b], this.virtues[a]];
			this.adjustmentUsed = true;
			this.adjustMode = null;
			this.swapFirst = null;
			this.render(false);
		});

		html.find(".pp-cp-confirm-attributes").on("click", () => {
			if (!this.virtues) return;
			this.step = "pc";
			this.render(false);
		});

		// --- Passo 3: PC ---
		html.find(".pp-cp-roll-pc").on("click", async () => {
			const roll = await new Roll("1d4 + 4").evaluate();
			this.pc = roll.total;
			this.render(false);
		});

		html.find(".pp-cp-finish").on("click", async () => {
			if (!this.virtues || !this.pc) return;

			await this.actor.update({
				"system.giftChoice.value": this.selectedGift,
				"system.virtues.resolve.value": this.virtues.resolve,
				"system.virtues.grace.value": this.virtues.grace,
				"system.virtues.wits.value": this.virtues.wits,
				"system.hp.value": this.pc,
				"system.hp.max": this.pc,
				"system.creationDone": true,
			});

			const v = this.actor.system.virtues;
			const giftTitle =
				GIFTS_DATA[this.selectedGift]?.title ||
				GIFT_LABELS[this.selectedGift] ||
				"Nenhum";

			ChatMessage.create({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				content: `
					<div class="pp-chat-card">
						<h3 class="pp-font-display">${this.actor.name} — Princesa Criada!</h3>
						<p class="pp-font-main"><strong>Dom:</strong> ${giftTitle}</p>
						<p class="pp-font-main">
							<strong>${v.resolve.label}:</strong> ${this.virtues.resolve} &nbsp;
							<strong>${v.grace.label}:</strong> ${this.virtues.grace} &nbsp;
							<strong>${v.wits.label}:</strong> ${this.virtues.wits}
						</p>
						<p class="pp-font-main"><strong>Pontos Coração:</strong> ${this.pc}</p>
					</div>
				`,
			});

			this.close();
		});
	}
}
