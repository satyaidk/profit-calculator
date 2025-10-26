"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface WalletConnectorProps {
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          onConnect(accounts[0])
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setError("MetaMask or Web3 wallet not detected. Please install one.")
        setIsLoading(false)
        return
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const userAddress = accounts[0]
        setAddress(userAddress)
        setIsConnected(true)
        onConnect(userAddress)
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected by user")
      } else {
        setError("Failed to connect wallet")
      }
      console.error("Wallet connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setError(null)
    onDisconnect()
  }

  return (
    <div className="space-y-4">
      {isConnected && address ? (
        <div className="space-y-4">
          <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
            <p className="text-sm text-green-400 mb-2">✓ Wallet Connected</p>
            <p className="text-xs text-green-300 font-mono break-all">{address}</p>
          </div>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          <Button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
          <p className="text-xs text-slate-500 text-center">Supports MetaMask and Web3-compatible wallets</p>
        </div>
      )}
    </div>
  )
}
