import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('personagens-biblicos');

export const generateMetadata = async ({ params }) =>
  signalMetadata('personagens-biblicos', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="personagens-biblicos" slugParam={(await params).slug} />;
}
