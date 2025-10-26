"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalculationResult {
  currentValue: number
  futureValue: number
  profit: number
  percentageGain: number
}

const STORAGE_KEY = "crypto_calculator_inputs"

export function ProfitCalculator() {
  const [tokenName, setTokenName] = useState("")
  const [holdings, setHoldings] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setTokenName(data.tokenName || "")
        setHoldings(data.holdings || "")
        setCurrentPrice(data.currentPrice || "")
        setTargetPrice(data.targetPrice || "")
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }
  }, [])

  // Save to local storage whenever inputs change
  useEffect(() => {
    const data = { tokenName, holdings, currentPrice, targetPrice }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [tokenName, holdings, currentPrice, targetPrice])

  const fetchTokenPrice = async () => {
    if (!tokenName.trim()) {
      setError("Please enter a token name")
      return
    }

    setIsLoadingPrice(true)
    setError(null)

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenName.toLowerCase()}&vs_currencies=usd`,
      )
      const data = await response.json()

      if (data[tokenName.toLowerCase()]?.usd) {
        const price = data[tokenName.toLowerCase()].usd
        setCurrentPrice(price.toString())
      } else {
        setError(`Token "${tokenName}" not found. Please check the name.`)
      }
    } catch (err) {
      setError("Failed to fetch token price. Please try again.")
      console.error("Price fetch error:", err)
    } finally {
      setIsLoadingPrice(false)
    }
  }

  const calculateProfit = () => {
    setError(null)
    setResult(null)

    // Validation
    if (!tokenName.trim()) {
      setError("Please enter a token name")
      return
    }

    const holdingsNum = Number.parseFloat(holdings)
    const currentPriceNum = Number.parseFloat(currentPrice)
    const targetPriceNum = Number.parseFloat(targetPrice)

    if (isNaN(holdingsNum) || holdingsNum <= 0) {
      setError("Please enter a valid holdings amount")
      return
    }

    if (isNaN(currentPriceNum) || currentPriceNum <= 0) {
      setError("Please enter a valid current price")
      return
    }

    if (isNaN(targetPriceNum) || targetPriceNum <= 0) {
      setError("Please enter a valid target price")
      return
    }

    // Calculate
    const currentValue = holdingsNum * currentPriceNum
    const futureValue = holdingsNum * targetPriceNum
    const profit = futureValue - currentValue
    const percentageGain = (profit / currentValue) * 100

    setResult({
      currentValue,
      futureValue,
      profit,
      percentageGain,
    })
  }

  const resetCalculator = () => {
    setTokenName("")
    setHoldings("")
    setCurrentPrice("")
    setTargetPrice("")
    setResult(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="token-name" className="text-slate-300">
            Token Name
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="token-name"
              placeholder="e.g., ethereum, bitcoin"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={fetchTokenPrice}
              disabled={isLoadingPrice}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 whitespace-nowrap bg-transparent"
            >
              {isLoadingPrice ? "Loading..." : "Fetch Price"}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="holdings" className="text-slate-300">
            Holdings (Amount)
          </Label>
          <Input
            id="holdings"
            type="number"
            placeholder="e.g., 0.6514"
            value={holdings}
            onChange={(e) => setHoldings(e.target.value)}
            step="0.0001"
            className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-price" className="text-slate-300">
              Current Price ($)
            </Label>
            <Input
              id="current-price"
              type="number"
              placeholder="e.g., 187.41"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              step="0.01"
              className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label htmlFor="target-price" className="text-slate-300">
              Target Price ($)
            </Label>
            <Input
              id="target-price"
              type="number"
              placeholder="e.g., 200"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              step="0.01"
              className="mt-2 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={calculateProfit} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          Calculate Profit 🚀
        </Button>
        <Button
          onClick={resetCalculator}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          Reset
        </Button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-3 p-6 bg-slate-700 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Calculation Results</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-600 rounded">
              <p className="text-xs text-slate-400 mb-1">Current Value</p>
              <p className="text-lg font-bold text-white">${result.currentValue.toFixed(2)}</p>
            </div>

            <div className="p-3 bg-slate-600 rounded">
              <p className="text-xs text-slate-400 mb-1">Future Value</p>
              <p className="text-lg font-bold text-white">${result.futureValue.toFixed(2)}</p>
            </div>

            <div className={`p-3 rounded ${result.profit >= 0 ? "bg-green-900/30" : "bg-red-900/30"}`}>
              <p className="text-xs text-slate-400 mb-1">Profit/Loss</p>
              <p className={`text-lg font-bold ${result.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${result.profit.toFixed(2)}
              </p>
            </div>

            <div className={`p-3 rounded ${result.percentageGain >= 0 ? "bg-green-900/30" : "bg-red-900/30"}`}>
              <p className="text-xs text-slate-400 mb-1">Percentage Gain</p>
              <p className={`text-lg font-bold ${result.percentageGain >= 0 ? "text-green-400" : "text-red-400"}`}>
                {result.percentageGain.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-600 rounded text-sm text-slate-300">
            <p>
              If {tokenName} reaches <span className="font-semibold text-white">${targetPrice}</span>, your{" "}
              <span className="font-semibold text-white">{holdings}</span> tokens will be worth{" "}
              <span className="font-semibold text-white">${result.futureValue.toFixed(2)}</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
