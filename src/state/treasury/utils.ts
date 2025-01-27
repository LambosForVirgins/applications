import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { VestingAccount, VestingSchedule, VestingStatus } from "./types";
import { isPast } from "date-fns/isPast";

export const mergeAndSortSchedules = (
  existingSchedules: VestingSchedule[] = [],
  newSchedules: VestingSchedule[] = []
): VestingSchedule[] => {
  return [...existingSchedules, ...newSchedules]
    .reduce<VestingSchedule[]>((acc, schedule) => {
      acc.push(schedule);
      return acc;
    }, [])
    .sort((a, b) => a.releaseTime.getTime() - b.releaseTime.getTime());
};

export class Schedule {
  // Release time in unix timestamp
  releaseTime!: Numberu64;
  amount!: Numberu64;

  constructor(releaseTime: Numberu64, amount: Numberu64) {
    this.releaseTime = releaseTime;
    this.amount = amount;
  }

  public toBuffer(): Buffer {
    return Buffer.concat([this.releaseTime.toBuffer(), this.amount.toBuffer()]);
  }

  static fromBuffer(buf: Buffer): Schedule {
    const releaseTime: Numberu64 = Numberu64.fromBuffer(buf.slice(0, 8));
    const amount: Numberu64 = Numberu64.fromBuffer(buf.slice(8, 16));
    return new Schedule(releaseTime, amount);
  }
}

export class VestingScheduleHeader {
  destinationAddress!: PublicKey;
  mintAddress!: PublicKey;
  isInitialized!: boolean;

  constructor(
    destinationAddress: PublicKey,
    mintAddress: PublicKey,
    isInitialized: boolean
  ) {
    this.destinationAddress = destinationAddress;
    this.mintAddress = mintAddress;
    this.isInitialized = isInitialized;
  }

  static fromBuffer(buf: Buffer): VestingScheduleHeader {
    const destinationAddress = new PublicKey(buf.slice(0, 32));
    const mintAddress = new PublicKey(buf.slice(32, 64));
    const isInitialized = buf[64] == 1;
    const header: VestingScheduleHeader = {
      destinationAddress,
      mintAddress,
      isInitialized,
    };
    return header;
  }
}

export class ContractInfo {
  destinationAddress!: PublicKey;
  mintAddress!: PublicKey;
  schedules!: Array<Schedule>;

  constructor(
    destinationAddress: PublicKey,
    mintAddress: PublicKey,
    schedules: Array<Schedule>
  ) {
    this.destinationAddress = destinationAddress;
    this.mintAddress = mintAddress;
    this.schedules = schedules;
  }

  static fromBuffer(buf: Buffer): ContractInfo | undefined {
    const header = VestingScheduleHeader.fromBuffer(buf.slice(0, 65));
    if (!header.isInitialized) {
      return undefined;
    }
    const schedules: Array<Schedule> = [];
    for (let i = 65; i < buf.length; i += 16) {
      schedules.push(Schedule.fromBuffer(buf.slice(i, i + 16)));
    }
    return new ContractInfo(
      header.destinationAddress,
      header.mintAddress,
      schedules
    );
  }

  toJSON(): VestingAccount {
    return {
      destinationAddress: this.destinationAddress.toBase58(),
      mintAddress: this.mintAddress.toBase58(),
      schedules: this.schedules.map((s) => {
        const amount = s.amount.toNumber() / 1_000_000_000,
          releaseTime = new Date(s.releaseTime.toNumber() * 1000);

        return {
          key: `${this.destinationAddress.toBase58()}:${s.releaseTime.toString()}`,
          releaseTime,
          amount,
          status:
            amount > 0
              ? isPast(releaseTime)
                ? VestingStatus.Pending
                : VestingStatus.Active
              : VestingStatus.Completed,
        };
      }),
    };
  }
}

export class Numberu64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      return b;
    }
    if (b.length > 8) {
      throw new Error("Numberu64 too large");
    }

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): any {
    if (buffer.length !== 8) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }

    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  }
}

export class Numberu32 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 4) {
      return b;
    }
    if (b.length > 4) {
      throw new Error("Numberu32 too large");
    }

    const zeroPad = Buffer.alloc(4);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu32 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): any {
    if (buffer.length !== 4) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }

    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  }
}
