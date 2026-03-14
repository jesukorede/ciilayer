import dotenv from "dotenv";

dotenv.config();

import { Client, PrivateKey, TopicCreateTransaction } from "@hashgraph/sdk";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const accountId = required("HEDERA_ACCOUNT_ID");
  const privateKey = required("HEDERA_PRIVATE_KEY");

  const client = Client.forTestnet().setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));

  const jobTopicTx = await new TopicCreateTransaction().setTopicMemo("CiiLayer Job Activity").execute(client);
  const jobTopicReceipt = await jobTopicTx.getReceipt(client);
  const jobTopicId = jobTopicReceipt.topicId;

  const machineTopicTx = await new TopicCreateTransaction().setTopicMemo("CiiLayer Machine Activity").execute(client);
  const machineTopicReceipt = await machineTopicTx.getReceipt(client);
  const machineTopicId = machineTopicReceipt.topicId;

  // eslint-disable-next-line no-console
  console.log("Created topics:");
  // eslint-disable-next-line no-console
  console.log("HEDERA_JOB_TOPIC_ID=", String(jobTopicId));
  // eslint-disable-next-line no-console
  console.log("HEDERA_MACHINE_TOPIC_ID=", String(machineTopicId));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
