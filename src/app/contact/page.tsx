import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'
import ContactClient from './ContactClient'

export const metadata = generateMetadata(pagesMeta.contact);

export default function ContactPage() {
    return <ContactClient />
}
