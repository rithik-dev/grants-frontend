import {
  ApolloClient, InMemoryCache, HttpLink, gql,
} from '@apollo/client';
import config from '../constants/config';

class SubgraphClient {
  client: ApolloClient<any>;

  constructor() {
    const link = new HttpLink({ uri: config.subgraphUri });
    const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
    this.client = client;
  }

  // eslint-disable-next-line class-methods-use-this
  async waitForBlock(blockNumber: number) {
    // It's ok to start with minBlock at 0. The query will be served
    // using the latest block available. Setting minBlock to 0 is the
    // same as leaving out that argument.
    let minBlock = 0;

    while (minBlock < blockNumber) {
      // Schedule a promise that will be ready once
      // the next Ethereum block will likely be available.

      // average block time is 12-14 seconds
      const nextBlock = new Promise((f) => {
        setTimeout(f, 14000);
      });

      const query = `
      query {
        _meta(block: {number_gte: ${minBlock}}) {
          block {
            number
          }
        }
      }
      `;

      // eslint-disable-next-line no-await-in-loop
      const response = await this.client.query({
        query: gql(query),
      });
      // eslint-disable-next-line no-underscore-dangle
      minBlock = response.data._meta.block.number;
      console.log(minBlock);
      // Sleep to wait for the next block
      // eslint-disable-next-line no-await-in-loop
      await nextBlock;
    }
  }
}

export default SubgraphClient;
