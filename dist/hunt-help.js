// Explicações curtas (resumidas, não copiadas) para os detalhes da caçada.
// about: o que é o campo. options: efeito de cada opção, pela chave em português.
const o = (pt, en) => ({ pt, en });

export const huntHelp = {
  Arcano: {
    spellBases: { about: o('Feitiços de ataque que você usa como arma: ao partir pra porrada com eles, role +Estranheza em vez de +Braveza. A base define a forma do feitiço.', 'Attack spells you use as weapons: roll +Weird instead of +Tough when you kick ass with them. The base sets the shape of the spell.'),
      options: { 'Explosão': o('2 de dano, perto.', '2-harm, close.'), 'Bola': o('1 de dano, perto, em área.', '1-harm, close, area.'), 'Míssil': o('1 de dano, longe.', '1-harm, far.'), 'Muralha': o('1 de dano, perto, vira barreira com 1 de armadura.', '1-harm, close, a barrier with 1-armour.') } },
    spellEffects: { about: o('Efeitos combinam com qualquer base e mudam o dano ou acrescentam marcas.', 'Effects combine with any base and change harm or add tags.'),
      options: { 'Fogo': o('+2 de dano e fogo, que pode se espalhar.', '+2 harm and fire, which may spread.'), 'Força ou vento': o('+1 de dano e empurrão, ou +1 de armadura numa muralha.', '+1 harm and forceful, or +1 armour on a wall.'), 'Raio ou entropia': o('+1 de dano e brutal.', '+1 harm and messy.'), 'Frio ou gelo': o('+1 de dano e restritiva, ou −1 de dano e +2 de armadura numa muralha.', '+1 harm and restraining, or −1 harm and +2 armour on a wall.'), 'Terra': o('Empurrão e restritiva.', 'Forceful and restraining.'), 'Necromântica': o('Drena vida.', 'Life-drain.') } },
    droppedTool: { about: o('Sua magia depende de ferramentas e técnicas. Escolha a única que você dispensa: faltar qualquer uma das outras traz complicações.', 'Your magic depends on tools and techniques. Pick the one you can do without: missing any of the others causes trouble.'),
      options: { 'Consumíveis': o('Pós e óleos gastos a cada feitiço. Sem eles, o feitiço fere você.', 'Powders and oils used up per spell. Without them, the spell hurts you.'), 'Focos': o('Varinhas, cajados e afins. Sem eles, −1 de dano.', 'Wands, staves and the like. Without them, −1 harm.'), 'Gestos': o('Mãos livres para gesticular. Preso, −1 na magia combativa.', 'Free hands to gesture. Restrained, −1 to combat magic.'), 'Encantamentos': o('Palavras místicas em voz alta. Calado, age sob pressão para não se desorientar.', 'Mystic words spoken aloud. Silenced, act under pressure to stay clear-headed.') } },
  },
  Delinquente: {
    background: { about: o('O que você fazia fora da lei antes de caçar monstros. Cada antecedente dá uma vantagem própria.', 'What you did outside the law before hunting monsters. Each background gives its own edge.'),
      options: { 'Capanga': o('Manipula com ameaças de violência rolando +Braveza.', 'Manipulate with threats of violence using +Tough.'), 'Arrombador': o('Invade lugares protegidos rolando +Esperteza.', 'Break into secured places with +Sharp.'), 'Vigarista': o('Ao manipular, pergunta ao Guardião o que convence a pessoa.', 'When manipulating, ask the Keeper what would convince them.'), 'Intermediário': o('Compra, vende ou arranja coisas rolando +Sutileza.', 'Buy, sell or arrange things with +Cool.'), 'Assassino': o('+2 de dano no primeiro tiro em um alvo desatento.', '+2 harm on the first shot at an unaware target.'), 'Charlatão': o('Engana plateias com truques de mágica rolando +Firmeza.', 'Fool crowds with magic tricks using +Charm.'), 'Punguista': o('Furta coisas pequenas rolando +Sutileza.', 'Steal small things with +Cool.') } },
    heat: { about: o('Inimigos que você fez na vida do crime. Quando você marca Sorte, alguém do seu passado volta à sua vida.', 'Enemies you made in the criminal life. When you mark Luck, someone from your past shows up again.') },
    underworld: { about: o('Como você descobriu que monstros e magia existem. Pense nisso ao escolher seus movimentos.', 'How you found out monsters and magic are real. Keep it in mind when picking moves.'),
      options: { 'O alvo de um trabalho era uma criatura perigosa': o('Vampiro, lobisomem, troll ou reptiliano.', 'Vampire, werewolf, troll or reptilian.'), 'Você trabalhou com alguém que era mais do que parecia': o('Feiticeiro, demônio, fada ou médium.', 'Sorcerer, demon, fairy or psychic.'), 'Você foi contratado por alguma coisa estranha': o('Imortal, deus, extradimensional ou bruxa.', 'Immortal, god, extradimensional or witch.'), 'Um trabalho deu errado': o('Goblins, carniçais, devorador de sonhos ou salamandra de fogo.', 'Goblins, ghouls, a dream-eater or a fire salamander.') } },
  },
  Divino: {
    mission: { about: o('O propósito pelo qual você foi enviado à Terra. Ele orienta o que seus Superiores pedem de você.', 'The purpose you were sent to Earth for. It shapes what your Superiors ask of you.') },
  },
  Escolhido: {
    discovery: { about: o('A sina é o destino que espera por você, e você decide como ele se desenrola. Primeiro: como você ficou sabendo dela?', 'Your fate is the destiny waiting for you, and you decide how it unfolds. First: how did you learn about it?') },
    heroic: { about: o('O lado heroico da sua sina. Sempre que você marca Sorte, o Guardião coloca algo da sua sina no seu caminho, usando estas marcas e as de perdição. Marcas contraditórias tudo bem: a sina puxa para os dois lados.', 'The heroic side of your fate. Whenever you mark Luck, the Keeper puts something from your fate in your path, using these and the doom tags. Contradicting tags are fine: fate pulls both ways.') },
    doom: { about: o('O lado sombrio da sua sina: o que pode dar terrivelmente errado no seu destino.', 'The dark side of your fate: what could go terribly wrong.') },
    weaponBase: { about: o('Sua arma especial tem uma base, três partes funcionais e um material. Exemplo: espada mágica = punho + lâmina + longa + artefato.', 'Your special weapon has a base, three business-end parts and a material. Example: magic sword = handle + blade + long + artifact.'),
      options: { 'Bastão': o('1 de dano, contato ou perto.', '1-harm, hand/close.'), 'Cabo': o('2 de dano, contato, pesada.', '2-harm, hand, heavy.'), 'Punho': o('1 de dano, contato, balanceada.', '1-harm, hand, balanced.'), 'Corrente': o('1 de dano, contato, área.', '1-harm, hand, area.') } },
    weaponParts: { about: o('As partes se somam às marcas da base.', 'Parts add to the base tags.'),
      options: { 'Artefato': o('Mágica.', 'Magic.'), 'Espinhos': o('+1 de dano e brutal.', '+1 harm and messy.'), 'Lâmina': o('+1 de dano.', '+1 harm.'), 'Pesada': o('+1 de dano.', '+1 harm.'), 'Longa': o('Alcance perto.', 'Close range.'), 'Arremessável': o('Alcance perto.', 'Close range.'), 'Corrente': o('Área.', 'Area.') } },
    weaponMaterial: { about: o('Do que é feita a parte funcional. Alguns monstros são vulneráveis a materiais específicos.', 'What the business end is made of. Some monsters are vulnerable to specific materials.') },
  },
  Especialista: {
    haven: { about: o('Seu local seguro de trabalho. Cada instalação dá um benefício.', 'Your safe place to work. Each feature gives a benefit.'),
      options: { 'Biblioteca erudita': o('+1 adiante para investigar quando pesquisa nos livros.', '+1 forward to investigate when you hit the books.'), 'Biblioteca mística': o('+1 adiante para usar magia quando se prepara com os grimórios.', '+1 forward to use magic when you prepare with your tomes.'), 'Feitiços de proteção': o('Monstros não entram, a não ser com muito esforço.', 'Monsters can’t get in without serious effort.'), 'Arsenal': o('Role +Estranheza para ter a arma especial de que precisa.', 'Roll +Weird to have the special weapon you need.'), 'Enfermaria': o('Cura pessoas e abriga uma ou duas em recuperação.', 'Heal people and house one or two while they recover.'), 'Oficina': o('Constrói e conserta armas, carros e aparelhos.', 'Build and repair weapons, cars and gadgets.'), 'Calabouço': o('O que fica preso aqui não sai, não é encontrado e não faz magia.', 'What you lock here can’t leave, be found or use magic.'), 'Quarto do pânico': o('Esconderijo protegido para passar alguns dias.', 'A protected hideout for a few days.'), 'Laboratório de magia': o('Ingredientes e ferramentas para lançar feitiços.', 'Ingredients and tools for casting spells.') } },
  },
  Iniciado: {
    sect: { about: o('Você faz parte de uma ordem antiga e secreta que destrói monstros. O Guardião usa as tradições para decidir como a Seita age.', 'You belong to an ancient secret order that destroys monsters. The Keeper uses its traditions to decide how the Sect acts.') },
    goodTraditions: { about: o('Os pontos fortes da Seita.', 'The Sect’s strengths.') },
    badTraditions: { about: o('O defeito da Seita, que vai trazer problemas.', 'The Sect’s flaw, which will cause trouble.') },
  },
  Injustiçado: {
    lost: { about: o('Um monstro tirou alguém de você. É por isso que você caça.', 'A monster took someone from you. That is why you hunt.') },
    prey: { about: o('A raça do monstro que causou a perda. Você recebe +1 constante ao investigar, perseguir ou lutar contra ela.', 'The breed of monster behind your loss. You get +1 ongoing when investigating, chasing or fighting it.') },
    failure: { about: o('Por que você não conseguiu salvá-los. Pode escolher mais de um.', 'Why you couldn’t save them. You can pick more than one.') },
  },
  Monstruoso: {
    breed: { about: o('Você é meio humano e meio monstro. Sua maldição, seus ataques naturais e seus movimentos definem a sua raça.', 'You are half human, half monster. Your curse, natural attacks and moves define your breed.') },
    curse: { about: o('O preço de ser um monstro.', 'The price of being a monster.'),
      options: { 'Alimentação': o('Precisa se alimentar de pessoas vivas; age sob pressão para resistir.', 'You must feed on living people; act under pressure to resist.'), 'Vulnerabilidade': o('Uma substância causa +1 de dano em você e atrapalha seus poderes.', 'A substance deals you +1 harm and hinders your powers.'), 'Puro impulso': o('Uma emoção domina você e precisa ser satisfeita.', 'An emotion rules you and must be satisfied.'), 'Mestre sombrio': o('Um senhor do mal ainda dá ordens e não aceita recusa.', 'An evil master still gives orders and won’t take no.') } },
    attackBases: { about: o('Suas armas naturais: uma base com um extra, ou duas bases.', 'Your natural weapons: one base with an extra, or two bases.'),
      options: { 'Dentes': o('3 de dano, pessoal.', '3-harm, intimate.'), 'Garras': o('2 de dano, contato.', '2-harm, hand.'), 'Força mágica': o('1 de dano, perto, mágica.', '1-harm, close, magic.'), 'Drenagem vital': o('1 de dano, pessoal, drena vida.', '1-harm, intimate, life-drain.') } },
    attackExtra: { options: { 'Alcance extra': o('Pessoal, contato ou perto.', 'Intimate, hand or close.') } },
  },
  Profissional: {
    agency: { about: o('Para quem você trabalha e o que eles querem. Os recursos ajudam; a burocracia atrapalha.', 'Who you work for and what they want. Resources help; red tape gets in the way.') },
  },
  Sinistro: {
    darkSide: { about: o('Seus poderes vêm de uma fonte perturbadora. O Guardião pode pedir coisas desagradáveis ligadas a estas marcas: obedeça e marque experiência; recuse e fique sem poderes até o fim do mistério.', 'Your powers come from a disturbing source. The Keeper may ask for unpleasant things tied to these tags: obey and mark experience; refuse and lose your powers until the mystery ends.') },
  },
  Viajante: {
    transport: { about: o('Como você viaja pelo tempo e pelo espaço. Ao viajar, role +Esperteza.', 'How you travel through time and space. When you travel, roll +Sharp.'),
      options: { 'É maior por dentro': o('Pequena por fora, enorme por dentro; não pode ser rastreada, mas não se move como veículo.', 'Small outside, huge inside; can’t be tracked, but doesn’t move like a vehicle.'), 'Teletransporte': o('Instantâneo para onde você vê ou conhece bem; senão, horas de cálculo.', 'Instant to places you can see or know well; otherwise hours of plotting.'), '88 milhas por hora': o('Parece um carro comum; precisa de combustível e estrada.', 'Looks like a normal car; needs fuel and roads.'), 'Portal temporal': o('Um portal por vez, que qualquer um pode atravessar.', 'One portal at a time, which anyone can walk through.') } },
  },
};
