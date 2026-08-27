import { SectionHub, sectionMetadata } from '@/components/SectionHub.jsx';

export const revalidate = 86400;

export const generateMetadata = () => sectionMetadata('proverbios');

export default function Page() {
  return <SectionHub slug="proverbios" />;
}
