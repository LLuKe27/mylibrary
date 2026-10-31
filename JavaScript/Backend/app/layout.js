export const metadata = { title: 'Biblioteca Digital Semântica — API' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#0b0b0d', color: '#f5f5f7', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

