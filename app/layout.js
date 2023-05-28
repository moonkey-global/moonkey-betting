import './globals.css';
import ClientProvider from '@/components/ClientProvider';

export const metadata = {
	title: 'Azuro demo',
	description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body>
				<ClientProvider>{children}</ClientProvider>
			</body>
		</html>
	);
}
