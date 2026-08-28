/**
 * Os arquivos de conteúdo marcam os subtítulos como <p><strong>texto</strong></p>,
 * e não como título de verdade. Isso deixava o artigo sem hierarquia nenhuma:
 * leitor de tela não consegue navegar por seções e o Google não enxerga a
 * estrutura do texto, que é o que alimenta trecho em destaque.
 *
 * A conversão acontece aqui, na renderização, pra valer nos 49 conteúdos já
 * publicados sem reescrever arquivo nenhum. Conteúdo novo pode já vir com <h2>:
 * esta função não mexe em quem já está certo.
 */
const PARAGRAFO_SO_COM_NEGRITO = /<p>\s*<strong>(.*?)<\/strong>\s*<\/p>/gis;

export const promoverSubtitulos = (html = '') =>
  html.replace(PARAGRAFO_SO_COM_NEGRITO, (_, texto) => `<h2>${texto}</h2>`);

export function SemanticChunks({ chunks }) {
  if (!chunks?.length) return null;
  return chunks.map((chunk) => (
    <section key={chunk.id} id={chunk.id} className="chunk">
      <div dangerouslySetInnerHTML={{ __html: promoverSubtitulos(chunk.html) }} />
    </section>
  ));
}
