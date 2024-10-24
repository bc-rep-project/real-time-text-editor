import '../styles/globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <main className="min-h-screen p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
