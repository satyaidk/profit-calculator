"use client"

import { useState, useEffect } from "react"
import { WalletConnector } from "@/components/wallet-connector"
import { ProfitCalculator } from "@/components/profit-calculator"
import { Card } from "@/components/ui/card"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2"> Crypto Profit Calculator</h1>
          <p className="text-slate-400">Estimate your potential profits with precision</p>
        </div>

        {/* Wallet Connection Card */}
        <div className="mb-8 flex justify-center">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <div className="p-6">
              <WalletConnector
                onConnect={(address) => {
                  setWalletAddress(address)
                  setIsConnected(true)
                }}
                onDisconnect={() => {
                  setWalletAddress(null)
                  setIsConnected(false)
                }}
              />
            </div>
          </Card>
        </div>

        {/* Main Content */}
        {isConnected && walletAddress ? (
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
              <div className="p-8">
                <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-400">Connected Wallet</p>
                  <p className="text-white font-mono text-sm break-all">{walletAddress}</p>
                </div>
                <ProfitCalculator />
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700">
              <div className="p-8 text-center">
                <p className="text-slate-400 mb-4">Connect your wallet to start calculating profits</p>
                <div className="text-4xl mb-4">🔐</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
