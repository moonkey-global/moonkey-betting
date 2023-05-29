import ClientPage from './ClientPage';

export default function Home({ params }) {
	return <ClientPage address={params.slug} />;
}
