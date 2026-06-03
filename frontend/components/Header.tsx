import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-6 bg-white shadow-sm rounded-2xl border border-slate-200/60">
      <div>
        <h1 className="text-3xl font-extrabold bg-linear-to-r from-teal-500 to-teal-400 bg-clip-text text-transparent">
          Web3 Task Manager
        </h1>
        <p className="text-sm text-slate-500 mt-1">Decentralized productivity</p>
      </div>

      <div className="mt-4 md:mt-0">
        <ConnectButton />
      </div>
    </header>
  );
}
