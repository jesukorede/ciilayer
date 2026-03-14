import { type Address, keccak256, stringToHex } from "viem";
import { writeContract } from "viem/actions";

import { getWalletClient } from "./wallet";

const REGISTRY_ABI = [
  {
    type: "function",
    name: "recordJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "bytes32" },
      { name: "jobHash", type: "bytes32" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "acceptJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "bytes32" }],
    outputs: []
  },
  {
    type: "function",
    name: "confirmCompletion",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "bytes32" }],
    outputs: []
  }
] as const;

function getRegistryAddress(): Address | null {
  const addr =
    process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ADDRESS ??
    process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ??
    "";

  if (!addr) return null;
  if (!addr.startsWith("0x")) return null;
  return addr as Address;
}

export function isRegistryEnabled(): boolean {
  return Boolean(getRegistryAddress());
}

function toJobIdBytes32(jobId: string) {
  return keccak256(stringToHex(jobId));
}

function toJobHashBytes32(job: {
  id: string;
  title: string;
  description: string;
  requiredSkills?: string[];
  createdBy?: string;
  createdAt?: string;
}) {
  const payload = {
    id: job.id,
    title: job.title,
    description: job.description,
    requiredSkills: job.requiredSkills ?? [],
    createdBy: job.createdBy ?? null,
    createdAt: job.createdAt ?? null
  };
  return keccak256(stringToHex(JSON.stringify(payload)));
}

export async function recordJobOnchain(job: {
  id: string;
  title: string;
  description: string;
  requiredSkills?: string[];
  createdBy?: string;
  createdAt?: string;
}): Promise<string | null> {
  const address = getRegistryAddress();
  if (!address) return null;

  const client = await getWalletClient();
  if (!client) return null;

  const [account] = await client.requestAddresses();
  const jobId32 = toJobIdBytes32(job.id);
  const jobHash32 = toJobHashBytes32(job);

  return await writeContract(client, {
    address,
    abi: REGISTRY_ABI,
    functionName: "recordJob",
    args: [jobId32, jobHash32],
    account,
    chain: client.chain ?? null
  });
}

export async function acceptJobOnchain(jobId: string): Promise<string | null> {
  const address = getRegistryAddress();
  if (!address) return null;

  const client = await getWalletClient();
  if (!client) return null;

  const [account] = await client.requestAddresses();
  const jobId32 = toJobIdBytes32(jobId);

  return await writeContract(client, {
    address,
    abi: REGISTRY_ABI,
    functionName: "acceptJob",
    args: [jobId32],
    account,
    chain: client.chain ?? null
  });
}

export async function confirmCompletionOnchain(jobId: string): Promise<string | null> {
  const address = getRegistryAddress();
  if (!address) return null;

  const client = await getWalletClient();
  if (!client) return null;

  const [account] = await client.requestAddresses();
  const jobId32 = toJobIdBytes32(jobId);

  return await writeContract(client, {
    address,
    abi: REGISTRY_ABI,
    functionName: "confirmCompletion",
    args: [jobId32],
    account,
    chain: client.chain ?? null
  });
}