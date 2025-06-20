"use client";

import dynamic from "next/dynamic";
import { Coins } from "lucide-react";

// Dynamically import the TokenShop component with no SSR
const TokenShopComponent = dynamic(() => import("../components/token-shop"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-blue-300 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-black mb-4 transform -rotate-1">
            JINJA TOKEN SHOP
          </h1>
          <p className="text-xl font-bold text-gray-800 bg-white px-4 py-2 inline-block border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            Loading Web3 Interface... 🚀
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="bg-white border-8 border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="w-16 h-16 animate-spin mx-auto mb-4" />
            <p className="text-2xl font-black text-center">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <TokenShopComponent />;
}
