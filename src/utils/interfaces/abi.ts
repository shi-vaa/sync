export interface IAbi {
  anonymous: boolean;
  inputs: IAbiArgs[];
  type: abiType;
  name: string;
}

interface IAbiArgs {
  indexed: boolean;
  internalType: argType;
  name: string;
  type: argType;
}

enum argType {
  address = 'address',
  uint256 = 'uint256',
  bool = 'bool',
}

export enum abiType {
  constructor = 'constructor',
  event = 'event',
}
