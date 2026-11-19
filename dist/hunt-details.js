// Escolhas obrigatórias de cada cartilha. Cada campo guarda só o nome curto da opção.
// type 'pick': escolha entre opções (min/max). named: cada opção marcada ganha um campo de texto.
// type 'text': resposta livre.
const o = (pt, en) => ({ pt, en });

export const huntDetails = {
  Arcano: [
    { key: 'spellBases', type: 'pick', min: 1, max: 3, label: o('Magia combativa: bases', 'Combat magic: bases'), hint: o('Três escolhas no total entre bases e efeitos, com pelo menos uma base.', 'Three picks in total across bases and effects, at least one base.'),
      options: [o('Explosão', 'Blast'), o('Bola', 'Ball'), o('Míssil', 'Missile'), o('Muralha', 'Wall')] },
    { key: 'spellEffects', type: 'pick', min: 0, max: 2, label: o('Magia combativa: efeitos', 'Combat magic: effects'),
      options: [o('Fogo', 'Fire'), o('Força ou vento', 'Force or wind'), o('Raio ou entropia', 'Lightning or entropy'), o('Frio ou gelo', 'Frost or ice'), o('Terra', 'Earth'), o('Necromântica', 'Necromantic')] },
    { key: 'droppedTool', type: 'pick', min: 1, max: 1, label: o('Ferramenta ou técnica que você dispensa', 'Tool or technique you can do without'), hint: o('Você precisa das outras três.', 'You need the other three.'),
      options: [o('Consumíveis', 'Consumables'), o('Focos', 'Focuses'), o('Gestos', 'Gestures'), o('Encantamentos', 'Incantations')] },
  ],
  Delinquente: [
    { key: 'background', type: 'pick', min: 1, max: 1, label: o('Antecedentes', 'Background'), hint: o('O que você fazia antes de caçar monstros?', 'What did you do before hunting monsters?'),
      options: [o('Capanga', 'Hard man'), o('Arrombador', 'Burglar'), o('Vigarista', 'Con man'), o('Intermediário', 'Fixer'), o('Assassino', 'Assassin'), o('Charlatão', 'Charlatan'), o('Punguista', 'Pickpocket')] },
    { key: 'heat', type: 'pick', min: 2, max: 5, named: true, namePlaceholder: o('Nome da pessoa', 'Their name'), label: o('Perseguição', 'Heat'), hint: o('Quem está atrás de você? Escolha pelo menos dois e dê nomes.', 'Who is after you? Pick at least two and name them.'),
      options: [o('Um investigador da polícia', 'A police investigator'), o('Um rival do passado', 'An old rival'), o('Um criminoso influente', 'A powerful criminal'), o('Alguém com poderes de quem você tirou vantagem', 'Someone with powers you took advantage of'), o('Um velho parceiro que você traiu', 'A former partner you betrayed')] },
    { key: 'underworld', type: 'pick', min: 1, max: 1, named: true, namePlaceholder: o('Qual criatura?', 'Which creature?'), label: o('Submundo', 'Underworld'), hint: o('Como você descobriu o submundo real?', 'How did you find out about the real underworld?'),
      options: [o('O alvo de um trabalho era uma criatura perigosa', 'A job target was a dangerous creature'), o('Você trabalhou com alguém que era mais do que parecia', 'You worked with someone who was more than they seemed'), o('Você foi contratado por alguma coisa estranha', 'You were hired by something strange'), o('Um trabalho deu errado', 'A job went wrong')] },
  ],
  Divino: [
    { key: 'mission', type: 'pick', min: 1, max: 1, named: true, namePlaceholder: o('Detalhes', 'Details'), label: o('Missão', 'Mission'), hint: o('Por que você foi colocado na Terra?', 'Why were you put on Earth?'),
      options: [o('Combater os planos do Adversário', 'Fight the schemes of the Adversary'), o('Guiar os caçadores para impedir o Fim dos Dias', 'Guide the hunters to prevent the End Times'), o('Guiar os caçadores para garantir o Fim dos Dias', 'Guide the hunters to bring about the End Times'), o('Exilado, servindo ao Bem às escondidas', 'Exiled, serving Good in secret'), o('Preparar e proteger um dos caçadores', 'Prepare and protect one of the hunters')] },
  ],
  Escolhido: [
    { key: 'discovery', type: 'pick', min: 1, max: 1, label: o('Como você descobriu sua sina', 'How you found your fate'),
      options: [o('Pesadelos e visões', 'Nightmares and visions'), o('Algum maluco te contou', 'Some crazy person told you'), o('Um culto antigo encontrou você', 'An ancient cult found you'), o('Descoberto pelo seu arqui-inimigo', 'Discovered by your nemesis'), o('Atacado por monstros', 'Attacked by monsters'), o('Treinado desde o nascimento', 'Trained from birth'), o('Você encontrou a profecia', 'You found the prophecy')] },
    { key: 'heroic', type: 'pick', min: 2, max: 2, label: o('Sina: heroísmo', 'Fate: heroic'),
      options: [o('Sacrifício', 'Sacrifice'), o('Você é o Campeão', 'You are the Champion'), o('Visões', 'Visions'), o('Treinamento secreto', 'Secret training'), o('Poderes mágicos', 'Magical powers'), o('Herança mística', 'Mystical inheritance'), o('Uma vida normal', 'A normal life'), o('Amor verdadeiro', 'True love'), o('Você pode salvar o mundo', 'You can save the world'), o('Aliados ocultos', 'Hidden allies'), o('O fim dos monstros', 'The end of monsters'), o('Ajuda divina', 'Divine help')] },
    { key: 'doom', type: 'pick', min: 2, max: 2, label: o('Sina: perdição', 'Fate: doom'),
      options: [o('Morte', 'Death'), o('Você não pode salvar todos', "You can't save everyone"), o('Amor impossível', 'Impossible love'), o('Fracasso', 'Failure'), o('Um arqui-inimigo', 'A nemesis'), o('Nenhuma vida normal', 'No normal life'), o('Perda de entes queridos', 'Loss of loved ones'), o('Traição', 'Betrayal'), o('Dúvida', 'Doubt'), o('Compaixão pelo inimigo', 'Sympathy for the enemy'), o('Danação', 'Damnation'), o('Exércitos de monstros', 'Monster armies'), o('O fim dos dias', 'The end of days'), o('A fonte do Mal', 'The source of Evil')] },
    { key: 'weaponBase', type: 'pick', min: 1, max: 1, label: o('Arma especial: base', 'Special weapon: base'),
      options: [o('Bastão', 'Staff'), o('Cabo', 'Haft'), o('Punho', 'Handle'), o('Corrente', 'Chain')] },
    { key: 'weaponParts', type: 'pick', min: 3, max: 3, label: o('Arma especial: parte funcional', 'Special weapon: business end'),
      options: [o('Artefato', 'Artifact'), o('Espinhos', 'Spikes'), o('Lâmina', 'Blade'), o('Pesada', 'Heavy'), o('Longa', 'Long'), o('Arremessável', 'Throwable'), o('Corrente', 'Chain')] },
    { key: 'weaponMaterial', type: 'text', label: o('Arma especial: material', 'Special weapon: material'), placeholder: o('Aço, ferro puro, prata, madeira, osso…', 'Steel, cold iron, silver, wood, bone…') },
  ],
  Especialista: [
    { key: 'haven', type: 'pick', min: 3, max: 3, label: o('Refúgio', 'Haven'), hint: o('Escolha três instalações do seu local seguro.', 'Pick three features of your safe place.'),
      options: [o('Biblioteca erudita', 'Lore library'), o('Biblioteca mística', 'Mystical library'), o('Feitiços de proteção', 'Protection spells'), o('Arsenal', 'Armory'), o('Enfermaria', 'Infirmary'), o('Oficina', 'Workshop'), o('Calabouço', 'Oubliette'), o('Quarto do pânico', 'Panic room'), o('Laboratório de magia', 'Magical laboratory')] },
  ],
  Iniciado: [
    { key: 'sect', type: 'text', label: o('Seita', 'Sect'), placeholder: o('De onde ela é? Quão antiga? É religiosa? Por que é secreta? Como recruta?', 'Where is it from? How old? Religious? Why secret? How does it recruit?') },
    { key: 'goodTraditions', type: 'pick', min: 2, max: 2, label: o('Tradições boas', 'Good traditions'),
      options: [o('Bem informada', 'Well informed'), o('Conhecimento antigo', 'Ancient lore'), o('Conhecimento mágico', 'Magical lore'), o('Artes marciais', 'Martial arts'), o('Filiais por toda parte', 'Branches everywhere'), o('Influência civil', 'Civil influence'), o('Táticas flexíveis', 'Flexible tactics'), o('Modernizada', 'Modernised'), o('Integrada na sociedade', 'Integrated in society'), o('Hierarquia aberta', 'Open hierarchy'), o('Ricos', 'Wealthy'), o('Dispositivos engenhosos', 'Clever gadgets'), o('Itens mágicos', 'Magical items')] },
    { key: 'badTraditions', type: 'pick', min: 1, max: 1, label: o('Tradição ruim', 'Bad tradition'),
      options: [o('Motivos duvidosos', 'Dubious motives'), o('Conservadora', 'Conservative'), o('Falta de visão', 'Shortsighted'), o('Paranoica e reservada', 'Paranoid and secretive'), o('Hierarquia fechada', 'Closed hierarchy'), o('Dividida em facções', 'Factional'), o('Leis rígidas', 'Strict rules'), o('Juramentos místicos', 'Mystical oaths'), o('Obediência total', 'Total obedience'), o('Líderes tirânicos', 'Tyrannical leaders'), o('Equipamentos obsoletos', 'Obsolete gear'), o('Pobres', 'Poor')] },
  ],
  Injustiçado: [
    { key: 'lost', type: 'pick', min: 1, max: 5, named: true, namePlaceholder: o('Nome(s)', 'Name(s)'), label: o('Quem você perdeu', 'Who you lost'),
      options: [o('Pai e/ou mãe', 'Parent(s)'), o('Irmão(s)', 'Sibling(s)'), o('Esposo(a) ou parceiro(a)', 'Spouse or partner'), o('Filho(s)', 'Child(ren)'), o('Melhor(es) amigo(s)', 'Best friend(s)')] },
    { key: 'prey', type: 'text', label: o('Minha presa', 'My prey'), placeholder: o('A raça de monstro que causou a perda (combine com o Guardião).', 'The monster breed that caused it (agree with the Keeper).') },
    { key: 'failure', type: 'pick', min: 1, max: 8, label: o('Por que você não pôde salvá-los', "Why you couldn't save them"),
      options: [o('Ausente', 'Absent'), o('Egoísta', 'Selfish'), o('Ferido', 'Hurt'), o('Fraco', 'Weak'), o('Lento', 'Slow'), o('Assustado', 'Scared'), o('Incrédulo', 'In denial'), o('Conivente', 'Complicit')] },
  ],
  Lunático: [
    { key: 'theories', type: 'text', label: o('Teorias e conexões', 'Theories and connections'), placeholder: o('No que você acredita e como tudo se liga?', 'What do you believe and how does it all connect?') },
  ],
  Monstruoso: [
    { key: 'breed', type: 'text', label: o('Raça monstruosa', 'Monster breed'), placeholder: o('Vampiro, lobisomem, fantasma, fada, demônio…', 'Vampire, werewolf, ghost, fairy, demon…') },
    { key: 'origin', type: 'pick', min: 1, max: 1, label: o('Origem', 'Origin'),
      options: [o('Sempre foi assim', 'Always been this way'), o('Era humano e foi transformado', 'Was human and got changed')] },
    { key: 'side', type: 'pick', min: 1, max: 1, label: o('Lado', 'Side'),
      options: [o('Sempre lutou pelo bem', 'Always fought for good'), o('Era mau e mudou de lado', 'Was evil and switched sides')] },
    { key: 'curse', type: 'pick', min: 1, max: 1, named: true, namePlaceholder: o('Substância, emoção ou mestre', 'Substance, drive or master'), label: o('Maldição', 'Curse'),
      options: [o('Alimentação', 'Feed'), o('Vulnerabilidade', 'Vulnerability'), o('Puro impulso', 'Pure drive'), o('Mestre sombrio', 'Dark master')] },
    { key: 'attackBases', type: 'pick', min: 1, max: 2, label: o('Ataques naturais: bases', 'Natural attacks: bases'), hint: o('Uma base com um extra, ou duas bases.', 'One base plus an extra, or two bases.'),
      options: [o('Dentes', 'Teeth'), o('Garras', 'Claws'), o('Força mágica', 'Magical force'), o('Drenagem vital', 'Life-drain')] },
    { key: 'attackExtra', type: 'pick', min: 0, max: 1, named: true, namePlaceholder: o('Em qual base?', 'On which base?'), label: o('Ataques naturais: extra', 'Natural attacks: extra'),
      options: [o('+1 de dano', '+1 harm'), o('Ignora armadura', 'Ignore-armour'), o('Alcance extra', 'Extra range')] },
  ],
  Mundano: [
    { key: 'normalLife', type: 'text', label: o('Vida normal', 'Normal life'), placeholder: o('Trabalho, família, amigos: o que te prende ao mundo comum?', 'Job, family, friends: what ties you to ordinary life?') },
  ],
  Profissional: [
    { key: 'agency', type: 'text', label: o('Agência', 'Agency'), placeholder: o('Para quem você trabalha e qual o objetivo deles?', 'Who do you work for and what is their goal?') },
    { key: 'resources', type: 'pick', min: 2, max: 2, label: o('Recursos da Agência', 'Agency resources'),
      options: [o('Bem armada', 'Well armed'), o('Bem financiada', 'Well funded'), o('Treinamento rigoroso', 'Rigorous training'), o('Processos oficiais', 'Official processes'), o('Identidades secretas', 'Secret identities'), o('Escritórios por toda parte', 'Offices everywhere'), o('Boas informações', 'Good intelligence'), o('Autoridade reconhecida', 'Recognised authority'), o('Dispositivos tecnológicos', 'Tech gadgets'), o('Equipes de apoio', 'Support teams')] },
    { key: 'redTape', type: 'pick', min: 2, max: 2, label: o('Burocracia da Agência', 'Agency red tape'),
      options: [o('Motivos duvidosos', 'Dubious motives'), o('Burocrática', 'Bureaucratic'), o('Hierarquia sigilosa', 'Secret hierarchy'), o('Missões enigmáticas', 'Enigmatic missions'), o('Superiores hostis', 'Hostile superiors'), o('Rivalidade entre departamentos', 'Interdepartmental rivalry'), o('Cortes de fundos', 'Funding cuts'), o('Não faz prisioneiros', 'Takes no prisoners'), o('Captura alvos vivos', 'Captures targets alive')] },
  ],
  Sinistro: [
    { key: 'darkSide', type: 'pick', min: 3, max: 3, label: o('Lado sombrio', 'Dark side'), hint: o('O Guardião usa estas marcas para pedir coisas desagradáveis.', 'The Keeper uses these tags to ask for unpleasant things.'),
      options: [o('Violência', 'Violence'), o('Depressão', 'Depression'), o('Segredos', 'Secrets'), o('Luxúria', 'Lust'), o('Barganha sombria', 'Dark bargain'), o('Culpa', 'Guilt'), o('Sem alma', 'Soulless'), o('Vício', 'Addiction'), o('Alterações de humor', 'Mood swings'), o('Fúria', 'Rage'), o('Autodestruição', 'Self-destruction'), o('Pouco autocontrole', 'Poor self-control'), o('Desejo de poder', 'Lust for power'), o('Alucinações', 'Hallucinations'), o('Dor', 'Pain'), o('Paranoia', 'Paranoia')] },
  ],
  Viajante: [
    { key: 'transport', type: 'pick', min: 1, max: 1, label: o('Meio de transporte', 'Means of travel'),
      options: [o('É maior por dentro', 'Bigger on the inside'), o('Teletransporte', 'Teleport'), o('88 milhas por hora', '88 miles per hour'), o('Portal temporal', 'Time portal')] },
  ],
};
