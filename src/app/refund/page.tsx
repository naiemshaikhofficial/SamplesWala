import { Metadata } from 'next'
import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import RefundClient from './RefundClient'

export const metadata = generateMetadata(pagesMeta.refund);

export default function RefundPage() {
    return <RefundClient />
}
