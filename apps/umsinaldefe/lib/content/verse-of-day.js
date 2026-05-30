/**
 * "Versículo do dia": um dos termos de maior busca do nicho (~246k/mês).
 *
 * A página /versiculo-do-dia mostra um versículo escolhido pelo dia do ano,
 * de forma determinística (o mesmo versículo o dia inteiro, muda no dia
 * seguinte). A página é ISR (revalida 1x por dia), então o versículo do dia
 * acompanha a data sem precisar de banco nem de JavaScript no cliente.
 */

const v = (ref, text, thought) => ({ ref, text, thought });

// Pool de versículos amados, conferidos, em tradução de uso comum no Brasil.
const POOL = [
  v('João 3, 16', 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', 'O amor de Deus por você não depende do seu dia bom. Ele veio primeiro.'),
  v('Salmo 23, 1', 'O Senhor é o meu pastor; nada me faltará.', 'Não é que nada vai dar errado. É que você não caminha sozinho.'),
  v('Filipenses 4, 13', 'Tudo posso naquele que me fortalece.', 'A força que falta em você hoje pode ser pedida, não só fabricada.'),
  v('Jeremias 29, 11', 'Eu sei os planos que tenho para vós, planos de paz e não de mal, para vos dar um futuro e uma esperança.', 'O capítulo de hoje não é o último.'),
  v('Salmo 46, 1', 'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.', 'Refúgio é lugar pra correr quando aperta. Você tem pra onde ir.'),
  v('Isaías 41, 10', 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.', 'O remédio pro medo aqui não é coragem, é companhia.'),
  v('Provérbios 3, 5-6', 'Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.', 'Confiar é soltar um pouco do controle que nunca foi tão seu assim.'),
  v('Filipenses 4, 6-7', 'Não andeis ansiosos por coisa alguma; em tudo, pela oração, apresentai os vossos pedidos a Deus. E a paz de Deus guardará os vossos corações.', 'Troque a ruminação pela oração. Coloque o peso pra fora.'),
  v('Mateus 6, 33', 'Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.', 'Quando o essencial vem primeiro, o resto encontra o seu lugar.'),
  v('Romanos 8, 28', 'Todas as coisas cooperam para o bem daqueles que amam a Deus.', 'Nem tudo é bom, mas nada se perde nas mãos de Deus.'),
  v('Salmo 37, 5', 'Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.', 'Entregar não é desistir. É parar de carregar sozinho.'),
  v('Isaías 40, 31', 'Os que esperam no Senhor renovam as suas forças, sobem com asas como águias, correm e não se cansam.', 'Esperar em Deus não é ficar parado, é recarregar.'),
  v('Josué 1, 9', 'Sê forte e corajoso; não temas, porque o Senhor, teu Deus, é contigo por onde quer que andares.', 'A coragem da Bíblia nasce de não estar sozinho.'),
  v('1 Coríntios 13, 4', 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.', 'Amar é menos sentir e mais decidir, todo dia.'),
  v('Salmo 91, 1', 'Aquele que habita no abrigo do Altíssimo descansa à sombra do Todo-Poderoso.', 'Quando o dia é forte, você não combate o sol. Procura sombra.'),
  v('Mateus 11, 28', 'Vinde a mim todos os que estais cansados e sobrecarregados, e eu vos aliviarei.', 'Você não precisa chegar inteiro. Pode chegar cansado.'),
  v('2 Timóteo 1, 7', 'Deus não nos deu espírito de covardia, mas de força, de amor e de equilíbrio.', 'O medo não tem a última palavra sobre quem você é.'),
  v('Salmo 27, 1', 'O Senhor é a minha luz e a minha salvação; a quem temerei?', 'Com luz, o escuro deixa de mandar.'),
  v('Lamentações 3, 22-23', 'As misericórdias do Senhor se renovam a cada manhã; grande é a sua fidelidade.', 'Veio mais um dia. Com ele, mais graça pra atravessar.'),
  v('João 14, 27', 'Deixo-vos a paz, a minha paz vos dou. Não se turbe o vosso coração nem se atemorize.', 'A paz dele não depende de tudo estar resolvido.'),
  v('Salmo 121, 1-2', 'Elevo os meus olhos para os montes: de onde me vem o socorro? O meu socorro vem do Senhor, que fez os céus e a terra.', 'Levante os olhos. O socorro vem de cima do problema.'),
  v('Provérbios 16, 3', 'Confia ao Senhor as tuas obras, e os teus planos serão estabelecidos.', 'Faça a sua parte e entregue o resultado.'),
  v('Romanos 12, 12', 'Alegrai-vos na esperança, sede pacientes na tribulação, perseverai na oração.', 'Três verbos pra um dia difícil: esperar, aguentar, rezar.'),
  v('Salmo 118, 24', 'Este é o dia que o Senhor fez; alegremo-nos e regozijemo-nos nele.', 'Hoje não se repete. Já é motivo.'),
  v('1 Pedro 5, 7', 'Lançai sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.', 'Literalmente: jogue o peso no colo de quem aguenta.'),
  v('Hebreus 11, 1', 'A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.', 'Fé é dar o próximo passo mesmo sem ver a escada inteira.'),
  v('Salmo 34, 18', 'Perto está o Senhor dos que têm o coração quebrantado, e salva os de espírito oprimido.', 'Deus não foge da sua dor. Ele se aproxima dela.'),
  v('Gálatas 6, 9', 'Não nos cansemos de fazer o bem, pois a seu tempo ceifaremos, se não desfalecermos.', 'O bem que você planta hoje tem uma colheita marcada.'),
  v('Salmo 28, 7', 'O Senhor é a minha força e o meu escudo; nele confiou o meu coração, e fui socorrido.', 'Força e escudo: um pra agir, outro pra proteger.'),
  v('Mateus 28, 20', 'Eis que estou convosco todos os dias, até o fim do mundo.', 'Todos os dias. Inclusive este.'),
  v('Sofonias 3, 17', 'O Senhor, teu Deus, está no meio de ti; ele se alegra em ti com grande alegria.', 'Você é motivo de alegria pra Deus, não de cobrança.'),
];

const dayOfYear = (d) => {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
};

/** Versículo determinístico pelo dia (muda à meia-noite UTC). */
export const getVerseOfDay = (date = new Date()) => POOL[dayOfYear(date) % POOL.length];

/** Demais versículos da coletânea (exclui o do dia), pra dar profundidade à página. */
export const listOtherVerses = (date = new Date()) => {
  const todayRef = getVerseOfDay(date).ref;
  return POOL.filter((x) => x.ref !== todayRef);
};

export const VERSE_POOL = POOL;
