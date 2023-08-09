const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY || '';
const appId = process.env.NEXT_PUBLIC_APP_ID || '';
export const particleValue = {
	projectId: projectId,
	clientKey: clientKey,
	appId: appId,
	chainName: 'polygon', //optional: current chain name, default Ethereum.
	chainId: 80001, //optional: current chain id, default 1.
	// wallet: {
	// 	//optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
	// 	displayWalletEntry: false, //show wallet entry when connect particle.
	// 	defaultWalletEntryPosition: WalletEntryPosition.BR, //wallet entry position
	// 	uiMode: 'dark', //optional: light or dark, if not set, the default is the same as web auth.
	// 	supportChains: [
	// 		{ id: 1, name: 'Ethereum' },
	// 		{ id: 5, name: 'Ethereum' },
	// 	], // optional: web wallet support chains.
	// 	customStyle: {}, //optional: custom wallet style
	// },
};
