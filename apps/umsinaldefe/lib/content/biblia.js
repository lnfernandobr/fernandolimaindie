/**
 * Pilar "Bíblia": páginas de "Versículos sobre <tema>".
 *
 * São coleções temáticas de versículos, o formato de maior tráfego de busca
 * em português (ex.: "versículos sobre amor" ~33k/mês, "casamento" ~22k,
 * "família" ~10k). Cada tema vira uma página em /biblia/<slug>.
 *
 * Regras de edição (iguais ao resto do site):
 *   - Português do Brasil, caloroso e simples.
 *   - Sem travessão. Vírgula, ponto, parênteses ou dois-pontos.
 *   - Answer-first: `answer` resolve a busca em 1 a 3 linhas.
 *   - Versículos conferidos, em tradução de uso comum no Brasil.
 */

const v = (ref, text) => ({ ref, text });

const TOPICS = [
  {
    slug: 'amor',
    intent: 'family',
    tag: 'Amor',
    title: 'Versículos sobre o amor: o que a Bíblia diz',
    answer:
      'A Bíblia fala do amor como paciência, bondade e entrega, não como um sentimento passageiro. O capítulo mais conhecido é 1 Coríntios 13, mas há versículos sobre o amor a Deus, ao próximo e dentro da família espalhados por toda a Escritura.',
    summary:
      'Uma seleção de versículos sobre o amor: o amor de Deus por nós, o amor ao próximo e o amor que sustenta os relacionamentos.',
    verses: [
      v('1 Coríntios 13, 4-5', 'O amor é paciente, o amor é bondoso. Não inveja, não se orgulha, não busca os seus interesses, não se irrita.'),
      v('1 Coríntios 13, 7', 'Tudo desculpa, tudo crê, tudo espera, tudo suporta.'),
      v('João 13, 34', 'Um novo mandamento vos dou: que vos ameis uns aos outros. Como eu vos amei, amai-vos também uns aos outros.'),
      v('1 João 4, 8', 'Aquele que não ama não conheceu a Deus, porque Deus é amor.'),
      v('1 João 4, 19', 'Nós amamos porque ele nos amou primeiro.'),
      v('Colossenses 3, 14', 'Acima de tudo, revesti-vos do amor, que é o vínculo da perfeição.'),
      v('1 Pedro 4, 8', 'Tende, antes de tudo, intenso amor uns para com os outros, pois o amor cobre uma multidão de faltas.'),
      v('Romanos 13, 10', 'O amor não faz mal ao próximo. O amor, portanto, é o cumprimento da lei.'),
    ],
    reflectionHtml: `<p>Quando a Bíblia fala de amor, quase nunca está falando de um sentimento que vai e volta. Está falando de uma decisão diária: ter paciência, ser bondoso, não guardar rancor. Por isso 1 Coríntios 13 é lido em tantos casamentos. Não é poesia romântica, é um manual de como amar gente de verdade, com defeitos e dias ruins.</p>
    <p>Se você procura um versículo pra dedicar a alguém ou pra rezar pensando em quem ama, comece por um só. Leia devagar, deixe a frase descer, e veja como ela cabe na sua vida hoje.</p>
    <p>Se o que você busca é o amor de Deus por você, veja a página de <a href="/biblia/amor-de-deus">versículos sobre o amor de Deus</a>.</p>`,
    faq: [
      {
        question: 'Qual o versículo mais conhecido sobre o amor?',
        answer:
          'Provavelmente 1 Coríntios 13, 4: "O amor é paciente, o amor é bondoso". É o capítulo lido em muitos casamentos e o resumo bíblico do que é amar de verdade.',
      },
      {
        question: 'O que a Bíblia diz que é o amor?',
        answer:
          'Que o amor é paciente, bondoso, não invejoso nem orgulhoso, e que tudo suporta (1 Coríntios 13). A Bíblia também diz que "Deus é amor" (1 João 4, 8).',
      },
    ],
  },
  {
    slug: 'amor-de-deus',
    intent: 'faith',
    tag: 'Amor de Deus',
    title: 'Versículos sobre o amor de Deus',
    answer:
      'O amor de Deus na Bíblia é incondicional e eterno, e a sua maior prova é Jesus: "Deus amou o mundo de tal maneira que deu o seu Filho" (João 3, 16). Aqui estão os versículos mais marcantes sobre o amor de Deus por você.',
    summary:
      'Versículos sobre o amor de Deus por nós: incondicional, eterno e provado em Cristo. Pra lembrar que nada pode separar você desse amor.',
    verses: [
      v('João 3, 16', 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.'),
      v('Romanos 5, 8', 'Mas Deus prova o seu amor para conosco: Cristo morreu por nós quando ainda éramos pecadores.'),
      v('Romanos 8, 38-39', 'Tenho certeza de que nem a morte, nem a vida, nem coisa alguma na criação poderá nos separar do amor de Deus, que está em Cristo Jesus, nosso Senhor.'),
      v('1 João 4, 9-10', 'Nisto se manifestou o amor de Deus: em que enviou o seu Filho ao mundo para que por ele vivamos. Nisto está o amor: não em que nós tenhamos amado a Deus, mas em que ele nos amou primeiro.'),
      v('1 João 4, 16', 'Nós conhecemos e cremos no amor que Deus nos tem. Deus é amor, e quem permanece no amor permanece em Deus.'),
      v('Jeremias 31, 3', 'Com amor eterno eu te amei; por isso, com bondade, eu te atraí.'),
      v('Efésios 2, 4-5', 'Mas Deus, rico em misericórdia, pelo grande amor com que nos amou, deu-nos vida juntamente com Cristo.'),
      v('Sofonias 3, 17', 'O Senhor, teu Deus, está no meio de ti; ele se alegra em ti com grande alegria.'),
      v('Salmo 136, 26', 'Dai graças ao Deus dos céus, porque o seu amor dura para sempre.'),
    ],
    reflectionHtml: `<p>Tem dia em que a gente duvida de ser amado, por Deus ou por quem quer que seja. A Bíblia responde a essa dúvida do jeito mais concreto possível: o amor de Deus não é uma frase bonita, é uma entrega. "Deus prova o seu amor: Cristo morreu por nós quando ainda éramos pecadores" (Romanos 5, 8). Não foi um amor merecido, foi um amor primeiro.</p>
    <p>O versículo mais conhecido sobre isso é João 3, 16, decorado por gerações. Mas talvez o mais consolador seja Romanos 8: nada, nem a morte, nem os seus piores dias, te separa desse amor. Se você está num momento difícil, leia esse devagar.</p>
    <p>Se procura também versículos sobre amar as pessoas, veja a página de <a href="/biblia/amor">versículos sobre o amor</a>.</p>`,
    faq: [
      {
        question: 'Qual o maior versículo sobre o amor de Deus?',
        answer:
          'João 3, 16: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito". É o versículo mais conhecido sobre o amor de Deus pela humanidade.',
      },
      {
        question: 'O amor de Deus é incondicional?',
        answer:
          'A Bíblia diz que sim. Romanos 5, 8 mostra que Deus amou e entregou Cristo por nós quando ainda éramos pecadores, ou seja, antes de qualquer mérito nosso.',
      },
      {
        question: 'O que pode nos separar do amor de Deus?',
        answer:
          'Segundo Romanos 8, 38-39, nada: nem a morte, nem a vida, nem nenhuma circunstância pode nos separar do amor de Deus que está em Cristo Jesus.',
      },
    ],
  },
  {
    slug: 'casamento',
    intent: 'family',
    tag: 'Casamento',
    title: 'Versículos sobre o casamento e a vida a dois',
    answer:
      'A Bíblia trata o casamento como uma união feita pra durar, em que duas pessoas se tornam uma só carne. Há versículos sobre amor, respeito, perdão e companheirismo, ótimos pra votos, alianças ou pra rezar pelo casamento.',
    summary:
      'Versículos sobre o casamento: união, companheirismo e amor que se renova, pra celebrar ou pra fortalecer a vida a dois.',
    verses: [
      v('Gênesis 2, 24', 'Por isso o homem deixará pai e mãe e se unirá à sua mulher, e os dois serão uma só carne.'),
      v('Eclesiastes 4, 9', 'Melhor é serem dois do que um, porque têm melhor recompensa no seu trabalho.'),
      v('Eclesiastes 4, 12', 'O cordão de três dobras não se rompe com facilidade.'),
      v('Marcos 10, 9', 'Portanto, o que Deus uniu, o homem não o separe.'),
      v('Efésios 4, 2-3', 'Suportai-vos uns aos outros em amor, procurando guardar a unidade do espírito pelo vínculo da paz.'),
      v('1 Coríntios 13, 4', 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.'),
      v('Provérbios 31, 10', 'Mulher virtuosa, quem a achará? O seu valor muito excede o de finas joias.'),
      v('Colossenses 3, 14', 'Acima de tudo, revesti-vos do amor, que é o vínculo da perfeição.'),
    ],
    reflectionHtml: `<p>O "cordão de três dobras" de Eclesiastes é uma das imagens mais bonitas pra um casamento: marido, mulher e Deus no meio. Sozinho um fio arrebenta fácil. Trançado com outros dois, aguenta o puxão dos dias difíceis.</p>
    <p>Esses versículos servem pra um cartão de aliança, pros votos, ou pra rezar a dois antes de dormir. Casamento não se sustenta só de sentimento, se sustenta de escolha repetida todo dia. A Palavra ajuda a lembrar disso quando o cansaço fala mais alto.</p>`,
    faq: [
      {
        question: 'Qual versículo usar no convite ou nos votos de casamento?',
        answer:
          'Eclesiastes 4, 12 ("o cordão de três dobras não se rompe") e 1 Coríntios 13, 4-7 (sobre o amor) são os mais escolhidos. Gênesis 2, 24 também é clássico.',
      },
      {
        question: 'O que a Bíblia diz sobre marido e mulher?',
        answer:
          'Que os dois se tornam uma só carne (Gênesis 2, 24) e devem se amar, se respeitar e se suportar com paciência (Efésios 4, 2-3; Colossenses 3, 14).',
      },
    ],
  },
  {
    slug: 'familia',
    intent: 'family',
    tag: 'Família',
    title: 'Versículos sobre a família e o lar',
    answer:
      'A Bíblia vê a família como um presente e uma responsabilidade: pais que educam, filhos que honram, uma casa que serve a Deus. São versículos pra rezar pela sua casa, pelos filhos e pela união de todos.',
    summary:
      'Versículos sobre a família: a casa como herança de Deus, a educação dos filhos e a bênção sobre o lar.',
    verses: [
      v('Josué 24, 15', 'Eu e a minha casa serviremos ao Senhor.'),
      v('Salmo 127, 3', 'Os filhos são herança do Senhor, e o fruto do ventre, sua recompensa.'),
      v('Provérbios 22, 6', 'Ensina a criança no caminho em que deve andar, e até quando envelhecer não se desviará dele.'),
      v('Êxodo 20, 12', 'Honra teu pai e tua mãe, para que se prolonguem os teus dias na terra.'),
      v('Salmo 128, 3', 'A tua mulher será como videira frutífera, e os teus filhos, como rebentos de oliveira ao redor da tua mesa.'),
      v('1 Timóteo 5, 8', 'Quem não cuida dos seus, especialmente dos da própria casa, negou a fé.'),
      v('Atos 16, 31', 'Crê no Senhor Jesus, e serás salvo, tu e a tua casa.'),
      v('Efésios 6, 1', 'Filhos, obedecei a vossos pais no Senhor, porque isto é justo.'),
    ],
    reflectionHtml: `<p>"Eu e a minha casa serviremos ao Senhor" é uma frase que muita gente coloca na parede de casa, e faz sentido. É uma decisão de chefe de família, não uma garantia de que vai ser fácil. Família de verdade tem atrito, tem fase difícil, tem gente longe.</p>
    <p>Esses versículos servem pra rezar pela sua casa, um nome de cada vez. Reze especialmente por quem anda mais difícil de amar nesses dias. A Palavra não promete família perfeita, promete companhia pra construir uma família real.</p>`,
    faq: [
      {
        question: 'Qual o melhor versículo sobre família?',
        answer:
          'Josué 24, 15 ("eu e a minha casa serviremos ao Senhor") e Salmo 127, 3 ("os filhos são herança do Senhor") são os mais lembrados.',
      },
      {
        question: 'Tem versículo sobre criar os filhos?',
        answer:
          'Sim. Provérbios 22, 6 fala de ensinar a criança no caminho certo, e Efésios 6, 1 fala da obediência dos filhos aos pais.',
      },
    ],
  },
  {
    slug: 'cura',
    intent: 'healing',
    tag: 'Cura',
    title: 'Versículos sobre cura e saúde',
    answer:
      'A Bíblia traz muitos versículos de cura, do corpo e da alma. Eles lembram que Deus sara o coração quebrantado e cuida de cada ferida, e servem pra rezar por você ou por quem está doente.',
    summary:
      'Versículos sobre cura: promessas de saúde, restauração e consolo pra momentos de doença e dor.',
    verses: [
      v('Salmo 103, 2-3', 'Bendize, ó minha alma, ao Senhor, e não te esqueças de nenhum dos seus benefícios. É ele quem perdoa todas as tuas culpas e sara todas as tuas enfermidades.'),
      v('Jeremias 17, 14', 'Cura-me, Senhor, e serei curado; salva-me, e serei salvo, porque tu és o meu louvor.'),
      v('Salmo 147, 3', 'Ele sara os de coração quebrantado e lhes pensa as feridas.'),
      v('Isaías 53, 5', 'Pelas suas feridas fomos curados.'),
      v('Mateus 11, 28', 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.'),
      v('Tiago 5, 15', 'A oração da fé salvará o doente, e o Senhor o levantará.'),
      v('Êxodo 15, 26', 'Eu sou o Senhor que te sara.'),
      v('3 João 1, 2', 'Amado, desejo que tudo te corra bem e que tenhas saúde.'),
    ],
    reflectionHtml: `<p>Existe a cura do corpo, que a medicina ajuda a buscar, e existe a cura da alma, que muitas vezes acontece em paralelo: a paz que volta, o medo que diminui. Os dois tipos de cura aparecem juntos no Salmo 103, que fala de Deus que perdoa as culpas e sara as enfermidades na mesma frase.</p>
    <p>Reze esses versículos por você ou por quem você ama que está doente. E lembre: cuidar do corpo, seguir o tratamento e aceitar ajuda também é uma forma de oração. Fé e cuidado caminham lado a lado.</p>`,
    faq: [
      {
        question: 'Qual o salmo da cura?',
        answer:
          'O Salmo 103 é o mais associado à cura: "É ele quem sara todas as tuas enfermidades". O Salmo 147, 3 fala da cura do coração quebrantado.',
      },
      {
        question: 'Qual versículo rezar por uma pessoa doente?',
        answer:
          'Jeremias 17, 14 ("cura-me, Senhor, e serei curado") e Tiago 5, 15 ("a oração da fé salvará o doente") são ótimos pra interceder por quem está doente.',
      },
    ],
  },
  {
    slug: 'perdao',
    intent: 'forgiveness',
    tag: 'Perdão',
    title: 'Versículos sobre o perdão',
    answer:
      'A Bíblia liga o perdão que recebemos ao perdão que oferecemos: somos chamados a perdoar como fomos perdoados. São versículos pra quem precisa perdoar alguém ou pedir perdão e soltar um peso antigo.',
    summary:
      'Versículos sobre o perdão: perdoar o próximo, pedir perdão a Deus e se libertar do peso da mágoa.',
    verses: [
      v('Mateus 6, 14', 'Se perdoardes aos homens as suas ofensas, também vosso Pai celeste vos perdoará.'),
      v('Colossenses 3, 13', 'Suportai-vos uns aos outros e perdoai-vos mutuamente. Assim como o Senhor vos perdoou, perdoai também vós.'),
      v('Efésios 4, 32', 'Sede bondosos uns para com os outros, perdoando-vos mutuamente, como também Deus vos perdoou em Cristo.'),
      v('Mateus 18, 21-22', 'Senhor, quantas vezes devo perdoar? Não te digo até sete vezes, mas até setenta vezes sete.'),
      v('1 João 1, 9', 'Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar.'),
      v('Lucas 6, 37', 'Perdoai, e sereis perdoados.'),
      v('Salmo 103, 12', 'Quanto dista o oriente do ocidente, tanto afasta de nós as nossas transgressões.'),
      v('Marcos 11, 25', 'Quando estiverdes orando, perdoai, se tendes algo contra alguém.'),
    ],
    reflectionHtml: `<p>"Setenta vezes sete" não é uma conta, é um jeito de dizer: não tem limite. Jesus sabia que perdoar é difícil e que a gente quer parar na terceira ou quarta vez. Perdoar não é dizer que o que fizeram foi pequeno, é deixar de carregar o peso todo dia.</p>
    <p>Se tem alguém que você precisa perdoar, ou um perdão que você precisa pedir, comece rezando um desses versículos. O perdão costuma ser um caminho, não um clique. Tudo bem rezar a mesma frase muitas vezes até o coração acompanhar.</p>`,
    faq: [
      {
        question: 'Quantas vezes a Bíblia manda perdoar?',
        answer:
          'Setenta vezes sete (Mateus 18, 22). Não é uma conta exata, é o jeito de Jesus dizer que o perdão não tem limite.',
      },
      {
        question: 'O que a Bíblia diz sobre quem não perdoa?',
        answer:
          'Mateus 6, 14-15 ensina que, se perdoamos os outros, Deus também nos perdoa. O perdão que oferecemos está ligado ao que recebemos.',
      },
    ],
  },
  {
    slug: 'gratidao',
    intent: 'gratitude',
    tag: 'Gratidão',
    title: 'Versículos sobre gratidão e agradecer a Deus',
    answer:
      'A Bíblia chama a gratidão de vontade de Deus pra nós: dar graças em tudo, não só quando dá certo. São versículos pra começar o dia agradecendo e pra lembrar do bem que já existe.',
    summary:
      'Versículos sobre gratidão: agradecer a Deus em todo tempo e reparar no que já recebemos.',
    verses: [
      v('1 Tessalonicenses 5, 18', 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.'),
      v('Salmo 107, 1', 'Dai graças ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.'),
      v('Filipenses 4, 6', 'Em tudo, pela oração e pela súplica, com ação de graças, sejam conhecidos os vossos pedidos diante de Deus.'),
      v('Salmo 100, 4', 'Entrai pelas suas portas com ações de graças, e nos seus átrios com louvor.'),
      v('Colossenses 3, 17', 'Tudo o que fizerdes, fazei em nome do Senhor Jesus, dando por ele graças a Deus.'),
      v('Tiago 1, 17', 'Toda boa dádiva e todo dom perfeito vêm do alto.'),
      v('Salmo 9, 1', 'Louvar-te-ei, Senhor, de todo o meu coração.'),
      v('Salmo 136, 1', 'Louvai ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.'),
    ],
    reflectionHtml: `<p>"Em tudo dai graças" é uma das frases mais difíceis da Bíblia, porque ela não diz "por tudo", diz "em tudo". Não é agradecer pela dor, é encontrar, mesmo no dia ruim, alguma coisa que ainda sustenta: um café quente, uma mensagem, um fôlego a mais.</p>
    <p>Comece o dia com um desses versículos e, em seguida, diga em voz alta três coisas pelas quais você é grato hoje. A gratidão não muda os fatos, muda o tamanho que eles ocupam dentro de você.</p>`,
    faq: [
      {
        question: 'Qual versículo fala sobre ser grato?',
        answer:
          '1 Tessalonicenses 5, 18: "Em tudo dai graças, porque esta é a vontade de Deus". É o versículo-chave sobre gratidão.',
      },
      {
        question: 'Qual salmo é de gratidão?',
        answer:
          'Os Salmos 100, 107 e 136 são salmos de ação de graças, com o refrão "porque ele é bom, porque a sua misericórdia dura para sempre".',
      },
    ],
  },
  {
    slug: 'esperanca',
    intent: 'hope',
    tag: 'Esperança',
    title: 'Versículos sobre esperança pra dias difíceis',
    answer:
      'A Bíblia fala de esperança como confiança no futuro que Deus prepara, mesmo quando o presente está pesado. São versículos pra dias sem luz, pra quando falta força e pra renovar a fé no amanhã.',
    summary:
      'Versículos sobre esperança: promessas de um futuro bom, força que se renova e ânimo pros dias difíceis.',
    verses: [
      v('Jeremias 29, 11', 'Eu sei os planos que tenho para vós, planos de paz e não de mal, para vos dar um futuro e uma esperança.'),
      v('Isaías 40, 31', 'Os que esperam no Senhor renovam as suas forças, sobem com asas como águias, correm e não se cansam.'),
      v('Romanos 15, 13', 'O Deus da esperança vos encha de toda alegria e paz na fé.'),
      v('Lamentações 3, 22-23', 'As misericórdias do Senhor se renovam a cada manhã; grande é a sua fidelidade.'),
      v('Romanos 8, 28', 'Todas as coisas cooperam para o bem daqueles que amam a Deus.'),
      v('Salmo 42, 11', 'Espera em Deus, pois ainda o louvarei, ele é a salvação da minha face.'),
      v('Hebreus 11, 1', 'A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.'),
      v('Romanos 12, 12', 'Alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.'),
    ],
    reflectionHtml: `<p>"As misericórdias se renovam a cada manhã" é uma promessa pra quem acorda cansado de novo. Não diz que o problema acabou, diz que veio mais um dia, e com ele, mais graça pra atravessar.</p>
    <p>Esperança bíblica não é fingir que está tudo bem. É segurar na promessa de que o capítulo de hoje não é o último. Quando faltar luz, leia Jeremias 29, 11 devagar, e deixe a ideia de "futuro e esperança" descer até onde está doendo.</p>`,
    faq: [
      {
        question: 'Qual o versículo da esperança?',
        answer:
          'Jeremias 29, 11 ("planos de paz, para vos dar um futuro e uma esperança") é o mais citado. Isaías 40, 31 ("renovam as suas forças") também é muito amado.',
      },
      {
        question: 'O que a Bíblia diz pra não perder a esperança?',
        answer:
          'Que as misericórdias de Deus se renovam a cada manhã (Lamentações 3, 22-23) e que tudo coopera para o bem de quem ama a Deus (Romanos 8, 28).',
      },
    ],
  },
  {
    slug: 'fe',
    intent: 'faith',
    tag: 'Fé',
    title: 'Versículos sobre fé pra fortalecer a confiança',
    answer:
      'A Bíblia define fé como a certeza daquilo que se espera, mesmo sem ver. São versículos pra fortalecer a confiança em Deus nos momentos de dúvida e pra lembrar que a fé cresce ouvindo a Palavra.',
    summary:
      'Versículos sobre fé: confiar sem ver, crer mesmo na dúvida e deixar a fé crescer um passo de cada vez.',
    verses: [
      v('Hebreus 11, 1', 'A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.'),
      v('Hebreus 11, 6', 'Sem fé é impossível agradar a Deus.'),
      v('Marcos 9, 23', 'Tudo é possível ao que crê.'),
      v('Mateus 17, 20', 'Se tiverdes fé como um grão de mostarda, direis a este monte: passa daqui para lá, e ele passará.'),
      v('2 Coríntios 5, 7', 'Porque andamos por fé, e não por vista.'),
      v('Romanos 10, 17', 'A fé vem pelo ouvir, e o ouvir pela palavra de Deus.'),
      v('Tiago 2, 17', 'A fé, se não tiver obras, é morta em si mesma.'),
      v('Marcos 9, 24', 'Eu creio, Senhor, ajuda a minha falta de fé.'),
    ],
    reflectionHtml: `<p>"Eu creio, Senhor, ajuda a minha falta de fé" é talvez a oração mais honesta da Bíblia. Quem disse isso era um pai desesperado pela cura do filho, e cabe na boca de qualquer um que já quis crer e sentiu a dúvida do lado.</p>
    <p>Fé não é nunca duvidar. É continuar caminhando com a dúvida do lado, dando o próximo passo. O grão de mostarda é minúsculo, e Jesus diz que basta esse tamanho. Você não precisa de uma fé enorme, só de uma fé que dá mais um passo.</p>`,
    faq: [
      {
        question: 'Como a Bíblia define a fé?',
        answer:
          'Hebreus 11, 1 define: "A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos". É confiar mesmo sem ver.',
      },
      {
        question: 'Qual versículo fala que tudo é possível?',
        answer:
          'Marcos 9, 23: "Tudo é possível ao que crê". E Mateus 17, 20 fala da fé do tamanho de um grão de mostarda.',
      },
    ],
  },
  {
    slug: 'protecao',
    intent: 'protection',
    tag: 'Proteção',
    title: 'Versículos sobre proteção e a guarda de Deus',
    answer:
      'A Bíblia está cheia de versículos de proteção, especialmente nos Salmos. Eles falam de Deus como refúgio, rocha e guarda que não dorme, e servem pra pedir cobertura pra você, sua casa e quem você ama.',
    summary:
      'Versículos sobre proteção: Deus como refúgio e guarda, pra momentos de medo e pela proteção da casa.',
    verses: [
      v('Salmo 91, 1', 'Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso.'),
      v('Salmo 121, 7-8', 'O Senhor te guardará de todo mal, guardará a tua alma. O Senhor guardará a tua saída e a tua entrada.'),
      v('Isaías 41, 10', 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.'),
      v('Salmo 46, 1', 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.'),
      v('Salmo 18, 2', 'O Senhor é a minha rocha, a minha fortaleza e o meu libertador.'),
      v('Provérbios 18, 10', 'Torre forte é o nome do Senhor; para ela corre o justo e está seguro.'),
      v('Salmo 34, 7', 'O anjo do Senhor acampa ao redor dos que o temem, e os livra.'),
      v('2 Tessalonicenses 3, 3', 'Fiel é o Senhor, que vos confirmará e guardará do mal.'),
    ],
    reflectionHtml: `<p>O Salmo 121 diz que Deus "não dorme nem dormita". É a imagem de alguém que fica de vigília enquanto você descansa. Muita gente reza esses versículos à noite, pela casa, ou de manhã, antes de sair.</p>
    <p>Pedir proteção não é viver com medo, é entregar o que você não controla. Você faz a sua parte, tranca a porta, cuida dos seus, e deixa o resto com quem guarda a sua saída e a sua entrada.</p>`,
    faq: [
      {
        question: 'Qual o salmo de proteção mais forte?',
        answer:
          'O Salmo 91 ("à sombra do Todo-Poderoso") é o mais conhecido como salmo de proteção, seguido do Salmo 121 ("o Senhor te guardará de todo mal").',
      },
      {
        question: 'Qual versículo rezar pela proteção da família?',
        answer:
          'Salmo 121, 7-8 e Isaías 41, 10 ("não temas, porque eu sou contigo") são ótimos pra pedir guarda pela casa e por quem você ama.',
      },
    ],
  },
  {
    slug: 'ansiedade',
    intent: 'anxiety',
    tag: 'Ansiedade',
    title: 'Versículos sobre ansiedade pra acalmar o coração',
    answer:
      'A Bíblia tem versículos diretos sobre a ansiedade, como Filipenses 4, 6 ("não andeis ansiosos por coisa alguma") e 1 Pedro 5, 7 ("lançai sobre ele toda a vossa ansiedade"). Eles ajudam a acalmar o coração e a entregar o que não dá pra controlar.',
    summary:
      'Versículos sobre ansiedade: entregar a preocupação a Deus e encontrar a paz que acalma o coração.',
    verses: [
      v('Filipenses 4, 6-7', 'Não andeis ansiosos por coisa alguma; em tudo, pela oração, apresentai os vossos pedidos a Deus. E a paz de Deus guardará os vossos corações.'),
      v('1 Pedro 5, 7', 'Lançai sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.'),
      v('Mateus 6, 34', 'Não vos inquieteis com o dia de amanhã, pois o amanhã terá os seus próprios cuidados.'),
      v('João 14, 27', 'Deixo-vos a paz, a minha paz vos dou. Não se turbe o vosso coração nem se atemorize.'),
      v('Salmo 94, 19', 'Quando aumentavam as minhas inquietações, as tuas consolações me alegravam a alma.'),
      v('Isaías 26, 3', 'Tu conservarás em paz aquele cuja mente está firme em ti.'),
      v('Salmo 23, 4', 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum, porque tu estás comigo.'),
      v('Mateus 11, 28', 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.'),
    ],
    reflectionHtml: `<p>Filipenses 4, 6 não manda você simplesmente "parar de se preocupar", o que seria impossível. Ele dá um caminho: troque a preocupação pela oração. Em vez de rodar o problema na cabeça mil vezes, entregue ele, em palavras, pra Deus.</p>
    <p>Quando a ansiedade apertar, respire fundo e leia um versículo só, devagar. "Lançai sobre ele toda a vossa ansiedade" é literal: é colocar o peso pra fora, no colo de quem aguenta. Você não precisa segurar tudo sozinho.</p>`,
    faq: [
      {
        question: 'Qual o melhor versículo para a ansiedade?',
        answer:
          'Filipenses 4, 6-7 ("não andeis ansiosos por coisa alguma") e 1 Pedro 5, 7 ("lançai sobre ele toda a vossa ansiedade") são os mais rezados contra a ansiedade.',
      },
      {
        question: 'O que Jesus disse sobre a preocupação?',
        answer:
          'Em Mateus 6, 34, Jesus diz para não nos inquietarmos com o amanhã, porque cada dia já tem o seu próprio cuidado. Ele convida a confiar um dia de cada vez.',
      },
    ],
  },
  {
    slug: 'promessas-de-deus',
    intent: 'faith',
    tag: 'Promessas de Deus',
    title: 'Versículos sobre as promessas de Deus',
    answer:
      'A Bíblia está cheia de promessas de Deus: provisão, presença, força e cuidado. São versículos pra lembrar, nos dias de dúvida, daquilo que Deus prometeu e cumpre.',
    summary:
      'As principais promessas de Deus na Bíblia: estar presente, suprir, fortalecer e nunca abandonar.',
    verses: [
      v('Jeremias 29, 11', 'Eu sei os planos que tenho para vós, planos de paz e não de mal, para vos dar um futuro e uma esperança.'),
      v('Filipenses 4, 19', 'O meu Deus suprirá todas as vossas necessidades segundo as suas riquezas em glória.'),
      v('Mateus 28, 20', 'Eis que estou convosco todos os dias, até o fim do mundo.'),
      v('Hebreus 13, 5', 'Não te deixarei, nem te desampararei.'),
      v('Isaías 41, 10', 'Não temas, porque eu sou contigo; eu te fortaleço, eu te ajudo, eu te sustento com a minha destra.'),
      v('2 Coríntios 12, 9', 'A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.'),
      v('Josué 1, 9', 'Sê forte e corajoso; o Senhor, teu Deus, é contigo por onde quer que andares.'),
      v('Romanos 8, 28', 'Todas as coisas cooperam para o bem daqueles que amam a Deus.'),
    ],
    reflectionHtml: `<p>Promessa de Deus não é cheque em branco pros nossos planos, é compromisso do caráter dele com a gente: estar presente, sustentar, não abandonar. Quando a vida aperta, ajuda muito ter uma dessas promessas na ponta da língua.</p>
    <p>Escolha uma que fale com o seu momento e leia em voz alta. "Não te deixarei, nem te desampararei" cabe em quase todo dia difícil.</p>`,
    faq: [
      {
        question: 'Quais são as maiores promessas de Deus na Bíblia?',
        answer:
          'Estar presente sempre (Mateus 28, 20), suprir as necessidades (Filipenses 4, 19), dar força (Isaías 41, 10) e nunca abandonar (Hebreus 13, 5) estão entre as mais lembradas.',
      },
      {
        question: 'Deus cumpre todas as promessas?',
        answer:
          'A Bíblia afirma que Deus é fiel e cumpre o que promete, ainda que no tempo dele e nem sempre do jeito que a gente imagina. A fé é confiar nisso mesmo sem ver.',
      },
    ],
  },
  {
    slug: 'bom-dia',
    intent: 'morning',
    tag: 'Bom dia',
    title: 'Versículos de bom dia pra começar o dia com Deus',
    answer:
      'Versículos de bom dia pra começar a manhã com fé e gratidão, pra você ou pra mandar pra alguém. A Bíblia lembra que as misericórdias de Deus se renovam a cada manhã.',
    summary:
      'Versículos de bom dia: começar a manhã com fé, gratidão e ânimo, e abençoar quem você ama.',
    verses: [
      v('Lamentações 3, 22-23', 'As misericórdias do Senhor se renovam a cada manhã; grande é a sua fidelidade.'),
      v('Salmo 118, 24', 'Este é o dia que o Senhor fez; alegremo-nos e regozijemo-nos nele.'),
      v('Salmo 143, 8', 'Faze-me ouvir da tua bondade pela manhã, pois em ti confio.'),
      v('Salmo 5, 3', 'Pela manhã ouves a minha voz, ó Senhor; pela manhã apresento a ti a minha oração e espero.'),
      v('Salmo 90, 14', 'Sacia-nos de manhã com a tua bondade, para que cantemos de alegria todos os nossos dias.'),
      v('Salmo 30, 5', 'O choro pode durar uma noite, mas a alegria vem pela manhã.'),
      v('Isaías 33, 2', 'Senhor, tem misericórdia de nós; sê o nosso braço cada manhã.'),
    ],
    reflectionHtml: `<p>Começar o dia com um versículo é trocar o primeiro pensamento. Em vez de já acordar pensando no que falta, você abre a manhã lembrando que "as misericórdias se renovam a cada manhã". É um respiro antes de a correria começar.</p>
    <p>Vale ler um pra você e mandar outro pra alguém que precisa de um bom dia hoje. Uma frase de fé chega mais longe que um "bom dia" qualquer.</p>`,
    faq: [
      {
        question: 'Qual o melhor versículo de bom dia?',
        answer:
          'Lamentações 3, 22-23 ("as misericórdias se renovam a cada manhã") e Salmo 118, 24 ("este é o dia que o Senhor fez") são os mais usados pra começar o dia.',
      },
      {
        question: 'Qual salmo ler pela manhã?',
        answer:
          'O Salmo 5 e o Salmo 143, 8 falam de apresentar a oração a Deus logo pela manhã. São ótimos pra começar o dia rezando.',
      },
    ],
  },
  {
    slug: 'boa-noite',
    intent: 'night',
    tag: 'Boa noite',
    title: 'Versículos de boa noite pra dormir em paz',
    answer:
      'Versículos de boa noite pra encerrar o dia entregando tudo a Deus e dormir em paz. A Bíblia diz que Ele dá o sono aos seus amados e guarda quem nele descansa.',
    summary:
      'Versículos de boa noite: entregar o dia, descansar sem medo e dormir confiando na guarda de Deus.',
    verses: [
      v('Salmo 4, 8', 'Em paz me deito e logo pego no sono, porque só tu, Senhor, me fazes repousar seguro.'),
      v('Salmo 127, 2', 'Ele dá aos seus amados enquanto dormem.'),
      v('Provérbios 3, 24', 'Quando te deitares, não terás medo; deitar-te-ás, e o teu sono será suave.'),
      v('Salmo 3, 5', 'Eu me deito e durmo; acordo, porque o Senhor me sustenta.'),
      v('Salmo 121, 4', 'Não dormita nem dorme aquele que te guarda.'),
      v('Mateus 11, 28', 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.'),
      v('Filipenses 4, 7', 'A paz de Deus, que excede todo entendimento, guardará os vossos corações.'),
    ],
    reflectionHtml: `<p>A noite assusta quando a gente leva pra cama tudo o que não resolveu. O Salmo 4, 8 propõe outra coisa: "em paz me deito e logo pego no sono". Não é mágica, é entrega. Você fez o que deu hoje, o resto fica com quem "não dormita nem dorme".</p>
    <p>Leia um desses antes de apagar a luz, respire fundo e solte o dia. Amanhã você cuida do amanhã.</p>`,
    faq: [
      {
        question: 'Qual versículo ler antes de dormir?',
        answer:
          'Salmo 4, 8 ("em paz me deito e logo pego no sono") e Provérbios 3, 24 ("o teu sono será suave") são clássicos pra terminar o dia em paz.',
      },
      {
        question: 'O que a Bíblia diz sobre dormir tranquilo?',
        answer:
          'Que Deus dá o sono aos seus amados (Salmo 127, 2) e que não dormita aquele que nos guarda (Salmo 121, 4). Dá pra descansar confiando nessa guarda.',
      },
    ],
  },
  {
    slug: 'conforto',
    intent: 'grief',
    tag: 'Conforto',
    title: 'Versículos de conforto pra dias de dor e tristeza',
    answer:
      'Versículos de conforto pra momentos de dor, perda e tristeza. A Bíblia mostra um Deus que está perto de quem tem o coração quebrantado e que consola em toda aflição.',
    summary:
      'Versículos de conforto e consolo: a presença de Deus perto de quem sofre, pra dias de dor, luto e tristeza.',
    verses: [
      v('Salmo 34, 18', 'Perto está o Senhor dos que têm o coração quebrantado, e salva os de espírito oprimido.'),
      v('Mateus 5, 4', 'Bem-aventurados os que choram, porque serão consolados.'),
      v('2 Coríntios 1, 3-4', 'Bendito seja o Deus de toda consolação, que nos consola em toda a nossa tribulação.'),
      v('Salmo 147, 3', 'Ele sara os de coração quebrantado e lhes pensa as feridas.'),
      v('Salmo 23, 4', 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum, porque tu estás comigo.'),
      v('João 14, 27', 'Deixo-vos a paz, a minha paz vos dou. Não se turbe o vosso coração.'),
      v('Apocalipse 21, 4', 'Deus enxugará dos seus olhos toda lágrima, e não haverá mais morte, nem pranto, nem dor.'),
      v('Isaías 41, 10', 'Não temas, porque eu sou contigo; eu te fortaleço e te ajudo.'),
    ],
    reflectionHtml: `<p>Conforto de verdade não é alguém dizendo "vai passar". É presença. A Bíblia descreve Deus como quem fica "perto dos que têm o coração quebrantado". Não promete tirar a dor na hora, promete não te deixar sozinho dentro dela.</p>
    <p>Se você está de luto ou num dia de tristeza, leia o Salmo 23, 4 devagar. Repare na palavra "comigo". É ela que sustenta o resto da frase.</p>`,
    faq: [
      {
        question: 'Qual o melhor versículo de conforto?',
        answer:
          'Salmo 34, 18 ("perto está o Senhor dos que têm o coração quebrantado") e Mateus 5, 4 ("os que choram serão consolados") estão entre os mais consoladores.',
      },
      {
        question: 'Qual versículo ler em um momento de luto?',
        answer:
          'Salmo 23, 4 e Apocalipse 21, 4 ("Deus enxugará toda lágrima") confortam muito em momentos de perda. Veja também nossas orações de luto e consolo.',
      },
    ],
  },
  {
    slug: 'forca',
    intent: 'faith',
    tag: 'Força',
    title: 'Versículos de força e coragem pra dias difíceis',
    answer:
      'Versículos de força e coragem pra quando bate o cansaço e o medo. A Bíblia repete o convite a "ser forte e corajoso", lembrando que a força vem de Deus, não só da gente.',
    summary:
      'Versículos de força e coragem: ânimo pra enfrentar os dias difíceis sabendo que Deus fortalece e caminha junto.',
    verses: [
      v('Josué 1, 9', 'Sê forte e corajoso; não temas, nem te espantes, porque o Senhor, teu Deus, é contigo por onde quer que andares.'),
      v('Filipenses 4, 13', 'Tudo posso naquele que me fortalece.'),
      v('Isaías 40, 31', 'Os que esperam no Senhor renovam as suas forças, sobem com asas como águias.'),
      v('Isaías 41, 10', 'Não temas, porque eu sou contigo; eu te fortaleço e te sustento com a minha destra.'),
      v('2 Timóteo 1, 7', 'Deus não nos deu espírito de covardia, mas de força, de amor e de equilíbrio.'),
      v('Salmo 46, 1', 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.'),
      v('Salmo 27, 1', 'O Senhor é a minha luz e a minha salvação; a quem temerei?'),
      v('Deuteronômio 31, 6', 'Sede fortes e corajosos; o Senhor, teu Deus, é quem vai contigo, não te deixará nem te desamparará.'),
    ],
    reflectionHtml: `<p>"Sê forte e corajoso" aparece várias vezes na Bíblia, quase sempre seguido de um motivo: "porque o Senhor é contigo". A coragem que a Bíblia pede não vem de fingir que não tem medo, vem de não estar sozinho no medo.</p>
    <p>Num dia em que você se sentir sem força, leia Filipenses 4, 13 e Isaías 40, 31. A força que falta em você pode ser pedida, não só fabricada.</p>`,
    faq: [
      {
        question: 'Qual versículo dá força e coragem?',
        answer:
          'Josué 1, 9 ("sê forte e corajoso") e Filipenses 4, 13 ("tudo posso naquele que me fortalece") são os mais lembrados pra dias difíceis.',
      },
      {
        question: 'O que a Bíblia diz sobre ter medo?',
        answer:
          '2 Timóteo 1, 7 diz que "Deus não nos deu espírito de covardia, mas de força, amor e equilíbrio". A fé não nega o medo, mas oferece coragem pra atravessá-lo.',
      },
    ],
  },
];

export const listVerseTopics = () => TOPICS;

export const getVerseTopic = (slug) => TOPICS.find((t) => t.slug === slug) ?? null;

export const VERSE_TOPIC_SLUGS = TOPICS.map((t) => t.slug);
