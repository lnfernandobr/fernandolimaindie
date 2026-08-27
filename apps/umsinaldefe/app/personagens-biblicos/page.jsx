import { SectionHub, sectionMetadata } from '@/components/SectionHub.jsx';

export const revalidate = 86400;

export const generateMetadata = () => sectionMetadata('personagens-biblicos');

export default function Page() {
  return <SectionHub slug="personagens-biblicos" />;
}
