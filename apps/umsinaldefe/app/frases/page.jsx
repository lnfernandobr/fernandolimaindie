import { SectionHub, sectionMetadata } from '@/components/SectionHub.jsx';

export const revalidate = 86400;

export const generateMetadata = () => sectionMetadata('frases');

export default function Page() {
  return <SectionHub slug="frases" />;
}
