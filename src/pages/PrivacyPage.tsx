import { APP_ROUTES } from '@/app/routes'
import MarkdownPage from '@/components/common/MarkdownPage'
import privacyContent from '@/content/privacy.md?raw'

function PrivacyPage() {
  return <MarkdownPage backTo={APP_ROUTES.home} content={privacyContent} title="개인정보처리방침" />
}

export default PrivacyPage
