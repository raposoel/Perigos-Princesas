import PerilsAndPrincessesItemBase from "./base-item.mjs";

export default class PerilsAndPrincessesItem extends PerilsAndPrincessesItemBase {
	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.quantity = new fields.NumberField({
			...requiredInteger,
			initial: 1,
			min: 1,
		});
		schema.weight = new fields.NumberField({
			required: true,
			nullable: false,
			initial: 0,
			min: 0,
		});

		// Break down roll formula into three independent fields
		schema.roll = new fields.SchemaField({
			diceNum: new fields.NumberField({
				...requiredInteger,
				initial: 1,
				min: 1,
			}),
			diceSize: new fields.StringField({ initial: "d20" }),
			diceBonus: new fields.StringField({
				initial: "+@str.mod+ceil(@lvl / 2)",
			}),
		});

		schema.formula = new fields.StringField({ blank: true });

		return schema;
		return {
			weight: new fields.NumberField({
				required: true,
				initial: 1,
				integer: true,
				choices: {
					0: "None",
					1: "Normal",
					2: "Bulky",
				},
				validationError: "Weight must be 0, 1, or 2.",
			}),
			quantity: new fields.NumberField({ initial: 1, integer: true, min: 0 }),
		};
	}

	prepareDerivedData() {
		// Build the formula dynamically using string interpolation
		const roll = this.roll;

		this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`;
	}
}
