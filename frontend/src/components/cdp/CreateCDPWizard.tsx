import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCDP } from '../../services/api'

interface CreateCDPForm {
  collateralType: string
  collateralAmount: string
  debtAmount: string
  owner: string
}

interface CreateCDPWizardProps {
  onClose: () => void
}

const steps = [
  { id: 1, title: 'Wallet Setup', description: 'Configure your wallet address' },
  { id: 2, title: 'Collateral', description: 'Choose and deposit collateral' },
  { id: 3, title: 'Debt Position', description: 'Set your debt amount' },
  { id: 4, title: 'Review', description: 'Confirm your CDP details' }
]

export const CreateCDPWizard: React.FC<CreateCDPWizardProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData] = useState<Partial<CreateCDPForm>>({
    owner: '0x742d35Cc6634C0532925a3b8D',
    collateralType: 'WETH',
    collateralAmount: '2.5',
    debtAmount: '3000'
  })

  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<CreateCDPForm>({
    defaultValues: formData
  })

  const createCDPMutation = useMutation(createCDP, {
    onSuccess: () => {
      queryClient.invalidateQueries(['cdps'])
      onClose()
    }
  })

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: CreateCDPForm) => {
    // Convert to Wei for API
    const submitData = {
      ...data,
      collateralAmount: (parseFloat(data.collateralAmount) * 1e18).toString(),
      debtAmount: (parseFloat(data.debtAmount) * 1e18).toString()
    }
    createCDPMutation.mutate(submitData)
  }

  const getStepProgress = () => (currentStep / steps.length) * 100

  // Watch form values for real-time calculations
  const watchedValues = watch()
  const collateralValue = parseFloat(watchedValues.collateralAmount || '0') * 2000 // Assume ETH price
  const debtAmount = parseFloat(watchedValues.debtAmount || '0')
  const collateralizationRatio = debtAmount > 0 ? (collateralValue / debtAmount) * 100 : 0
  const healthFactor = collateralizationRatio / 150 // Assuming 150% liquidation ratio

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600">Enter your wallet address to create the CDP</p>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="relative">
                  <input
                    {...register('owner', { 
                      required: 'Wallet address is required',
                      pattern: {
                        value: /^0x[a-fA-F0-9]{40}$/,
                        message: 'Please enter a valid Ethereum address'
                      }
                    })}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.owner ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="0x..."
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-400">
                      {watchedValues.owner && watchedValues.owner.match(/^0x[a-fA-F0-9]{40}$/) ? '✅' : '⚠️'}
                    </span>
                  </div>
                </div>
                {errors.owner && (
                  <p className="mt-1 text-sm text-red-600">{errors.owner.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deposit Collateral</h3>
              <p className="text-gray-600">Choose your collateral type and amount</p>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Type
                </label>
                <select
                  {...register('collateralType', { required: 'Please select a collateral type' })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="WETH">WETH - Wrapped Ethereum</option>
                  <option value="WBTC">WBTC - Wrapped Bitcoin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Amount
                </label>
                <div className="relative">
                  <input
                    {...register('collateralAmount', { 
                      required: 'Collateral amount is required',
                      min: { value: 0.1, message: 'Minimum collateral is 0.1 ETH' }
                    })}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-3 pr-16 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.collateralAmount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="2.5"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">
                      {watchedValues.collateralType || 'ETH'}
                    </span>
                  </div>
                </div>
                {errors.collateralAmount ? (
                  <p className="mt-1 text-sm text-red-600">{errors.collateralAmount.message}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    ≈ ${collateralValue.toLocaleString()} USD
                  </p>
                )}
              </div>

              {/* Collateral Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Collateral Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span>$2,000 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidation Threshold:</span>
                    <span>150%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Debt Amount</h3>
              <p className="text-gray-600">Choose how much nyxUSD to mint</p>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debt Amount (nyxUSD)
                </label>
                <div className="relative">
                  <input
                    {...register('debtAmount', { 
                      required: 'Debt amount is required',
                      min: { value: 100, message: 'Minimum debt is 100 nyxUSD' }
                    })}
                    type="number"
                    step="1"
                    className={`w-full px-4 py-3 pr-20 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.debtAmount ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="3000"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">nyxUSD</span>
                  </div>
                </div>
                {errors.debtAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.debtAmount.message}</p>
                )}
              </div>

              {/* Risk Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Position Metrics</h4>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Collateralization Ratio</span>
                  <span className={`font-medium ${
                    collateralizationRatio >= 200 ? 'text-green-600' : 
                    collateralizationRatio >= 150 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {collateralizationRatio.toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Health Factor</span>
                  <span className={`font-medium ${
                    healthFactor >= 2 ? 'text-green-600' : 
                    healthFactor >= 1.5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {healthFactor.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Liquidation Price</span>
                  <span className="font-medium text-gray-900">
                    ${(debtAmount * 1.5 / parseFloat(watchedValues.collateralAmount || '1')).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Risk Warning */}
              {healthFactor < 1.5 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="font-medium text-red-900">High Risk Position</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This position has a high risk of liquidation. Consider reducing debt or adding more collateral.
                  </p>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Confirm</h3>
              <p className="text-gray-600">Please review your CDP details before creation</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Wallet Address</span>
                <span className="font-mono text-sm">{watchedValues.owner?.slice(0, 6)}...{watchedValues.owner?.slice(-4)}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Collateral</span>
                <span className="font-medium">{watchedValues.collateralAmount} {watchedValues.collateralType}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Debt Amount</span>
                <span className="font-medium">{watchedValues.debtAmount} nyxUSD</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">Health Factor</span>
                <span className={`font-medium ${
                  healthFactor >= 2 ? 'text-green-600' : 
                  healthFactor >= 1.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {healthFactor.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collateralization Ratio</span>
                <span className="font-medium">{collateralizationRatio.toFixed(0)}%</span>
              </div>
            </div>

            {/* Final Warning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-0.5">ℹ️</span>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your collateral may be liquidated if the health factor falls below 1.0</li>
                    <li>You&apos;ll need to maintain a minimum collateralization ratio of 150%</li>
                    <li>Gas fees will apply for this transaction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New CDP</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Step {currentStep} of {steps.length}</span>
              <span className="text-sm">{Math.round(getStepProgress())}% Complete</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white bg-opacity-20 text-white'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createCDPMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {createCDPMutation.isPending ? 'Creating...' : 'Create CDP'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}