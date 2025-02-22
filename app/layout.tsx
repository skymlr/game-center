import "./globals.css"

export const metadata = {
  title: 'Game Center',
  description: 'A collection of simple games for a mobile-first experience',
  manifest: '/manifest.json'
};

export const viewport = {
  themeColor: '#ffffff'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}