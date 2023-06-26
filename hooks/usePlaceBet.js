'use client';
import { useState, useContext, useEffect } from 'react';
import * as ethers from 'ethers';
import {
	Polygon,
	AuroraTestnet,
	useEthers,
	useTokenBalance,
	useTokenAllowance,
	useContractFunction,
	ERC20Interface,
} from '@usedapp/core';
import { LP_ABI } from '@/lib/lpabi';
import {
	USDT_DECIMALS,
	USDT_ADDRESS,
	LP_ADDRESS,
	CORE_ADDRESS,
	affiliate,
} from '@/lib/constants';
import { ClientContext } from '@/components/ClientProvider';

const USDTContract = new ethers.Contract(USDT_ADDRESS, ERC20Interface);
const lpContract = new ethers.Contract(LP_ADDRESS, LP_ABI);

export default function usePlaceBet({ outcome, onBetPlace }) {
	const { account, particle, provider, latestAccount } =
		useContext(ClientContext);
	const [amount, setAmount] = useState('');
	const [balance, setBalance] = useState('0');
	// const { account, chainId } = useEthers();

	// const isRightChain = chainId === Polygon.chainId;
	// const rawBalance = useTokenBalance(USDT_ADDRESS, account);

	const getTokenBalance = async () => {
		try {
			if (!latestAccount) return console.log('Missing account');
			const prov = new ethers.providers.JsonRpcProvider(
				'https://testnet.aurora.dev'
			);
			console.log(account);
			const USDTCont = new ethers.Contract(
				USDT_ADDRESS,
				['function balanceOf(address owner) view returns (uint256)'],
				prov
			);
			const rawBalance = await USDTCont.callStatic.balanceOf(latestAccount());
			console.log(rawBalance);
			setBalance(ethers.utils.formatUnits(rawBalance, USDT_DECIMALS));
		} catch (error) {
			console.error(error);
			//setBalance('0.0');
		}
	};
	useEffect(() => {
		getTokenBalance();

		return () => {};
	}, [latestAccount]);

	// const balance = rawBalance
	// 	? ethers.utils.formatUnits(rawBalance, USDT_DECIMALS)
	// 	: '0';
	const makeAllowance = async () => {
		try {
			if (!provider) return console.log('Missing provider');
			const abiResponse = await fetch('/ERC20.json');
			const abi = await abiResponse.json();

			let USDcontract = new ethers.Contract(
				USDT_ADDRESS,
				abi.abi,
				provider.getSigner()
			);
			let amt = ethers.constants.MaxUint256;
			let txn = await USDcontract.approve(LP_ADDRESS, amt);
			console.log('Approval: ', txn);
		} catch (error) {
			console.error(error);
		}
	};

	const rawAllowance = useTokenAllowance(USDT_ADDRESS, account, LP_ADDRESS);
	const isAllowanceFetching = rawAllowance === undefined;
	const allowance =
		rawAllowance && ethers.utils.formatUnits(rawAllowance, USDT_DECIMALS);
	const isApproveRequired = +allowance < +amount;

	const { state: approveState, send: _approve } = useContractFunction(
		USDTContract,
		'approve',
		{ transactionName: 'Approve' }
	);
	const isApproving =
		approveState.status === 'PendingSignature' ||
		approveState.status === 'Mining';

	const approve = () => {
		// to prevent the need to ask for approval before each bet, the user will be asked to approve a "maximum" amount
		const amount = ethers.constants.MaxUint256;

		_approve(LP_ADDRESS, amount);
	};

	const makeBet = async () => {
		try {
			if (!provider) return console.log('Missing provider');

			let LPcontract = new ethers.Contract(
				LP_ADDRESS,
				LP_ABI,
				provider.getSigner()
			);
			const { conditionId, outcomeId, odds } = outcome;

			const slippage = 5; // 5%
			const minOdds = 1 + ((odds - 1) * (100 - slippage)) / 100; // the minimum value at which a bet should be made
			const oddsDecimals = 12; // current protocol version odds has 12 decimals
			const rawMinOdds = ethers.utils.parseUnits(
				minOdds.toFixed(oddsDecimals),
				oddsDecimals
			);
			const rawAmount = ethers.utils.parseUnits(amount, USDT_DECIMALS);
			const deadline = Math.floor(Date.now() / 1000) + 2000; // the time (in seconds) within which the transaction should be submitted

			const data = ethers.utils.defaultAbiCoder.encode(
				['uint256', 'uint64', 'uint64'],
				[conditionId, outcomeId, rawMinOdds]
			);

			let txn = await LPcontract.bet(CORE_ADDRESS, rawAmount, deadline, {
				affiliate,
				data,
				gasLimit: 2100,
			});
			console.log('Bet: ', txn);
		} catch (error) {
			console.error(error);
		}
	};

	const { send: _placeBet } = useContractFunction(lpContract, 'bet', {
		transactionName: 'Bet',
	});
	const placeBet = () => {
		const { conditionId, outcomeId, odds } = outcome;

		const slippage = 5; // 5%
		const minOdds = 1 + ((odds - 1) * (100 - slippage)) / 100; // the minimum value at which a bet should be made
		const oddsDecimals = 12; // current protocol version odds has 12 decimals
		const rawMinOdds = ethers.utils.parseUnits(
			minOdds.toFixed(oddsDecimals),
			oddsDecimals
		);
		const rawAmount = ethers.utils.parseUnits(amount, USDT_DECIMALS);
		const deadline = Math.floor(Date.now() / 1000) + 2000; // the time (in seconds) within which the transaction should be submitted

		const data = ethers.utils.defaultAbiCoder.encode(
			['uint256', 'uint64', 'uint64'],
			[conditionId, outcomeId, rawMinOdds]
		);

		_placeBet(CORE_ADDRESS, rawAmount, deadline, {
			affiliate,
			data,
		});

		onBetPlace();
	};

	return {
		// isRightChain,
		balance,
		amount,
		setAmount,
		isAllowanceFetching,
		isApproveRequired,
		approve,
		isApproving,
		placeBet,
		getTokenBalance,
		makeAllowance,
		makeBet,
	};
}
