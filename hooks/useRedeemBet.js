'use client';
import * as ethers from 'ethers';
import { useContractFunction } from '@usedapp/core';
import { LP_ADDRESS, CORE_ADDRESS } from '@/lib/constants';
import { LP_ABI } from '@/lib/lpabi';
import { ClientContext } from '@/components/ClientProvider';
import { useState, useContext, useEffect } from 'react';

const lpContract = new ethers.Contract(LP_ADDRESS, LP_ABI);

export default function useRedeemBet({ betId }) {
	const { account, provider, latestAccount } = useContext(ClientContext);
	const redeem = async () => {
		if (!provider) return console.log('Missing provider');

		let LPcontract = new ethers.Contract(
			LP_ADDRESS,
			LP_ABI,
			provider.getSigner()
		);

		let txn = await LPcontract.withdrawPayout(CORE_ADDRESS, betId, false, {
			gasLimit: 2100,
		});
		console.log('withdrawPayout: ', txn);
	};
	const { state, send } = useContractFunction(lpContract, 'withdrawPayout', {
		transactionName: 'Approve',
	});

	// const redeem = () => {
	// 	send(CORE_ADDRESS, betId, false);
	// };

	return {
		redeem,
		isRedeeming:
			state.status === 'PendingSignature' || state.status === 'Mining',
	};
}
