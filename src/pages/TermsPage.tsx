import { APP_ROUTES } from '@/app/routes'
import MarkdownPage from '@/components/common/MarkdownPage'
import termsContent from '@/content/terms.md?raw'

function TermsPage() {
  return <MarkdownPage backTo={APP_ROUTES.home} content={termsContent} title="이용약관" />
}

export default TermsPage
