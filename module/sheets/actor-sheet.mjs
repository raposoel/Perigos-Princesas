import {
	onManageActiveEffect,
	prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PerilsAndPrincessesActorSheet
	extends foundry.appv1.sheets.ActorSheet
{
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["perilsandprincesses", "sheet", "actor"],
			width: 760,
			height: 900,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "features",
				},
			],
		});
	}

	/** @override */
	get template() {
		return `systems/perigoseprincesas/templates/actor/actor-${this.actor.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData() {
		// Retrieve the data structure from the base sheet. You can inspect or log
		// the context variable to see the structure, but some key properties for
		// sheets are the actor object, the data object, whether or not it's
		// editable, the items array, and the effects array.
		const context = await super.getData();

		// Use a safe clone of the actor data for further operations.
		const actorData = this.document.toObject(false);
		const data = this.actor.system;

		// Initialize containers
		const gear = [];
		const features = [];

		// Iterate through items, allocating to containers
		for (let i of context.items) {
			if (i.type === "item") {
				gear.push(i);
			} else if (i.type === "feature") {
				features.push(i);
			}
		}

		// Assign these lists back to the context so the template can see them
		context.gear = gear;
		context.features = features;

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;

		// Adding a pointer to CONFIG.PERILSANDPRINCESSES
		context.config = CONFIG.PERILSANDPRINCESSES;

		// Prepare character data and items.
		if (actorData.type == "character") {
			this._prepareItems(context);
			this._prepareCharacterData(context);

			context.giftOptions = {
				nothing: "Nenhum Dom Selecionado",
				spriteag: "Agilidade Feérica",
				powfriend: "Amizade Poderosa",
				glimaura: "Aura Cintilante",
				elementcon: "Conexão Elemental",
				wildheart: "Coração Selvagem",
				sageint: "Intelecto Sábio",
				kitchmag: "Magia da Cozinha",
				regpres: "Presença Régia",
				bogwis: "Sabedoria do Pântano",
				healtouch: "Toque Curativo",
				enchantvoice: "Voz Encantadora",
			};

			context.giftChoice = actorData.system.giftChoice.value;
			console.log("Gift Options:", context.giftOptions);
			console.log("Selected Gift:", context.giftChoice);

			context.giftData = {
				bogwis: {
					title: "Sabedoria do Pântano",
					description:
						"Sua Fada Madrinha a imbuiu com o espírito dos pântanos encharcados do mundo; um exterior perturbador de lama e sujeira esconde um ecossistema fervilhante de vida. A flora e a fauna desses mundos pantanosos oferecem uma fartura para quem é sábia nas formas de usá-las.",
					talents: ["Herbologia", "Coletar Alimentos", "Medicina"],
					innate: [
						{
							name: "Azar",
							text: "O pântano traz azar para quem quer lhe fazer mal. Você pode gastar um Dado Coração para manipular os SALVAMENTOS de NPCs. Role o Dado Coração e some ao SALVAMENTO do NPC, potencialmente transformando o sucesso dele em fracasso. Durante um combate, isso conta como uma Reação.",
						},
						{
							name: "Preservação",
							text: "Coisas em sua posse não podem apodrecer nem estragar, e permanecem perfeitamente preservadas a menos que você decida o contrário.",
						},
					],
					special: [
						{
							level: 1,
							name: "Boneco",
							text: "Concentre-se em uma criatura Por Perto e quebre um boneco feito de gravetos e barbante. Escolha conceder às suas amigas [DADOS] pontos extras de Armadura contra os ataques dessa criatura, ou reduzir a Armadura dela em [DADOS]. Dura [SOMA] Rodadas.",
						},
						{
							level: 2,
							name: "Presença Perturbadora",
							text: "Quem não a entende acha seu semblante assustador, especialmente quando você assume o aspecto sombrio e aterrorizante da bruxa do pântano. [SOMA] alvos Por Perto devem fazer um SALVAMENTO ou fugir de você por [DADOS] minutos, ou até serem feridas.",
						},
						{
							level: 3,
							name: "Toque da Habitante do Pântano",
							text: "Ao seu toque, transforme outras criaturas em formas humildes e pantanosas — e vice-versa! Alvos que não consentirem devem fazer um SALVAMENTO ou serem transformados em sapo, rã, tritão, inseto ou outra criatura do pântano por [SOMA] horas. Se o alvo já for uma dessas criaturas, você o transforma em uma versão humanoide maior e inteligente, que pode falar com você ou até segui-la pela duração do efeito. Se o alvo estava amaldiçoado com aquela forma, esta habilidade desfaz a maldição.",
						},
						{
							level: 4,
							name: "Cabana da Bruxa",
							text: "Recite um encantamento secreto para invocar uma cabana mágica por 8 horas. A magia da cabana cresce dependendo de quantos Dados de Dom você gastar: <ul><li>1 DD: A cabana é inteligente, segura e protegida, impedindo a entrada de intrusos.</li><li>2 DD: Como acima, mas maior por dentro, com cômodos abastecidos de comida e ferramentas úteis para a situação.</li><li>3 DD: Como acima, mas com pernas, permitindo que ela viaje até 77 quilômetros carregando até 10 passageiras.</li><li>4 DD: Como acima, e você pode usar sua Ação para pilotá-la em combate. A cabana tem [SOMA] PC, 2 de Armadura, causa d12 de dano com as pernas, e usa suas Virtudes, mas ataques a acertam automaticamente.</li></ul>",
						},
					],
					mishaps: [
						"Imunda: O espírito do pântano a respinga com lama, sujando-a por completo.",
						"Amaldiçoada: Sua magia instável se volta contra você; sofra d4 de dano.",
						"Limpa Demais: Os DD só retornam em um 1–2 até você Gastar Tempo curtindo um banho de lama.",
						"Encharcada: Você fica Cansada até conseguir se secar em um lugar quente.",
						"Incompreendida: As pessoas instintivamente a evitam ou desconfiam de você até que realize um ato de bondade para uma desconhecida.",
						"Desgastada: Você adquire um aspecto permanente da bruxa do pântano: cabelo ralo, fedor de pântano, corpo torto, pele viscosa ou voz rouca e grasnante.",
					],
				},
				wildheart: {
					title: "Coração Selvagem",
					description:
						"Você tem um coração selvagem. Por causa de sua natureza animalística, você pode chamar as criaturas da floresta e invocá-las em seu auxílio. Às vezes você se pergunta se, no fundo, é mais animal do que humana.",
					talents: ["Caça", "Pesca", "Orientação"],
					innate: [
						{
							name: "Sussurradora",
							text: "Você pode falar com animais e intuir seus sentimentos.",
						},
						{
							name: "Escaladora Natural",
							text: "Você tem vantagem em quaisquer Testes de Virtude envolvendo escalada ou terreno difícil.",
						},
					],
					special: [
						{
							level: 1,
							name: "Assobie Baixinho",
							text: "Você pode invocar animais locais amigáveis em seu auxílio assobiando uma melodia distinta. [SOMA] animais pequenos (esquilos, ratos, sapos) ou [DADOS] bestas grandes (veados, leões-da-montanha, jacarés) ajudarão em uma única tarefa, dentro de suas capacidades. O tipo específico de animal que aparece depende da sua localização e entorno.",
						},
						{
							level: 2,
							name: "Rugido",
							text: "Você solta um rugido bestial. [SOMA] criaturas que possam ouvi-la devem fazer um SALVAMENTO ou ficarão aterrorizadas por [DADOS] rodadas.",
						},
						{
							level: 3,
							name: "Farejar",
							text: "Você consegue sentir até o mais fraco traço de cheiros Por Perto. Se for um cheiro familiar, você reconhece o indivíduo específico e há quanto tempo ele esteve presente, até [SOMA] horas atrás. Se for um cheiro novo, você sabe em termos gerais que tipo de cheiro é — mesmo que seja um fantasma, uma fada ou algo sobrenatural. Gastar dois DD aumenta o alcance para A Uma Pedrada. Gastar três permite farejar Lá Longe.",
						},
						{
							level: 4,
							name: "Forma Selvagem",
							text: "Você se transforma em um animal que já viu antes por até [DADOS]x10 minutos. Você tem [SOMA] PC enquanto está nesta forma. Se cair para 0 PC ou menos, você volta ao normal e fica Ferida. Ser um animal geralmente concede uma vantagem específica. Animais grandes podem ser aterrorizantes, predadores podem ter um ataque extra, e animais minúsculos podem se esconder com facilidade. Tartarugas têm casco, cobras são venenosas, castores podem roer madeira, gambás podem pulverizar odor. Seja criativa, trabalhe com a Mestra e use o bom senso.",
						},
					],
					mishaps: [
						"Peste: Você contraiu alguma doença animal. Fica coberta de marcas visíveis e com coceira até encontrar tratamento.",
						"Cheia de Pulgas: Sofra d4 de dano.",
						"Perdeu a Sua Essência Animal: Os Dados de Dom só retornam em um 1–2 até que você Gaste Tempo brincando e fazendo carinho em um animal. Isso inclui os dados que você acabou de rolar.",
						"Apetite Animal: Você fica Cansada até comer o equivalente a três refeições.",
						"Odor Animal: Você tem desvantagem em situações sociais e falha automaticamente em tentativas de furtividade até tomar um banho com sabão.",
						"Aparência Animal: Você adquire algum tipo de mutação permanente que a faz parecer com um animal. Orelhas peludas, olhos de gato, rabo, etc.",
					],
				},
				enchantvoice: {
				title: "Voz Encantadora",
				description:
					"Você tem uma voz encantadora. Você arrebata aqueles que podem ouvi-la, atraindo-os para perto com admiração, acalmando-os em um estado de paz ou inspirando-os a se juntar a você. Quando realmente solta sua voz, você sente como se ela ecoasse além do reino terreno.",
				talents: ["Música", "Atuação", "Poesia"],
				innate: [
					{
						name: "Mímica",
						text: "Você pode imitar vozes e sons com uma precisão assombrosa.",
					},
					{
						name: "Cativante",
						text: "Você tem vantagem em Testes de Virtude para acalmar, apaziguar, acalentar ou deleitar uma pessoa ou criatura com canção ou verso. Quando você se apresenta, estranhos que a ouvem tendem a se aproximar após serem cativados por sua voz.",
					},
				],
				special: [
					{
						level: 1,
						name: "Canções Simples",
						text: "Você canta uma Canção Feliz, e qualquer um que a ouve pode modificar um Teste de Virtude em até [SOMA]; ou canta uma Canção de Ninar e criaturas Por Perto com PC menores ou iguais a [SOMA] adormecem. Não afeta criaturas que não podem ouvi-la.",
					},
					{
						level: 2,
						name: "Estilhaçar",
						text: "Você atinge a nota aguda perfeita de ressonância. Todas as criaturas A Uma Pedrada (exceto você, mas incluindo suas amigas se não estiverem preparadas) sofrem [SOMA] de dano, ou metade se obtiver sucesso em um SALVAMENTO. Qualquer objeto de vidro, cristal ou outro material frágil nesta área racha e estilhaça. Não afeta criaturas que não podem ouvi-la ou objetos cobertos com tecido grosso ou outro material amortecedor.",
					},
					{
						level: 3,
						name: "Canções Encantadoras",
						text: "Você canta uma bela Balada dedicada a uma única criatura; ela a considera uma amiga por [DADOS] horas; ou faz um enorme Show de Tirar o Fôlego e [SOMA] criaturas devem fazer um SALVAMENTO ou se juntam ao canto, dançam, tocam instrumentos ou se divertem de outra forma por [SOMA] rodadas. Se você ou suas amigas machucarem ou fizerem algo ruim a uma criatura afetada, o efeito termina. Não afeta criaturas que não podem ouvi-la.",
					},
					{
						level: 4,
						name: "Canção do Desejo",
						text: "Uma vez na vida, você pode rolar 4 Dados de Dom para compor uma canção profundamente sentimental, na qual canta seu desejo mais profundo. Sua Fada Madrinha concede este desejo para você. Isso pode ser algo intangível, como a resolução de um conflito, a remoção de uma Maldição ou Trauma, uma habilidade especial ou algo mais, com a aprovação da Mestra. Se quiser usar esta habilidade outra vez, sua Fada Madrinha pode pedir que você conquiste esse direito por meio de uma missão, um favor ou alguma outra prova do seu merecimento.",
					},
				],
				mishaps: [
					"Canto dos Pássaros: Um bando de pássaros, sapos ou outros animais próximos é atraído por sua canção e a segue por aí até que você os convença do contrário.",
					"Voz Forçada: Sofra d4 de dano.",
					"Sem Inspiração: Dados de Dom só retornam em um 1–2 depois que você Gastar Tempo observando algo belo. Isso inclui os dados que você acabou de rolar.",
					"Dor de Cabeça: Você fica Atordoada.",
					"Voz Perdida: Você não pode falar ou cantar até beber chá quente ou mel.",
					"Música Chiclete: Sua canção gruda na cabeça de todos. Todos que estiverem ao alcance da voz ficam Confusos até conseguirem clarear a mente com um estímulo forte, ex.: pular em água fria, comer comida picante ou beber alguma bebida forte.",
				],
			},
			spriteag: {
				title: "Agilidade Feérica",
				description:
					"Você tem uma agilidade feérica. Você é ligeira, naturalmente acrobática, e se move com agilidade e discrição. Você pode pular, dançar e correr como ninguém. Às vezes, quando dança, sente uma magia antiga e misteriosa começar a fluir por você.",
				talents: ["Atlética", "Dançarina", "Equitação"],
				innate: [
					{
						name: "Evasiva",
						text: "Você é habilidosa em esquivar-se de ataques. Sem armadura, seu valor de Armadura é considerado 1. No nível 4, seu valor de Armadura é considerado 2, desde que você não esteja usando armadura.",
					},
					{
						name: "Felina",
						text: "Você tem vantagem em quaisquer Testes de Virtude envolvendo acrobacia, escalada ou furtividade. Você pode pular o dobro da distância de uma pessoa comum.",
					},
				],
				special: [
					{
						level: 1,
						name: "Ágil",
						text: "Modifique um Teste de Virtude em [SOMA] para escapar de uma restrição ou armadilha OU para tentar Manobras de combate como empurrar, agarrar, fazer rasteira ou acrobacias.",
					},
					{
						level: 2,
						name: "Pirueta",
						text: "Em seu turno, além de sua Ação, você pode tentar um ataque adicional na forma de um chute giratório ou manobra acrobática de sua criação. Teste GRAÇA para acertar. Se passar, o ataque causa [SOMA] de dano.",
					},
					{
						level: 3,
						name: "Folia",
						text: "Subtraia até [SOMA] de dano de uma única fonte, enquanto você desvia, salta, dança ou gira para sair do caminho no último instante.",
					},
					{
						level: 4,
						name: "A Dança Mágica",
						text: "Teste 4 Dados de Dom. Você e suas amigas Gastam Tempo dançando apaixonadamente e festejando sob o luar. Requer uma grande fogueira, comida fresca e bebidas saborosas. Quando fizer seu próximo Descanso, sua Fada Madrinha a visita em um sonho e oferece um favor. Ela não causará mal a ninguém, removerá Traumas ou concederá poderes mágicos. Ela pode: <ul><li>Lançar um feitiço protetor ou útil</li><li>Terminar uma Maldição ou curar uma ferida</li><li>Entregar uma mensagem</li><li>Reparar ou renovar um item</li><li>Deixar para você o presente físico de um item mundano que você realmente precisa</li><li>Dar uma resposta a uma pergunta importante</li></ul>",
					},
				],
				mishaps: [
					"Amassado: O item mais frágil no seu inventário fica bastante danificado. Um especialista pode ser capaz de repará-lo.",
					"Distensão Muscular: Sofra d4 de dano.",
					"Excesso de Esforço: Os Dados de Dom só retornam em um 1–2 depois de parar e Gastar Tempo cheirando as flores. Isso inclui os dados que você acabou de rolar.",
					"Articulações Doloridas: Você fica Cansada até Gastar Tempo de molho em água morna.",
					"Tonta: Você fica Atordoada até Gastar Tempo recuperando a compostura, e cai no chão se sofrer qualquer golpe em combate. Mascar hortelã cura este efeito.",
					"Tropeço: Você cai e se machuca. Role na Tabela de Ferimentos.",
				],
			},
			elementcon: {
				title: "Conexão Elemental",
				description:
					"Você tem uma conexão elemental com a natureza. Um elemento em particular é seu amigo; ele virá em seu auxílio e se dobrará à sua imaginação. Esse poder é forte e profundo e, às vezes, difícil de controlar. Escolha um elemento com o qual você tem uma relação profunda. Pode ser os clássicos Fogo, Terra, Ar ou Água, ou algo mais caprichoso, como doces, livros ou flores.",
				talents: [
					"Alquimia",
					"Astronomia",
					"Um talento à sua escolha que se relacione com o seu elemento (ex.: Navegação para água, Ferraria para fogo, etc.)",
				],
				innate: [
					{
						name: "Resistência",
						text: "Qualquer dano ou malefício causado a você pelo seu elemento escolhido é reduzido pela metade. No nível 4, você se torna completamente imune a este tipo de dano.",
					},
					{
						name: "Afinidade",
						text: "Você pode falar com seu elemento. Os elementos podem se comunicar por pantomima, mensagens escritas em símbolos ou por meio de sentimentos e intuição. Quanto maior e mais antigo o elemento, mais informação ele pode transmitir: um vulcão antigo terá muito mais a dizer do que a chama de uma vela, o oceano mais do que uma poça, etc.",
					},
				],
				special: [
					{
						level: 1,
						name: "Moldar",
						text: "Você pode manipular uma quantidade do seu elemento que caiba em [DADOS]x1,5 metro cúbico e moldá-lo em formas específicas. Este elemento deve estar dentro de um alcance de [DADOS] e pode ser movido para qualquer lugar dentro deste alcance, desde que não seja obstruído.",
					},
					{
						level: 2,
						name: "Rajada",
						text: "Dispara uma rajada elemental de 1,5 metro de largura em linha reta para qualquer ponto A Uma Pedrada. Qualquer um em seu caminho sofre [SOMA] de dano, ou metade se obtiver sucesso em um SALVAMENTO.",
					},
					{
						level: 3,
						name: "Tempestade",
						text: "Você invoca uma violenta barragem elemental para descer sobre um local que consiga ver. [SOMA] criaturas A Uma Pedrada umas das outras sofrem [SOMA] de dano, ou metade se obtiverem sucesso em um SALVAMENTO.",
					},
					{
						level: 4,
						name: "Invocar",
						text: "Você pode invocar um pequeno ser elemental com [SOMA] PC. Ele é amigável a você e segue suas instruções. Ele é amorfo, imune a dano do elemento do qual é feito, e todas as suas Virtudes são iguais ao seu valor de ASTÚCIA. Ele se dissolve após [DADOS] horas ou se for reduzido a 0 PC. Ele pode atacar A Uma Pedrada de distância, causando d6 de dano.",
					},
				],
				mishaps: [
					"Gafe: Algo que você fez ofendeu acidentalmente seu elemento. A Mestra logo apresentará um ser elemental para confrontá-la e exigir algum tipo de penitência.",
					"Saiu pela Culatra: Sofra d4 de dano.",
					"Exausta: Os Dados de Dom só retornam em um 1–2 até que você Gaste Tempo se reconectando com seu elemento. Isso inclui os dados que você acabou de rolar.",
					"Mutação Elemental: Algo em sua aparência muda para sempre, à medida que os elementos se apossam dela. Você pode ter um odor constante de fumaça, ou sua pele se torna azul como o oceano.",
					"Explosão: Você acidentalmente causa uma explosão descontrolada ao seu redor. Você e tudo Por Perto devem obter sucesso em um teste de GRAÇA ou sofrem [SOMA] de dano.",
					"Coração Elemental: Sua própria essência está se tornando mais elemental do que humana, e a transição é dolorosa. Role na tabela de Ferimentos.",
				],
			},
			kitchmag: {
				title: "Magia da Cozinha",
				description:
					"Você conhece a magia da cozinha, por ter passado a juventude colhendo e cozinhando. Você tem conhecimento íntimo da flora mágica e pode fazer misturas herbais, sem contar uma torta de mirtilo de fazer inveja. As guloseimas que você assa têm fama de serem mais do que parecem.",
				talents: ["Cozinhar", "Assar", "Coletar Alimentos"],
				innate: [
					{
						name: "Forrageadora",
						text: "Você consegue encontrar comida fresca na maioria dos terrenos e sabe identificar plantas mágicas. Uma vez por dia, você pode Gastar Tempo catando ingredientes para substituir um Dado de Dom gasto.",
					},
					{
						name: "Chá",
						text: "Você sempre tem as ervas para fazer chá em algum bolso. Isso não ocupa espaço no inventário. Quando você Gasta Tempo e prepara uma xícara, pode ler as folhas para adivinhar a resposta de uma única pergunta de sim ou não.",
					},
				],
				special: [
					{
						level: 1,
						name: "Gostosuras",
						text: "Você tem até [DADOS] gostosuras escondidas, que lançam um feitiço quando consumidas. O número rolado determina qual magia você lança, assim como a [SOMA] da magia em questão. Se rolar múltiplos Dados de Dom para uma única gostosura, você pode escolher qualquer um dos feitiços rolados. Você pode rolar para Gostosuras com antecedência para determinar seu efeito, mas elas perdem a potência após você Descansar. <ol><li><i>Jato de Purpurina</i></li><li><i>Escorregadia</i></li><li><i>Animar</i></li><li><i>Bolha</i></li><li><i>Dardo Mágico</i></li><li><i>Restauração</i></li></ol>",
					},
					{
						level: 2,
						name: "Misturas",
						text: "Você conhece as receitas de três misturas e as tem à mão justo quando precisa. Elas podem ser ingeridas ou arremessadas como um Ataque.<ul><li><strong>Tônico:</strong> Acaba com uma Aflição ou cura um ferimento. [DADOS] usos.</li><li><strong>Vitríolo:</strong> Causa [SOMA] de dano quando respinga. Depois, [DADOS] de dano a cada rodada até ser lavado. Corrói metal instantaneamente.</li><li><strong>Anodina:</strong> A criatura cai em um sono pacífico, sem pesadelos. [DADOS] usos.</li></ul>",
					},
					{
						level: 3,
						name: "Coma-me, Beba-me",
						text: "Você aprende mais duas misturas: um bolinho pequeno e um licor doce. Comer o bolinho faz você dobrar de altura por [SOMA] rodadas; seus PC máximos e seu dano também dobram a duração. O licor faz você encolher até o tamanho de um rato por [SOMA] minutos.",
					},
					{
						level: 4,
						name: "Mingau",
						text: "Você cria uma receita de mingau especial com um efeito mágico à sua escolha. Isso usa Dados de Dom como uma mistura. Você pode escolher um feitiço da página de magias ou trabalhar com a Mestra para inventar seu próprio efeito.",
					},
				],
				mishaps: [
					"Efeito Colateral: Trabalhar com ingredientes potentes deixou uma marca visível em você. Seu cabelo pode cair, seus dedos podem ficar permanentemente roxos, ou algum outro resultado determinado por você e a Mestra.",
					"Infusão Explosiva: Você e qualquer um Por Perto sofrem d4 de dano.",
					"Vapores: Vapores de ervas a atingem. Os Dados de Dom só retornam em um 1–2 até que você Gaste Tempo cozinhando e comendo alguma comida fresca.",
					"Maldição Acidental: Você sofre uma Maldição aleatória indefinidamente. Pode testar sua DETERMINAÇÃO a cada manhã para tentar terminar este efeito.",
					"Mistura Instável: Um feitiço aleatório acontece além do seu efeito pretendido.",
					"Passou do Ponto: Uma onda poderosa de magia a sobrecarrega. Role na tabela de Ferimentos.",
				],
			},
			healtouch: {
				title: "Toque Curativo",
				description:
					"Você tem um toque curativo. Você pode restaurar os outros com suas mãos, seus cabelos e suas lágrimas. Você nunca ficou doente, e estar perto de você simplesmente faz os outros se sentirem melhor de um jeito que não conseguem explicar.",
				talents: ["Cura", "Costura", "Criação de Animais", "Herbologia"],
				innate: [
					{
						name: "Sangue Vital",
						text: "Você é imune a doenças, infecções e venenos. No entanto, você é mais apetitosa para monstros, vampiros e qualquer coisa carnívora.",
					},
					{
						name: "Coração Grande",
						text: "Você começa com um Dado Coração extra. Você também pode gastar seus Dados Coração para curar suas amigas quando parar para um Piquenique.",
					},
				],
				special: [
					{
						level: 1,
						name: "Toque Mágico",
						text: "Seu simples toque oferece poderes restauradores, curativos e calmantes. Você é capaz de: <ul><li><strong>Toque: </strong>Fazer contato com uma criatura para restaurar [SOMA] PC.</li><li><strong>Beijinho: </strong>Beijar carinhosamente uma criatura hostil. Se ela tiver [SOMA] PC ou menos, é dominada pela ternura e perde a vontade de lutar. Este efeito termina após [DADOS]x10 minutos ou se você ou suas amigas machucarem a criatura beijada.</li></ul>",
					},
					{
						level: 2,
						name: "Lágrimas",
						text: "Gaste Tempo simpatizando com alguém até chorar [DADOS] lágrimas encantadas. Cada lágrima pode curar uma Aflição, ferimento ou veneno. Lágrimas extras podem ser guardadas em frascos, mas sua eficácia desaparece após você Descansar.",
					},
					{
						level: 3,
						name: "Mecha de Cabelo",
						text: "Você corta uma mecha do seu cabelo e cria um talismã. Se uma criatura estiver carregando um deles, ela ganha [SOMA] PC temporários, somados aos seus PC normais. Ela só pode se beneficiar de um talismã por vez, e o poder dele desaparece após Descansar.",
					},
					{
						level: 4,
						name: "Beijo do Verdadeiro Amor",
						text: "Você pode rolar quatro Dados de Dom e conceder a alguém o beijo do verdadeiro amor. Este beijo pode remover um Trauma, despertá-la de um sono mágico, transformá-la de volta de um sapo ou acabar com outra Maldição, ferimento ou doença mortal similar. Esta habilidade só funciona uma única vez em qualquer indivíduo.",
					},
				],
				mishaps: [
					"Marcada: Canalizar sua magia curativa deixou uma marca visível permanente em você. Um fio de cabelo fica grisalho, um olho muda de cor, veias roxas aparecem no seu pescoço, ou uma transformação similar determinada por você e a Mestra.",
					"Deu Demais de Si: Sofra d4 de dano.",
					"Esgotada: Os Dados de Dom só retornam em um 1–2 depois de Gastar Tempo escovando seu cabelo, tomando banho em água limpa ou fazendo algo bom para si mesma. Isso inclui os dados que você acabou de rolar.",
					"Exaurida: Você fica Cansada até comer algo doce e gostoso.",
					"Transbordou: Toda criatura Por Perto cura d6 PC. Toda planta ao seu redor floresce e cresce instantaneamente.",
					"Enfraquecida: Compartilhar sua essência vital está começando a cobrar seu preço. Role na tabela de Ferimentos.",
				],
			},
			powfriend: {
				title: "Amizade Poderosa",
				description:
					"Você acendeu uma amizade poderosa com um companheiro animal devotado, que lhe oferece ajuda, conselhos e companhia. Quando se trata de suas amigas, você sente que faria qualquer coisa para protegê-las.",
				talents: ["Cura", "Farra", "Jardinagem"],
				innate: [
					{
						name: "Amizade Rápida",
						text: "Você é naturalmente amigável e simpática. Você tem vantagem em quaisquer Testes de Virtude para fazer amizades, negociar tréguas, pedir favores ou outros esforços amistosos.",
					},
					{
						name: "Fardo",
						text: "Você pode Gastar Tempo em conversa com alguém para remover uma Maldição, Trauma, Aflição ou ferimento dela e assumi-lo para si mesma.",
					},
				],
				special: [
					{
						level: 1,
						name: "Companheiro",
						text: "Seus poderes de amizade lhe deram um vínculo especial com um pequeno animal à sua escolha. Ele tem 1 PC, mas é astuto e tem vantagem em testes de GRAÇA para evitar ser atingido. Use suas Virtudes como os atributos dele. Companheiros Feridos marcam automaticamente um ponto de Trauma. Se perdê-lo, você pode recrutar um novo companheiro se encontrar um animal amigo adequado. Seu companheiro a ajudará da melhor forma possível em qualquer situação. Além disso, ele pode usar seus Dados de Dom para: <ul><li><strong>Ajudar:</strong> Modificar os Testes de Virtude suas ou de suas amigas em até [SOMA]. Ele precisa razoavelmente ser capaz de ajudar na situação e decidir que está ajudando antes da rolagem.</li><li><strong>Lutar:</strong> Ele testa DETERMINAÇÃO. Se for bem-sucedido, causa [SOMA] de dano.</li></ul>",
					},
					{
						level: 2,
						name: "Defender",
						text: "Você pode Reagir no combate no último segundo para prevenir até [SOMA] de dano a uma amiga Por Perto de um ataque físico. Você precisa ter algo em mãos para bloquear o ataque, ou sofre o dano você mesma.",
					},
					{
						level: 3,
						name: "Círculo de Proteção",
						text: "Desenhe um círculo de até 6 metros de diâmetro no chão com sal, giz ou um material similar. Nomeie uma pessoa específica ou uma categoria de criaturas, por exemplo, 'Lorde Godfrey' ou 'os mortos-vivos'. Essa pessoa ou tipo de criatura não pode passar para dentro ou para fora do círculo por [SOMA] horas.",
					},
					{
						level: 4,
						name: "Fúria Protetora",
						text: "Se uma amiga sua estiver em perigo direto, você pode entrar em uma fúria protetora por [SOMA] rodadas. Enquanto estiver nesse estado, você: <ul><li>Tem vantagem em ataques contra a criatura ameaçadora</li><li>Tem vantagem em Testes de Virtude para ajudar diretamente a amiga em perigo</li><li>Adiciona [DADOS] ao seu valor de Armadura</li><li>Adiciona [DADOS] de dano aos seus ataques</li></ul>",
					},
				],
				mishaps: [
					"Insônia: Você está preocupada com suas amigas, e isso a mantém acordada à noite. Você não poderá ganhar os benefícios do próximo Descanso noturno.",
					"Ai: Sofra d4 de dano.",
					"Solidão: Os Dados de Dom só retornam em um 1–2 até que você faça uma nova amiga. Isso inclui os dados que você acabou de rolar.",
					"Estressada: Você fica Cansada até Gastar Tempo em algum lazer.",
					"Exaustão Social: Você fica Atordoada até Gastar Tempo sozinha.",
					"Traída: Você foi confiante demais no passado, e um falso amigo se aproveitou de você. A Mestra apresentará este personagem num futuro próximo para infligir uma Maldição, Ferimento ou outro revés.",
				],
			},
			sageint: {
				title: "Intelecto Sábio",
				description:
					"Você tem um intelecto sábio e é uma fonte de conhecimento histórico, folclore antigo e saber prático. Seu nariz sempre está enfiado em algum livro, porque você sente que algo especial lhe aguarda se continuar desvendando os mistérios da vida.",
				talents: ["Caligrafia", "Linguística", "História", "Folclore"],
				innate: [
					{
						name: "Perspicaz",
						text: "Você tem vantagem em Testes de Virtude para avaliar e identificar objetos desconhecidos, analisar rapidamente informações em obras escritas ou ilustradas, e buscar por pistas. Você também é muito boa em xadrez.",
					},
					{
						name: "Conselheira",
						text: "Você pode dar um conselho sábio ou recitar uma citação inspiradora para uma de suas amigas; em combate, isso conta como uma Ação. Na próxima vez que ela usar seus Dados de Dom, ela pode gastar quaisquer dos seus como se fossem dela. Um máximo de quatro Dados de Dom pode ser rolado por vez para uma habilidade.",
					},
				],
				special: [
					{
						level: 1,
						name: "Rato de Biblioteca",
						text: "Você se lembra de uma informação específica que leu no passado. Desde que seja algo que poderia ter lido em um livro em algum momento, a Mestra deve fornecer a informação e presumir que é algo em que você pode agir. A profundidade da informação depende do número de [DADOS] que você gastar: <ol><li>Lembrar um pouco de história, folclore ou fato natural</li><li>Lembrar algo bem específico para a tarefa em mãos</li><li>Realizar uma tarefa que requer uma habilidade esotérica</li><li>Recitar algo arcano ou mágico e poderoso</li></ol>",
					},
					{
						level: 2,
						name: "Estrategista",
						text: "Você percebe uma fraqueza momentânea em um inimigo. Descreva como vai explorá-la astutamente com seu ataque e modifique sua rolagem de ataque em até [SOMA]. Se acertar, adicione [DADOS] ao seu dano. Alternativamente, você pode Reagir para gritar instruções para uma amiga, que pode modificar suas rolagens de ataque e dano como acima.",
					},
					{
						level: 3,
						name: "Perspicácia",
						text: "Você pode rapidamente obter alguma informação oculta sobre uma pessoa ou criatura Por Perto. Durante um combate, isso conta como uma Reação. A profundidade da informação depende do número de [DADOS] que você gastar: <ol><li>Os PC, SALVAMENTO, Armadura e ataques dela</li><li>Vulnerabilidades, resistências e itens ocultos em sua posse</li><li>Feitiços conhecidos, habilidades especiais e Maldições</li><li>Um segredo pessoal, motivo oculto ou plano de ação</li></ol>",
					},
					{
						level: 4,
						name: "Invenção",
						text: "Você pode Gastar Tempo e rolar 4 Dados de Dom para criar uma invenção maravilhosa e útil. Pode ser uma ferramenta mecânica como uma arma de gancho, um planador, uma armadilha complexa ou um autômato mecânico. Alternativamente, você pode fazer um dispositivo que tenha o mesmo efeito de uma magia. Este dispositivo usa seus DD para funcionar. Você só pode criar e manter uma única invenção por vez. Elas são instáveis, precisam de ajustes constantes e só você pode usá-las. Se quiser criar uma nova, deve primeiro desmontar a antiga.",
					},
				],
				mishaps: [
					"Distraída: Você percebe que esqueceu algo sobre alguém próximo. Você quebrou uma promessa, esqueceu um aniversário ou ofendeu essa pessoa.",
					"Pensou Demais: Sofra d4 de dano.",
					"Esgotamento Mental: Os DD só retornam em um 1–2 até que você Gaste Tempo lendo. Isso inclui os dados que você acabou de rolar.",
					"Perplexa: Você fica Confusa até Gastar Tempo fazendo algo bobo.",
					"Maníaca: Você tem tantas boas ideias. Você fica Atordoada até Gastar Tempo escrevendo todas no seu diário.",
					"Conhecimento Oculto: Um encantamento que você leu em voz alta no passado se concretizou. Você sofre uma Maldição aleatória.",
				],
			},
			glimaura: {
				title: "Aura Cintilante",
				description:
					"Você tem esse brilho mágico ao seu redor. O apogeu do charme, seu fascínio irradia por toda parte. Seu coração está em sintonia com a beleza interior do mundo, permitindo que você desperte potenciais ocultos e ilumine sonhos.",
				talents: ["Etiqueta da Corte", "Poesia", "Arte Visual"],
				innate: [
					{
						name: "Como Você Deseja",
						text: "Você sempre parece radiante e positiva. Se ficar desarrumada ou suja, isso só a faz parecer robusta e charmosa. Quaisquer cicatrizes que você ganhe só aumentam seu mistério e apelo. Estranhos se encantam facilmente e oferecem a você pequenos favores e descontos de bom grado.",
					},
					{
						name: "Sensível",
						text: "Seus sentidos e sua intuição são extraordinariamente aguçados. Você tem vantagem em testes de ASTÚCIA para perceber pequenos detalhes. Se dormir em qualquer lugar que não seja uma cama confortável, teste DETERMINAÇÃO ou fique Cansada no dia seguinte.",
					},
				],
				special: [
					{
						level: 1,
						name: "Retoque Mágico",
						text: "Melhore a aparência e a qualidade geral de [SOMA] objetos ou [DADOS] criaturas dispostas. Você pode consertar um equipamento quebrado, ajudar uma desordeira a ficar apresentável para uma corte real, fazer um barraco parecer uma casinha aconchegante ou fazer uma velha relíquia enferrujada brilhar como nova para conseguir um preço melhor.",
					},
					{
						level: 2,
						name: "Brilho",
						text: "Infunda [DADOS] itens que você toca com sua aura cintilante, fazendo com que iluminem a área Por Perto até você Gastar Tempo. Alternativamente, você pode fazer o item liberar todo o seu brilho em um flash instantâneo, visível à distância e atordoando qualquer um que o veja Por Perto por [DADOS] rodadas.",
					},
					{
						level: 3,
						name: "Em Um Sonho",
						text: "Você aparece como uma visão no sonho de alguém. Pode escolher o cenário e o tom geral do sonho e agir como achar melhor, mas deve aparecer como você mesma. A quantidade de [DADOS] necessária depende da sua conexão com quem está sonhando. <ul><li>1 DD: Uma amiga ou familiar. Alguém com quem você tem uma conexão próxima.</li><li>2 DD: Uma conhecida — alguém com quem você já fez negócios, encontrou em um baile, etc.</li><li>3 DD: Alguém que já a viu ou ouviu sua voz.</li><li>4 DD: Alguém que você nunca conheceu.</li></ul>",
					},
					{
						level: 4,
						name: "Glamour",
						text: "Transforme magicamente [SOMA] objetos ou criaturas dispostas em versões melhoradas e fantásticas de si mesmas por [DADOS] horas. Objetos podem se tornar outros objetos (uma abóbora pode virar uma carruagem magnífica, um graveto pode virar uma espada de obra-prima). Você pode mudar as roupas, o penteado e o estilo das pessoas para combinar com qualquer ocasião. Animais podem se tornar outros animais, ou assumir forma humana, mas ainda manterão seus trejeitos originais sob um exame mais atento.",
					},
				],
				mishaps: [
					"Purpurina: Seu brilho natural é tão forte que você começa a soltar purpurina de verdade. É lindo, mas gruda em tudo.",
					"A Beleza Dói: Sofra d4 de dano.",
					"Esgotada: Sua bateria social se esgotou. Seus Dados de Dom só retornam em um 1–2 até você Gastar Tempo recarregando sozinha.",
					"Vaidade: Cheia de si. Fique Atordoada até fazer algo que a deixe mais humilde.",
					"Popular: Sofra a Maldição da Popularidade.",
					"A Mais Bela de Todas: Uma adversária poderosa, consumida pela inveja, começou a tramar contra você.",
				],
			},
				regpres: {
					title: "Presença Régia",
					description:
						"Você foi chamada para assumir o manto de suas ancestrais. A resiliência delas flui através de você enquanto canaliza sua força para inspirar os oprimidos e proteger o reino.",
					talents: ["Cura", "Equitação", "Etiqueta da Corte"],
					innate: [
						{
							name: "Majestosa",
							text: "Sua presença, seu comportamento e suas palavras inspiram esperança e admiração. Você tem vantagem em testes de GRAÇA para reunir pessoas à sua causa e inspirar esperança.",
						},
						{
							name: "Coração de Guerreira",
							text: "Você canaliza sua força interior diretamente através de suas mãos. Enquanto usa sua arma ancestral, você pode gastar um Dado Coração para adicionar dano aos seus ataques.",
						},
					],
					special: [
						{
							level: 1,
							name: "Buscar a Verdade",
							text: "[DADOS] criaturas fazem um SALVAMENTO ou respondem [SOMA] perguntas com sinceridade, até onde souberem. As respostas delas são relativas à ideia de verdade que elas têm.",
						},
						{
							level: 2,
							name: "Incitar",
							text: "Você dá um discurso empolgante às suas companheiras. Por [DADOS] rodadas, elas rolam um d4 extra ao causar dano em combate. Alternativamente, cada companheira pode recuperar [DADOS] Dados Coração, até seu máximo atual. Você pode fazer isso com antecedência, se tiver tempo para se preparar, ou usar sua Ação no meio de uma luta.",
						},
						{
							level: 3,
							name: "Corcel Fiel",
							text: "Você assobia alto para invocar um espírito feérico na forma de um cavalo majestoso, que vem em seu auxílio por [SOMA] horas. Ele é visivelmente mais rápido, ágil e belo do que um cavalo comum.",
						},
						{
							level: 4,
							name: "Poder Ancestral",
							text: "Você desperta o antigo poder de sua linhagem, canalizado através de sua arma ancestral. Ao erguer sua arma para o céu e falar palavras mágicas, sua presença se transforma por [SOMA] rodadas e você se torna uma versão ainda mais imponente de si mesma. Suas roupas, cabelo e aparência física ficam como você escolher. Sua arma brilha e irradia energia. A quantidade de [DADOS] que você rolar adiciona os seguintes efeitos cumulativos. <ul><li>1 DD: Seu valor de Armadura se torna 3 para todos os tipos de dano.</li><li>2 DD: Você pula duas vezes mais alto e ergue duas vezes mais peso do que normalmente consegue.</li><li>3 DD: Você e suas amigas Por Perto recuperam instantaneamente [DADOS] PC.</li><li>4 DD: Você pode realizar uma ação adicional a cada rodada.</li></ul>",
						},
					],
					mishaps: [
						"Agonia: Suas responsabilidades pesam sobre você, e isso está começando a aparecer em seu rosto. Você ganha uma cicatriz ou uma ruga no rosto, ou uma mecha do seu cabelo fica grisalha.",
						"Indignidade: Sofra d4 de dano, pois algo não saiu exatamente como planejado, de um jeito constrangedor.",
						"Sem Rumo: Os Dados de Dom só retornam em um 1–2 até você Gastar Tempo refletindo sobre suas ancestrais, seu papel como realeza e seu caminho adiante.",
						"Abatida: Fica Cansada até uma amiga gastar um Dado Coração para ajudá-la a ter sucesso em um Teste de Virtude.",
						"Desconfiada: Você está preocupada com ameaças constantes de usurpadoras contra você. Sofra a Maldição da Paranoia.",
						"Tribulação: Role na tabela de Ferimentos.",
					],
				},
			};

			// Find the data for the currently selected gift
			context.activeGift = context.giftData[context.giftChoice];

			context.princessThemeOptions = {
				default: "Rosa Perigos",
				market: "Dourado do Mercado",
				candy: "Roxo Doce",
				dragon: "Verde Dragão",
			};

			context.princessTheme = actorData.system.princessTheme.value;

			console.log("Princess Theme Options:", context.princessThemeOptions);
			console.log("Selected Princess Theme:", context.princessTheme);

			// Add a cssClass property based on the selected Princess Theme
			context.cssClass = actorData.system.princessTheme.value;
		}

		// Prepare NPC data and items.
		if (actorData.type == "npc") {
			this._prepareItems(context);
		}

		// Enrich biography info for display
		// Enrichment turns text like `[[/r 1d20]]` into buttons
		// context.enrichedBiography = await TextEditor.enrichHTML(
		// 	this.actor.system.biography,
		// 	{
		// 		// Whether to show secret blocks in the finished html
		// 		secrets: this.document.isOwner,
		// 		// Necessary in v11, can be removed in v12
		// 		async: true,
		// 		// Data to fill in for inline rolls
		// 		rollData: this.actor.getRollData(),
		// 		// Relative UUID resolution
		// 		relativeTo: this.actor,
		// 	}
		// );

		// Enriching each specific field

		// Prepare active effects
		context.effects = prepareActiveEffectCategories(
			// A generator that returns all effects stored on the actor
			// as well as any items
			this.actor.allApplicableEffects(),
		);

		// Use the new namespaced path for Foundry V13+ compatibility
		const enricher = foundry.applications.ux.TextEditor;

		// Enriching multiple editors simultaneously
		context.enriched = {
			talents: await enricher.enrichHTML(data.otherTalents || "", {
				async: true,
			}),
			appearances: await enricher.enrichHTML(data.appearance || "", {
				async: true,
			}),
			fairygodmother: await enricher.enrichHTML(data.fairyGodmother || "", {
				async: true,
			}),
			curses: await enricher.enrichHTML(data.cursesWounds || "", {
				async: true,
			}),
			que1: await enricher.enrichHTML(data.personalityQuestion1 || "", {
				async: true,
			}),
			que2: await enricher.enrichHTML(data.personalityQuestion2 || "", {
				async: true,
			}),
			que3: await enricher.enrichHTML(data.personalityQuestion3 || "", {
				async: true,
			}),
			que4: await enricher.enrichHTML(data.personalityQuestion4 || "", {
				async: true,
			}),
			notes: await enricher.enrichHTML(data.notes || "", {
				async: true,
			}),
		};

		return context;
	}

	/**
	 * Character-specific context modifications
	 *
	 * @param {object} context The context object to mutate
	 */
	_prepareCharacterData(context) {
		// This is where you can enrich character-specific editor fields
		// or setup anything else that's specific to this type
	}

	/**
	 * Organize and classify Items for Actor sheets.
	 *
	 * @param {object} context The context object to mutate
	 */
	_prepareItems(context) {
		// Initialize containers.
		const gear = [];
		const features = [];
		const spells = {
			0: [],
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
			6: [],
			7: [],
			8: [],
			9: [],
		};

		// Iterate through items, allocating to containers
		for (let i of context.items) {
			i.img = i.img || Item.DEFAULT_ICON;
			// Append to gear.
			if (i.type === "item") {
				gear.push(i);
			}
			// Append to features.
			else if (i.type === "feature") {
				features.push(i);
			}
			// Append to spells.
			else if (i.type === "spell") {
				if (i.system.spellLevel != undefined) {
					spells[i.system.spellLevel].push(i);
				}
			}
		}

		// Assign and return
		context.gear = gear;
		context.features = features;
		context.spells = spells;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Add this listener for the item images in your table
		html.find(".pp-item-roll-trigger").click((ev) => {
			// 1. Prevent the browser from doing anything else
			ev.preventDefault();
			ev.stopPropagation();
			ev.stopImmediatePropagation();

			// 2. Identify the item
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));

			// 3. Only trigger if the item exists.
			// Armas abrem direto o diálogo de ataque (Teste de Virtude + dano em
			// sequência); os demais itens seguem o fluxo normal de chat card.
			if (item) {
				if (item.type === "arma") this._onWeaponAttackDialog(item);
				else this._onItemChat(item);
			}

			return false; // Final insurance against double-triggering
		});

		// Render the item sheet for viewing/editing prior to the editable check.
		html.on("click", ".item-edit", (ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		html.find(".item-chat-trigger").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			this._onItemChat(item); // Call the helper function
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.on("click", ".item-create", this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.on("click", ".item-delete", (ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		// Active Effect management
		html.on("click", ".effect-control", (ev) => {
			const row = ev.currentTarget.closest("li");
			const document =
				row.dataset.parentId === this.actor.id
					? this.actor
					: this.actor.items.get(row.dataset.parentId);
			onManageActiveEffect(ev, document);
		});

		// Rollable abilities.
		html.on("click", ".rollable", this._onRoll.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}

		// Test Dice Rollers
		// Listen for clicks on our custom roll buttons
		html.find(".pp-roll-btn").click((ev) => {
			console.log("Button Clicked!");
			const type = ev.currentTarget.dataset.roll;

			if (type === "d20") {
				this._onRollD20Dialog();
			} else {
				this._onRollPoolDialog(type);
			}
		});

		// Virtue Roll Listener
		html.find(".pp-virtue-roll").click((ev) => {
			const label = ev.currentTarget.dataset.label;
			const targetValue = parseInt(ev.currentTarget.dataset.value);
			this._onVirtueRollDialog(label, targetValue);
		});
	}

	/**
	 * Retorna a classe CSS do tema atual da Princesa (default/market/candy/dragon),
	 * usada para colorir os diálogos de rolagem de acordo com o tema da ficha.
	 */
	_getThemeClass() {
		return this.actor.system?.princessTheme?.value || "default";
	}

	/* d20 Dialog */
	async _onRollD20Dialog() {
		new Dialog(
			{
				title: "Teste de Virtude: Rolagem de d20",
				content: `<p class="pp-text-center">Como você quer rolar o d20?</p>`,
				buttons: {
					adv: {
						label: "Vantagem",
						callback: () =>
							new Roll("2d20kl").toMessage({
								flavor:
									"<strong>Rolando com Vantagem</strong><br>Você usa o número <em>MAIS BAIXO</em> ao rolar com Vantagem.",
							}),
					},
					norm: {
						label: "Rolagem Normal",
						callback: () =>
							new Roll("1d20").toMessage({ flavor: "Rolagem Normal de d20" }),
					},
					dis: {
						label: "Desvantagem",
						callback: () =>
							new Roll("2d20kh").toMessage({
								flavor:
									"<strong>Rolando com Desvantagem</strong><br>Você usa o número <em>MAIS ALTO</em> ao rolar com Desvantagem.",
							}),
					},
				},
				default: "norm",
			},
			{ classes: ["dialog", "pp-dialog", this._getThemeClass()] },
		).render(true);
	}

	/* d4/d6 Dialog */
	async _onRollPoolDialog(die) {
		const dieLabel =
			die === "d6" ? "Dados de Dom" : die === "d4" ? "Dados Coração" : die;

		const dialogContent = `
    <form class="flex-col pp-text-center">
      <div class="form-group">
        <label>Quantidade de ${dieLabel} (${die}) para rolar:</label>
        <input type="number" id="dice-count" name="count" value="1" min="1" max="10" />
      </div>
    </form>`;

		new Dialog(
			{
				title: `Rolar ${dieLabel}`,
				content: dialogContent,
				buttons: {
					roll: {
						icon: '<i class="fas fa-dice"></i>',
						label: "Rolar",
						callback: (html) => {
							const count = html.find("#dice-count").val();
							new Roll(`${count}${die}`).toMessage({
								flavor: `Rolando ${count}${die} (${dieLabel})`,
							});
						},
					},
				},
				default: "roll",
			},
			{ classes: ["dialog", "pp-dialog", this._getThemeClass()] },
		).render(true);
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const data = foundry.utils.duplicate(header.dataset);
		const name = `New ${type.capitalize()}`;
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		delete itemData.system["type"];
		// return await Item.create(itemData, { parent: this.actor });
		setTimeout(async () => {
			await Item.create(itemData, { parent: this.actor });
		}, 0);
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType == "item") {
				const itemId = element.closest(".item").dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item) return item.roll();
			}
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `[ability] ${dataset.label}` : "";
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get("core", "rollMode"),
			});
			return roll;
		}
	}

	/**
	 * Virtue Roll Dialog: Prompt for Advantage/Disadvantage and check vs Stat
	 */
	async _onVirtueRollDialog(label, targetValue) {
		new Dialog(
			{
				title: `Teste de ${label}`,
				content: `<p class="pp-text-center">Testando <strong>${label}</strong> contra um valor de <strong>${targetValue}</strong>.</p>`,
				buttons: {
					adv: {
						label: "Vantagem",
						callback: () =>
							this._executeVirtueRoll("2d20kl", label, targetValue),
					},
					norm: {
						label: "Rolagem Normal",
						callback: () =>
							this._executeVirtueRoll("1d20", label, targetValue),
					},
					dis: {
						label: "Desvantagem",
						callback: () =>
							this._executeVirtueRoll("2d20kh", label, targetValue),
					},
				},
				default: "norm",
			},
			{ classes: ["dialog", "pp-dialog", this._getThemeClass()] },
		).render(true);
	}

	/**
	 * Execution function to handle the roll math and chat card
	 */
	async _executeVirtueRoll(formula, label, targetValue) {
		let roll = await new Roll(formula).roll({ async: true });
		const result = roll.total;

		// Perils & Princesses Success Logic: Equal to or Under the Stat
		const isSuccess = result <= targetValue;
		const resultText = isSuccess ? "Sucesso" : "Falha";
		const resultColor = isSuccess ? "#4a5d4e" : "#8e444a"; // Sage for Success, Rose for Failure

		// Create the Chat Card
		let messageContent = `
			<div class="pp-chat-card">
			<h3 class="pp-font-display">Teste de Virtude: ${label}</h3>
			<div class="result" style="color: ${resultColor};">
				${resultText}
			</div>
			</div>
		`;

		roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: messageContent,
		});
	}

	/**
	 * Abre o diálogo de ataque de uma Arma: testa a Virtude configurada na
	 * arma (Determinação por padrão) e, se for sucesso, rola o dano em
	 * seguida automaticamente.
	 */
	_onWeaponAttackDialog(item) {
		const virtueKey = item.system.virtudeAtaque || "resolve";
		const virtue = this.actor.system.virtues?.[virtueKey];
		const label = virtue?.label || virtueKey;
		const targetValue = virtue?.value ?? 8;

		new Dialog(
			{
				title: `Ataque: ${item.name}`,
				content: `<p class="pp-text-center">Testando <strong>${label}</strong> contra um valor de <strong>${targetValue}</strong> para atacar com <strong>${item.name}</strong>.</p>`,
				buttons: {
					adv: {
						label: "Vantagem",
						callback: () =>
							this._executeWeaponAttack("2d20kl", label, targetValue, item),
					},
					norm: {
						label: "Rolagem Normal",
						callback: () =>
							this._executeWeaponAttack("1d20", label, targetValue, item),
					},
					dis: {
						label: "Desvantagem",
						callback: () =>
							this._executeWeaponAttack("2d20kh", label, targetValue, item),
					},
				},
				default: "norm",
			},
			{ classes: ["dialog", "pp-dialog", this._getThemeClass()] },
		).render(true);
	}

	/**
	 * Executa o Teste de Virtude de ataque de uma Arma. Em caso de sucesso,
	 * rola o dano da arma automaticamente e posta os dois resultados no chat.
	 */
	async _executeWeaponAttack(formula, label, targetValue, item) {
		const roll = await new Roll(formula).roll({ async: true });
		const result = roll.total;

		const isSuccess = result <= targetValue;
		const resultText = isSuccess ? "Sucesso" : "Falha";
		const resultColor = isSuccess ? "#4a5d4e" : "#8e444a";

		const attackContent = `
			<div class="pp-chat-card">
			<h3 class="pp-font-display">Ataque: ${item.name}</h3>
			<div class="result" style="color: ${resultColor};">
				${resultText}
			</div>
			</div>
		`;

		await roll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: attackContent,
		});

		if (!isSuccess) return;

		const r = item.system.roll;
		const dNum = r.diceNum ?? 1;
		const dSize = r.diceSize || "d4";
		const dBonus = r.diceBonus ? ` + ${r.diceBonus}` : "";
		const dmgFormula = `${dNum}${dSize}${dBonus}`;

		const dmgRoll = await new Roll(dmgFormula).roll({ async: true });
		const dmgContent = `
			<div class="pp-chat-card">
			<h3 class="pp-font-display">Dano: ${item.name}</h3>
			</div>
		`;

		await dmgRoll.toMessage({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			flavor: dmgContent,
		});
	}

	// The helper function (within the ActorSheet class)
	async _onItemChat(item) {
		const r = item.system.roll;

		// Check if a roll should even exist.
		// If diceSize is null/empty, we skip the button entirely.
		const hasRoll = !!r.diceSize;

		// Use nullish coalescing (??) instead of (||).
		// (r.diceNum ?? 1) means: "If diceNum is null or undefined, use 1. If it's 0, use 0."
		const dNum = r.diceNum ?? 1;
		const dSize = r.diceSize || "";
		const dBonus = r.diceBonus ? ` + ${r.diceBonus}` : "";

		const formula = `${dNum}${dSize}${dBonus}`;

		// Conditional HTML: Only show the button if hasRoll is true
		const rollButtonHtml = hasRoll
			? `
      <button type="button" class="pp-chat-roll-btn">
        <i class="fas fa-dice-d20"></i> Rolar ${formula}
      </button>`
			: "";

		const chatContent = `
    <div class="pp-chat-card" data-item-uuid="${item.uuid}">
      <h3 class="pp-font-display" style="margin-bottom: 5px;">
        ${item.name}
      </h3>
      <div class="pp-font-main" style="margin-bottom: 10px;">
        ${item.system.description || ""}
      </div>
      ${rollButtonHtml}
    </div>`;

		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			content: chatContent,
		});
	}
}
