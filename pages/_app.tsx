import React, {
  ReactElement, ReactNode, createContext, useMemo,
} from 'react';
import '../styles/globals.css';
import type { AppContext, AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { NextPage } from 'next';
import 'draft-js/dist/Draft.css';
import {
  // Chain,
  chain,
  Connector,
  defaultChains,
  defaultL2Chains,
  InjectedConnector,
  Provider,
} from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
// import dynamic from 'next/dynamic';
import {
  Configuration,
  ValidationApi,
} from '@questbook/service-validator-client';
import { MinimalWorkspace } from 'src/types';
import {
  ALL_SUPPORTED_CHAIN_IDS,
  // SupportedChainId,
} from 'src/constants/chains';
import App from 'next/app';
import { DefaultSeo } from 'next-seo';
import getSeo from 'src/utils/seo';
import { providers } from 'ethers';
import { CHAIN_INFO } from 'src/constants/chainInfo';
import Head from 'next/head';
import theme from '../src/theme';
import SubgraphClient from '../src/graphql/subgraph';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;

// Chains for connectors to support
// const chains = [...defaultChains, ...defaultL2Chains].filter(
//   (chain) => chain.name in ['mainnet', 'polygonMainnet'],
// );

// Pick chains
const chains = [
  ...defaultChains,
  ...defaultL2Chains,

  // commenting to only support rinkeby
  // CHAIN_INFO[SupportedChainId.HARMONY_TESTNET_S0] as Chain,
];

// commenting to only support rinkeby
// const defaultChain = chain.polygonMainnet;

const defaultChain = chain.rinkeby;
// Set up connectors
const connectors = () => [
  new InjectedConnector({
    chains,
    options: { shimDisconnect: true, shimChainChangedDisconnect: true },
  }),
  new WalletConnectConnector({
    options: {
      infuraId,
      qrcode: true,
    },
  }),
];

// Set up providers
type ProviderConfig = { chainId?: number; connector?: Connector };

const provider = ({ chainId }: ProviderConfig) => {
  const rpcUrl = CHAIN_INFO[chainId!]?.rpcUrls[0];
  if (!rpcUrl) {
    return new providers.JsonRpcProvider(
      CHAIN_INFO[defaultChain.id].rpcUrls[0],
      'any',
    );
  }
  return new providers.JsonRpcProvider(rpcUrl, 'any');
};

export const ApiClientsContext = createContext<{
  validatorApi: ValidationApi;
  workspace?: MinimalWorkspace;
  setWorkspace:(workspace?: MinimalWorkspace) => void;
  subgraphClients: { [chainId: string]: SubgraphClient };
} | null>(null);

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [workspace, setWorkspace] = React.useState<MinimalWorkspace>();

  const clients = useMemo(() => {
    const clientsObject = {} as { [chainId: string]: SubgraphClient };
    ALL_SUPPORTED_CHAIN_IDS.forEach((chnId) => {
      clientsObject[chnId] = new SubgraphClient(chnId);
    });
    return clientsObject;
  }, []);

  const validatorApi = useMemo(() => {
    const validatorConfiguration = new Configuration({
      basePath: 'https://api-grant-validator.questbook.app',
    });
    return new ValidationApi(validatorConfiguration);
  }, []);

  const apiClients = useMemo(
    () => ({
      validatorApi,
      workspace,
      setWorkspace: (newWorkspace?: MinimalWorkspace) => {
        if (newWorkspace) {
          localStorage.setItem('currentWorkspaceId', newWorkspace.id);
        } else {
          localStorage.setItem('currentWorkspaceId', 'undefined');
        }

        setWorkspace(newWorkspace);
      },
      subgraphClients: clients,
    }),
    [validatorApi, workspace, setWorkspace, clients],
  );

  const seo = getSeo();

  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <DefaultSeo {...seo} />
      <Head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N9KVED0HQZ" />
        <script
        // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '[Tracking ID]', { page_path: window.location.pathname });
            `,
          }}
        />
      </Head>
      <Provider autoConnect connectors={connectors} provider={provider}>
        <ApiClientsContext.Provider value={apiClients}>
          <ChakraProvider theme={theme}>
            {getLayout(<Component {...pageProps} />)}
          </ChakraProvider>
        </ApiClientsContext.Provider>
      </Provider>
    </>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  console.log('appProps', appProps);
  return { ...appProps };
};

// export default dynamic(() => Promise.resolve(MyApp), {
//   ssr: false,
// });
export default MyApp;
