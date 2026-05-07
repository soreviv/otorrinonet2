import { PublicHeader } from './PublicHeader'
import { PublicFooter } from './PublicFooter'
import { Breadcrumbs } from './Breadcrumbs'

interface Props {
  title: string
  updatedAt: string
  breadcrumb: { label: string; href: string }
  children: React.ReactNode
}

export function LegalPageShell({ title, updatedAt, breadcrumb, children }: Props) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans antialiased flex flex-col">
      <PublicHeader />
      <Breadcrumbs items={[breadcrumb]} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">{updatedAt}</p>
        <div className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-headings:font-semibold">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
