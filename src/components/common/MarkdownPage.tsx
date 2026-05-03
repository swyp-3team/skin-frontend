import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import PageHeader from '@/components/headers/PageHeader'
import MobilePage from '@/components/MobilePage'

interface MarkdownPageProps {
  title: string
  backTo: string
  content: string
}

function MarkdownPage({ title, backTo, content }: MarkdownPageProps) {
  return (
    <MobilePage header={<PageHeader backTo={backTo} title={title} />}>
      <div className="prose prose-sm max-w-none px-3 py-6 text-neutral-700">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-4 text-xl font-bold text-neutral-900">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="mb-2 mt-8 text-base font-semibold text-neutral-900">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-2 mt-6 text-sm font-semibold text-neutral-800">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-sm leading-6 text-neutral-600">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="mb-3 space-y-1 pl-4 text-sm text-neutral-600">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 space-y-1 pl-4 text-sm text-neutral-600">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="list-disc leading-6">{children}</li>
            ),
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto rounded-none border border-neutral-200">
                <table className="w-full text-xs">{children}</table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-neutral-50">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="sborder-b border-neutral-200 px-3 py-2 text-left font-medium text-neutral-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border-b border-neutral-100 px-3 py-2 text-neutral-600">{children}</td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-3 border-l-4 border-neutral-300 bg-neutral-50 py-1 pl-4 pr-3 text-xs text-neutral-600">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-6 border-neutral-200" />,
            strong: ({ children }) => (
              <strong className="font-semibold text-neutral-800">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </MobilePage>
  )
}

export default MarkdownPage
