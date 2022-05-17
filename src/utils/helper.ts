import { ethers } from 'ethers';
import { v4 } from 'uuid';
import { network } from './interfaces/network';

export function createContract(
  contract_address: string,
  topic: string,
  provider: any,
) {
  return new ethers.Contract(contract_address, [topic], provider);
}

export function configureProvider(rpc: string, network?: network) {
  return network
    ? new ethers.providers.JsonRpcProvider(rpc, network)
    : new ethers.providers.JsonRpcProvider(rpc);
}

export function generateApiKey() {
  return v4();
}
