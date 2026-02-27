import './globals.css'

export const metadata = {
  title: 'Spktr',
  description: 'AI Screen Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-transparent antialiased">{children}</body>
    </html>
  )
}
