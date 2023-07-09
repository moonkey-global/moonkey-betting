import ClientPage from './ClientPage';

export default function Home({ params }) {
	let address = '';
	if (params.slug) address = params.slug[0];
	return <ClientPage address={address} />;
}
