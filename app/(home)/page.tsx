import HomeProducts from './HomeProducts';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <HomeProducts sectionType="reviews" />
      <HomeProducts sectionType="community" />
      <HomeProducts sectionType="recommendations" />
    </div>
  );
}
