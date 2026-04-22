import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import PrivacyClient from './PrivacyClient'

export const metadata = generateMetadata(pagesMeta.privacy);

export default function PrivacyPage() {
    return <PrivacyClient />
}
