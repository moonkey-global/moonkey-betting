'use client';
import dayjs from 'dayjs';
import { getMarketName, getSelectionName } from '@azuro-org/dictionaries';
import useBetsHistory from '@/hooks/useBetsHistory';
import useRedeemBet from '@/hooks/useRedeemBet';

const BetInfo = ({ data }) => {
	const {
		id,
		betId,
		amount,
		potentialPayout,
		status,
		isRedeemed,
		odds,
		createdAt,
		txHash,
		result,
		_conditions,
	} = data;
	const { redeem, isRedeeming } = useRedeemBet({ betId });
	// const isWin = outcome.outcomeId === outcome.condition.wonOutcome?.outcomeId
	const isWin = result === 'Won';
	const isResolved = status === 'Resolved';
	const isCanceled = status === 'Canceled';

	const marketName = getMarketName({
		outcomeId: _conditions[0].outcomesIds[0],
	});
	const selectionName = getSelectionName({
		outcomeId: _conditions[0].outcomesIds[0],
	});

	return (
		<div className='w-full py-4 px-6'>
			<div className='text-md text-gray-600'>
				{dayjs(+createdAt * 1000).format('DD MMMM YYYY HH:mm')}
			</div>
			<div className='grid grid-cols-4 mt-4 text-md'>
				<div>
					<div className='text-gray-400'>Market</div>
					<div className='mt-1 font-semibold'>{marketName}</div>
				</div>
				<div>
					<div className='text-gray-400'>Selection</div>
					<div className='mt-1 font-semibold'>{selectionName}</div>
				</div>
				<div>
					<div className='text-gray-400'>Odds</div>
					<div className='mt-1 font-semibold'>
						{parseFloat(odds).toFixed(4)}
					</div>
				</div>
				<div>
					<div className='text-gray-400'>Bet Amount</div>
					<div className='mt-1 font-semibold'>
						{+parseFloat(amount).toFixed(2)} USDT
					</div>
				</div>
			</div>
			<div className='grid grid-cols-4 mt-4 pt-3 text-md border-t border-gray-200'>
				<div>
					<div className='text-gray-400'>Possible Win</div>
					<div className='mt-1 font-semibold'>
						{+parseFloat(potentialPayout).toFixed(2)} USDT
					</div>
				</div>
				<div>
					<div className='text-gray-400'>Status</div>
					<div className='mt-1 font-semibold'>
						{isResolved ? (
							isWin ? (
								<span className='text-green-600'>Won</span>
							) : (
								<span className='text-gray-400'>Lost</span>
							)
						) : isCanceled ? (
							<span className='text-red-700'>Canceled</span>
						) : (
							<span className='text-yellow-500'>Pending</span>
						)}
					</div>
				</div>
				{(isWin || isCanceled) && (
					<div className='self-center'>
						<button className='button' disabled={isRedeeming} onClick={redeem}>
							{isRedeeming ? 'Redeeming...' : 'Redeem'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

const GameInfo = ({ game }) => (
	<div className='w-full py-4 px-6 bg-white rounded-xl shadow-xl'>
		<div className='flex justify-between text-md'>
			<span>{game.sport.name}</span>
			<span>{dayjs(game.startsAt * 1000).format('DD MMM HH:mm')}</span>
		</div>
		<div className='mt-1 text-md text-gray-400'>
			{game.league.country.name} &middot; {game.league.name}
		</div>
		<div className='mt-3 space-y-2'>
			{game.participants.map(({ image, name }) => (
				<div key={name} className='flex items-center'>
					<div className='flex items-center justify-center w-8 h-8 mr-2 border border-gray-300 rounded-full'>
						<img className='w-4 h-4' src={image} alt={name} />
					</div>
					<span className='text-md'>{name}</span>
				</div>
			))}
		</div>
	</div>
);

export default function BetsHistory({ address }) {
	const { loading, data } = useBetsHistory(address);
	if (!address) {
		return (
			<div className='mt-6 py-4 text-md text-center bg-red-200 rounded-md'>
				Please, connect wallet to see your bets history
			</div>
		);
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className='space-y-2'>
			{data?.bets.map((bet) => (
				<div
					key={bet.id}
					className='grid lg:grid-cols-[auto_minmax(400px,520px)] justify-items-start bg-gray-50 border border-gray-200 overflow-hidden rounded-xl'
				>
					<BetInfo data={bet} />
					<GameInfo game={bet._games[0]} />
				</div>
			))}
		</div>
	);
}
