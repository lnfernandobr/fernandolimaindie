import { SectionHub, sectionMetadata } from '@/components/SectionHub.jsx';

export const revalidate = 86400;

export const generateMetadata = () => sectionMetadata('estudo');

export default function Page() {
  return <SectionHub slug="estudo" />;
}
