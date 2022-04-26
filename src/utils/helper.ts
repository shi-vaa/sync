import { ethers } from 'ethers';
import { FallbackProvider } from '@ethersproject/providers';

export function createContract(
  contract_address: string,
  topic: string,
  provider: any,
) {
  return new ethers.Contract(contract_address, [topic], provider);
}

export function configureProvider(rpc: string) {
  return new ethers.providers.JsonRpcProvider(
    rpc,
    //   , {
    //   name: 'mumbai',
    //   chainId: 80001,
    // }
  );
}
