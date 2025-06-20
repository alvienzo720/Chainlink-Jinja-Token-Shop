"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowRight, Coins, Zap } from "lucide-react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther, formatEther, formatUnits } from "viem";
import { ABI } from "../lib/abi";

// Contract configuration
const CONTRACT_ADDRESS = "0x7D06a309ff3ab52492DEAeE1FDEC14a9464b982C";

export default function TokenShop() {
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("0");
  const [isMounted, setIsMounted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: address,
  });

  // Use sendTransaction instead of writeContract
  const {
    sendTransaction,
    data: hash,
    isPending,
    error,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Read contract data
  const { data: tokenUsdPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "TOKEN_USD_PRICE",
  });

  const { data: minEthAmount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "MIN_ETH_AMOUNT",
  });

  const { data: tokenDecimals } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "TOKEN_DECIMALS",
  });

  const { data: ethPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getETHPrice",
  });

  // Calculate purchase data from contract
  const { data: purchaseData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "calculatePurchase",
    args: ethAmount ? [parseEther(ethAmount)] : undefined,
    query: {
      enabled: !!ethAmount && Number.parseFloat(ethAmount) > 0,
    },
  });

  // Convert contract values to usable formats
  const tokenPriceUsd = tokenUsdPrice
    ? Number(formatUnits(tokenUsdPrice, 18))
    : 2;
  const minEthRequired = minEthAmount
    ? Number(formatEther(minEthAmount))
    : 0.0001;
  const ethPriceUsd = ethPrice ? Number(formatUnits(ethPrice, 18)) : 3000;
  const decimals = tokenDecimals ? Number(tokenDecimals) : 18;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (purchaseData && Array.isArray(purchaseData) && purchaseData[0]) {
      const tokens = formatUnits(purchaseData[0], decimals);
      setTokenAmount(Number(tokens).toFixed(2)); // Format to 2 decimal places
    } else if (!ethAmount || Number.parseFloat(ethAmount) <= 0) {
      setTokenAmount("0");
    }
  }, [purchaseData, ethAmount, decimals]);

  const handlePurchase = async () => {
    setFormError(null);

    if (!ethAmount || Number.parseFloat(ethAmount) <= 0) {
      setFormError("Please enter a valid ETH amount");
      return;
    }

    if (Number.parseFloat(ethAmount) < minEthRequired) {
      setFormError(`Minimum purchase is ${minEthRequired} ETH`);
      return;
    }

    try {
      console.log("Attempting to send transaction...");
      await sendTransaction({
        to: CONTRACT_ADDRESS,
        value: parseEther(ethAmount),
      });
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  const connectWallet = () => {
    connect({ connector: injected() });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-blue-300 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-black mb-4 transform -rotate-1">
            JINJA TOKEN SHOP
          </h1>
          <p className="text-xl font-bold text-gray-800 bg-white px-4 py-2 inline-block border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            Send ETH → Get Tokens 🚀
          </p>
        </div>
        {/* Main Card */}
        <Card className="border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 border-b-8 border-black">
            <CardTitle className="text-3xl font-black text-black flex items-center gap-3">
              <Coins className="w-8 h-8" />
              Buy Tokens
            </CardTitle>
            <CardDescription className="text-lg font-bold text-gray-800">
              ${tokenPriceUsd.toFixed(2)} per token • Minimum {minEthRequired}{" "}
              ETH
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Wallet Connection */}
            {!isConnected ? (
              <div className="text-center space-y-6">
                <div className="text-6xl">🦊</div>
                <Button
                  onClick={connectWallet}
                  className="bg-orange-400 hover:bg-orange-500 text-black font-black text-xl px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <Wallet className="w-6 h-6 mr-3" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Wallet Info */}
                <div className="bg-green-200 border-4 border-black p-6 transform rotate-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black text-lg">Connected Wallet</p>
                      <p className="font-mono text-sm text-gray-700">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">Balance</p>
                      <p className="font-mono text-sm text-gray-700">
                        {balance
                          ? Number.parseFloat(
                              formatEther(balance.value)
                            ).toFixed(4)
                          : "0"}{" "}
                        ETH
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => disconnect()}
                    variant="outline"
                    className="mt-4 border-2 border-black bg-white text-black font-bold hover:bg-gray-100"
                  >
                    Disconnect
                  </Button>
                </div>
                {/* Contract Info Display */}
                <div className="bg-purple-200 border-4 border-black p-4 transform rotate-1">
                  <p className="font-black text-lg mb-2">Contract Info</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-bold">ETH Price:</p>
                      <p>${ethPriceUsd.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-bold">Token Price:</p>
                      <p>${tokenPriceUsd.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                {/* Purchase Form */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="eth-amount" className="text-xl font-black">
                      ETH Amount
                    </Label>
                    <Input
                      id="eth-amount"
                      type="number"
                      step="0.0001"
                      min={minEthRequired}
                      placeholder={minEthRequired.toString()}
                      value={ethAmount}
                      onChange={(e) => setEthAmount(e.target.value)}
                      className="text-2xl font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    />
                  </div>
                  {/* Conversion Display */}
                  <div className="bg-blue-200 border-4 border-black p-6 transform -rotate-1">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="font-black text-lg">You Send</p>
                        <p className="text-2xl font-black">
                          {ethAmount || "0"} ETH
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          ≈ $
                          {ethAmount
                            ? (
                                Number.parseFloat(ethAmount) * ethPriceUsd
                              ).toFixed(2)
                            : "0"}
                        </p>
                      </div>
                      <ArrowRight className="w-8 h-8 font-black" />
                      <div className="text-center">
                        <p className="font-black text-lg">You Get</p>
                        <p className="text-2xl font-black text-green-600">
                          {tokenAmount} TOKENS
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          @ ${tokenPriceUsd.toFixed(2)} per token
                        </p>
                        {purchaseData &&
                          Array.isArray(purchaseData) &&
                          purchaseData[1] && (
                            <p className="text-xs text-gray-600">
                              USD Value: $
                              {(Number(purchaseData[1]) / 100).toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                  {/* Form validation error */}
                  {formError && (
                    <div className="bg-red-200 border-4 border-black p-4 transform -rotate-1">
                      <p className="font-black text-red-800">Error:</p>
                      <p className="text-sm">{formError}</p>
                    </div>
                  )}
                  {/* Purchase Button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={
                      !ethAmount ||
                      Number.parseFloat(ethAmount) < minEthRequired ||
                      isPending ||
                      isConfirming
                    }
                    className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-black font-black text-2xl py-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Zap className="w-6 h-6 mr-3 animate-spin" />
                        Sending Transaction...
                      </>
                    ) : isConfirming ? (
                      <>
                        <Zap className="w-6 h-6 mr-3 animate-pulse" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 mr-3" />
                        Buy Tokens
                      </>
                    )}
                  </Button>
                  {/* Transaction Status */}
                  {hash && (
                    <div className="bg-yellow-200 border-4 border-black p-4 transform rotate-1">
                      <p className="font-black">Transaction Hash:</p>
                      <p className="font-mono text-sm break-all">{hash}</p>
                      {isConfirmed && (
                        <p className="text-green-600 font-black mt-2">
                          ✅ Transaction Confirmed!
                        </p>
                      )}
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-200 border-4 border-black p-4 transform -rotate-1">
                      <p className="font-black text-red-800">Error:</p>
                      <p className="text-sm">{error.message}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-lg font-bold text-black bg-white px-4 py-2 inline-block border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            Powered by Ethereum & Chainlink 🔗
          </p>
        </div>
      </div>
    </div>
  );
}
