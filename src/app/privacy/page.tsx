import { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'

export const metadata: Metadata = {
    title: 'Privacy Policy | Samples Wala Data Protection',
    description: 'Learn how Samples Wala collects, uses, and protects your data. We are committed to ensuring your privacy and security on our platform.',
    alternates: {
        canonical: 'https://sampleswala.com/privacy'
    }
}

export default function PrivacyPage() {
    return <PrivacyClient />
}
