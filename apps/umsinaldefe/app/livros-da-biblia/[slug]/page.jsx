import { SignalPage, signalParams, signalMetadata } from '@/components/SignalPage.jsx';

export const revalidate = 86400;

export const generateStaticParams = () => signalParams('livros-da-biblia');

export const generateMetadata = async ({ params }) =>
  signalMetadata('livros-da-biblia', (await params).slug);

export default async function Page({ params }) {
  return <SignalPage sectionSlug="livros-da-biblia" slugParam={(await params).slug} />;
}
