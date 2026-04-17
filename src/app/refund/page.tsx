import { Metadata } from 'next'
import RefundClient from './RefundClient'

export const metadata: Metadata = {
    title: 'Refund Policy | Samples Wala Returns & Credits',
    description: 'Understand the Samples Wala refund policy for digital audio artifacts. Digital downloads are generally non-refundable to protect creator rights.',
    alternates: {
        canonical: 'https://sampleswala.com/refund'
    }
}

export default function RefundPage() {
    return <RefundClient />
}
