/**
 * Marca do site: estrela de quatro pontas alongada, em vetor.
 *
 * Substitui o caractere ✦, que dependia da fonte do sistema ter o glifo e
 * renderizava diferente em cada plataforma (no favicon antigo, chegava a
 * sumir). Aqui a forma é a mesma em todo lugar.
 */
export function BrandMark({ size = 20, className, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M16 3.2C16.9 11 20.4 15.1 27 16c-6.6.9-10.1 5-11 12.8C15.1 21 11.6 16.9 5 16c6.6-.9 10.1-5 11-12.8Z" />
    </svg>
  );
}
