import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

const BASE_URL = 'https://otorrinonet.com'

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }, ...items]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Ruta de navegación">
            <ol className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
              {allItems.map((item, i) => {
                const isLast = i === allItems.length - 1
                return (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                    {isLast ? (
                      <span aria-current="page" className="text-slate-600 dark:text-slate-300 font-medium">
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href!}
                        className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1"
                      >
                        {i === 0 && <Home className="w-3 h-3" />}
                        {item.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>
    </>
  )
}
