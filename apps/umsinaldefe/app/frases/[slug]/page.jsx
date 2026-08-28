import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('frases');

export const generateMetadata = async ({ params }) =>
  signalMetadata('frases', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="frases" slugParam={(await params).slug} />;
}
