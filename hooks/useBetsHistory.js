'use client';
// import { useEthers } from '@usedapp/core'
import { gql, useQuery } from '@apollo/client';
import { ClientContext } from '@/components/ClientProvider';
import { useContext } from 'react';

const QUERY = `
  query BetsHistory($first: Int, $where: Bet_filter!) {
    bets(
      first: $first,
      orderBy: createdBlockTimestamp,
      orderDirection: desc,
      where: $where,
      subgraphError: allow
    ) {
      id
      betId
      amount
      potentialPayout
      status
      isRedeemed
      odds
      createdAt: createdBlockTimestamp
      txHash: createdTxHash
      result
      _conditions {
        id
        conditionId
        outcomesIds
        wonOutcome {
          outcomeId
        }
        core {
          address
          liquidityPool {
            address
          }
        }
      }
      _games {
        id
        sport {
          name
        }
        league {
          name
          country {
            name
          }
        }
        participants {
          name
          image
        }
        startsAt
      }
    }
  }
`;

export default function useBetsHistory(account) {
	//   const { account } = useEthers()
	// const { latestAccount, account } = useContext(ClientContext);

	return useQuery(
		gql`
			${QUERY}
		`,
		{
			variables: {
				first: 10,
				where: {
					actor: account?.toLowerCase(),
				},
			},
			skip: !account,
		}
	);
}
