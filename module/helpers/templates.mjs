/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	return foundry.applications.handlebars.loadTemplates([
		// Actor partials.
		"systems/perigoseprincesas/templates/actor/parts/actor-features.hbs",
		"systems/perigoseprincesas/templates/actor/parts/actor-items.hbs",
		"systems/perigoseprincesas/templates/actor/parts/actor-gifts.hbs",
		"systems/perigoseprincesas/templates/actor/parts/actor-story.hbs",
		"systems/perigoseprincesas/templates/actor/parts/actor-special.hbs",
	]);
};
