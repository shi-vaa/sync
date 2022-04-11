export class AddEventDTO {
  name: string;
  topic: string;
  projectId: string;
  chain_id: number;
  contract_address: string;
  webhook_url: string;
  abi: object;
  sync_historical_data = false;
}
