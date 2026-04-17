import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
    title: 'Contact Us | Samples Wala Support',
    description: 'Get in touch with the Samples Wala team for support, business inquiries, or technical assistance with our music production tools and samples.',
    alternates: {
        canonical: 'https://sampleswala.com/contact'
    }
}

export default function ContactPage() {
    return <ContactClient />
}
