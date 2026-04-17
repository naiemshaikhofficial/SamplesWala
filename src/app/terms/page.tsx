import { Metadata } from 'next'
import TermsClient from './TermsClient'

export const metadata: Metadata = {
    title: 'Terms of Service | Samples Wala Usage Rules',
    description: 'Review the terms and conditions for using Samples Wala. Understand your rights, membership rules, and sound ownership policies.',
    alternates: {
        canonical: 'https://sampleswala.com/terms'
    }
}

export default function TermsPage() {
    return <TermsClient />
}
