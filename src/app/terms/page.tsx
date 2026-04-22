import { Metadata } from 'next'
import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import TermsClient from './TermsClient'

export const metadata = generateMetadata(pagesMeta.terms);

export default function TermsPage() {
    return <TermsClient />
}
