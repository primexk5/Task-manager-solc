import React from 'react';
import { ethers } from 'ethers';

interface ContractSetupProps {
  contractAddress: string;
}

export function ContractSetup({ contractAddress }: ContractSetupProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        Contract
      </h2>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-500">Address</label>
        {ethers.isAddress(contractAddress) ? (
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-mono text-teal-600 break-all hover:underline"
          >
            {contractAddress}
          </a>
        ) : (
          <p className="text-sm text-red-600">
            NEXT_PUBLIC_CONTRACT_ADDRESS is not set or invalid. Add it to frontend/.env.local.
          </p>
        )}
      </div>
    </div>
  );
}
