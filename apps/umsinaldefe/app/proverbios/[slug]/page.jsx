import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('proverbios');

export const generateMetadata = async ({ params }) =>
  signalMetadata('proverbios', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="proverbios" slugParam={(await params).slug} />;
}
