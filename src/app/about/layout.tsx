import { generateMetadata, pagesMeta } from '@/lib/seo-metadata'

export const metadata = generateMetadata({
    ...pagesMeta.about,
    title: "About Naiem Shaikh (Nemo) | Indian Hip Hop Artist & Music Producer",
    description: "Learn about Naiem Shaikh (Nemo), an Indian independent rapper, music producer, and the visionary behind Samples Wala. Engineering the future of independent sound."
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
