export class AddEventDTO {
  name: string;
  topic: string;
  projectId: string;
  chain_id: number;
  contract_address: string;
  webhook_url: string;
  fromBlock: number;
  blockRange: number;
  abi: object;
  sync_historical_data = false;
}
