import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('nomes-biblicos');

export const generateMetadata = async ({ params }) =>
  signalMetadata('nomes-biblicos', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="nomes-biblicos" slugParam={(await params).slug} />;
}
