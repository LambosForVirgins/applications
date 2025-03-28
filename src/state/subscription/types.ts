export enum MemberTierValues {
  Virgin = 1,
  Baby = 3000,
  Super = 100_000,
  Mega = 2_000_000,
  Giga = 5_000_000,
}

export enum MemberTier {
  Virgin = 0,
  BabyChad,
  SuperChad,
  MegaChad,
  GigaChad,
}

export enum MemberStatus {
  Pending = 0,
  Active,
  Paused,
  Excluded,
  Suspended,
}

export type Transaction =
  | {
      key: string;
      type: "withdraw";
      amount: number;
      timeReleased: Date;
    }
  | {
      key: string;
      type: "deposit";
      amount: number;
      timeCreated: Date;
      timeMatured: Date;
    };

export type Member = {
  status: MemberStatus;
  tier: MemberTier;
  totalAmount: number;
  totalMatured: number;
  totalReleased: number;
  totalRewards: number;
  timeCreated: Date;
  timeRewarded: Date | null;
  slots: Transaction[];
};
