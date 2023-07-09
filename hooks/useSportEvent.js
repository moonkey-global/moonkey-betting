'use client';
// import { useRouter } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { aggregateOutcomesByMarkets } from '@azuro-org/toolkit';

const QUERY = `
  query Game($id: String!) {
    game(id: $id) {
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
      liquidityPool {
        address
      }
      conditions {
        conditionId
        status
        outcomes {
          id
          outcomeId
          currentOdds
        }
        core {
          address
          type
        }
      }
    }
  }
`;

export default function useSportEvent(query) {
	// const { query } = useRouter();
	const { loading, data } = useQuery(
		gql`
			${QUERY}
		`,
		{
			variables: {
				id: query,
			},
		}
	);

	let game;
	let markets;

	if (data?.game) {
		const { sport, league, participants, startsAt, liquidityPool, conditions } =
			data.game;

		game = { sport, league, participants, startsAt };

		markets = aggregateOutcomesByMarkets({
			lpAddress: liquidityPool.address,
			conditions,
		});
	}

	return {
		loading,
		game,
		markets,
	};
}
