'use client';
import * as ethers from 'ethers';
import Link from 'next/link';
import { DAppProvider, Polygon, useEthers, Mumbai } from '@usedapp/core';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { particleValue } from '@/lib/particleAuth';

export const ClientContext = React.createContext({
	logIn: function () {
		throw new Error('Function not implemented.');
	},
	logOut: function () {
		throw new Error('Function not implemented.');
	},
	latestAccount: async function () {
		throw new Error('Function not implemented.');
	},
});
function useExtendedState(initialState) {
	const [state, setState] = useState(initialState);
	const getLatestState = () => {
		return new Promise((resolve, reject) => {
			setState((s) => {
				resolve(s);
				return s;
			});
		});
	};
	return [state, setState, getLatestState];
}

const apolloClient = new ApolloClient({
	uri: 'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-polygon-v2', //'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-polygon', //'https://thegraph.azuro.org/subgraphs/name/azuro-protocol/azuro-api-mumbai-dev-v2',
	cache: new InMemoryCache(),
});

const config = {
	readOnlyChainId: Polygon.chainId, //Mumbai.chainId,
	readOnlyUrls: {
		// 'https://rpc.ankr.com/polygon_mumbai'
		[Polygon.chainId]: new ethers.providers.StaticJsonRpcProvider(
			'https://rpc.ankr.com/polygon'
		),
	},
};

const ConnectButton = ({ logOut, logIn, particle, provider }) => {
	// const { account, deactivate, activateBrowserWallet } = useEthers();

	// // 'account' being undefined means that user is not connected
	// const title = account ? 'Disconnect' : 'Connect';
	// const action = account ? deactivate : activateBrowserWallet;
	const [isConnected, setIsConnected] = useState(false);
	const handleLogin = async () => {
		if (!particle.auth.isLogin() || !provider) {
			logIn();
			setIsConnected(true);
		}
	};
	const handleLogout = async () => {
		if (particle.auth.isLogin()) {
			logOut();
			setIsConnected(false);
		}
		setIsConnected(false);
	};

	// return (
	// 	<button className='button' onClick={() => action()}>
	// 		{title}
	// 	</button>
	// );
	return (
		<>
			{!isConnected ? (
				<button className='button' onClick={handleLogin}>
					Connect
				</button>
			) : (
				<button className='button' onClick={handleLogout}>
					Disconnect
				</button>
			)}
		</>
	);
};

const PageLayout = ({
	account,
	logOut,
	logIn,
	particle,
	provider,
	children,
}) => (
	<div className='container pb-12'>
		<div className='flex items-center justify-between pt-3 pb-16'>
			<div className='text-lg font-semibold'>Runaway betting</div>
			<div className='flex space-x-8'>
				<Link className='text-md' href='/'>
					Events
				</Link>
				<Link className='text-md' href={`/bets-history/${account}`}>
					Bets History
				</Link>
			</div>
			<ConnectButton
				logOut={logOut}
				logIn={logIn}
				particle={particle}
				provider={provider}
			/>
		</div>
		{children}
	</div>
);

export default function RootLayout({ children }) {
	const [clientProps, setClientProps] = useState();
	const particle = useMemo(() => {
		const pn = new ParticleNetwork(particleValue);
		return pn;
	}, []);
	const [provider, setProvider] = useState(null);
	const [account, setAccount, getLatestState] = useExtendedState(null);
	useEffect(() => {
		if (!particle) return;
		setClientProps({
			particle: particle,
			provider: provider,
			account: account,
			latestAccount: getLatestState,
			logIn: login,
			logOut: logout,
		});
	}, [particle, provider]);
	const login = async () => {
		particle.auth
			.login()
			.then((info) => {
				console.log('connect success', info);
				setAccount(particle.auth.wallet()?.public_address);
			})
			.catch((error) => {
				console.log('Error: ', error.message);
			});
		// particle.evm.personalSign(`0x${Buffer.from(msg).toString('hex')}`)

		const prov = new ethers.providers.Web3Provider(
			new ParticleProvider(particle.auth),
			'any'
		);

		setProvider(prov);
	};
	const logout = async () => {
		particle.auth
			.logout(true)
			.then((info) => {
				console.log('Disconnected', info);
				setAccount('');
			})
			.catch((error) => {
				console.log('Error: ', error.message);
			});

		setProvider(null);
	};
	return (
		<DAppProvider config={config}>
			<ClientContext.Provider value={clientProps}>
				<ApolloProvider client={apolloClient}>
					<PageLayout
						account={account}
						logOut={logout}
						logIn={login}
						particle={particle}
						provider={provider}
					>
						{children}
					</PageLayout>
				</ApolloProvider>
			</ClientContext.Provider>
		</DAppProvider>
	);
}
