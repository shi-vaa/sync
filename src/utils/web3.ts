import Web3 from 'web3';

export const getWeb3 = async () => {
  const POLYGON_RPC: string =
    process.env.POLYGON_RPC ||
    'https://speedy-nodes-nyc.moralis.io/61fac31e1c1f5ff3bf1058c6/polygon/mumbai';

  const polygonWeb3 = new Web3(new Web3.providers.HttpProvider(POLYGON_RPC));

  const web3 = new Web3();

  return { web3, polygonWeb3 };
};
