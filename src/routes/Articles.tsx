import DividerWithText from '../components/DividerWithText';
import MetaTags from '../components/MetaTags';

export default function Articles() {
  return (
    <>
      <MetaTags
        title="Articles"
        description="Articles written by Noah Tigner"
      />
      <DividerWithText>Articles</DividerWithText>
      <div style={{ minHeight: '80vh', paddingTop: '1rem' }}>
        Check back soon ;)
      </div>
    </>
  );
}
