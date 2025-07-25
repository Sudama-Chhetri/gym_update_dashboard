import '../styles/globals.css'

export const metadata = {
  title: 'Tenzin\'s Gym',
  description: 'Gym POS system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
