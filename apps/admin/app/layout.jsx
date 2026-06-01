import './globals.css';

export const metadata = {
  title: 'Admin · Um Sinal de Fé',
  description: 'Painel de gerenciamento do Um Sinal de Fé',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
