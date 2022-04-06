export class AddEventDTO {
  topic: string;
  projectName: string;
  chain_id: string;
  contract_address: string;
  webhook_url: string;
  abi: object;
  sync_historical_data: boolean = false;
}
