import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('estudo');

export const generateMetadata = async ({ params }) =>
  signalMetadata('estudo', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="estudo" slugParam={(await params).slug} />;
}
