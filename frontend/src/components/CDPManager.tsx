import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { fetchCDPs, createCDP, depositCollateral, withdrawCollateral, mintNyxUSD, burnNyxUSD } from '../services/api'

interface CreateCDPForm {
  collateralType: string
  collateralAmount: string
  debtAmount: string
  owner: string
}

interface CDPActionForm {
  amount: string
}

export const CDPManager: React.FC = () => {
  const [selectedCDP, setSelectedCDP] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'deposit' | 'withdraw' | 'mint' | 'burn' | null>(null)
  
  const queryClient = useQueryClient()
  const { data: cdpData, isLoading } = useQuery('cdps', fetchCDPs)
  
  const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreate } = useForm<CreateCDPForm>()
  const { register: registerAction, handleSubmit: handleActionSubmit, reset: resetAction } = useForm<CDPActionForm>()

  const createCDPMutation = useMutation(createCDP, {
    onSuccess: () => {
      queryClient.invalidateQueries('cdps')
      resetCreate()
    }
  })

  const depositMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) => depositCollateral(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cdps')
        setActionType(null)
        setSelectedCDP(null)
        resetAction()
      }
    }
  )

  const withdrawMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) => withdrawCollateral(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cdps')
        setActionType(null)
        setSelectedCDP(null)
        resetAction()
      }
    }
  )

  const mintMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) => mintNyxUSD(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cdps')
        setActionType(null)
        setSelectedCDP(null)
        resetAction()
      }
    }
  )

  const burnMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) => burnNyxUSD(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cdps')
        setActionType(null)
        setSelectedCDP(null)
        resetAction()
      }
    }
  )

  const onCreateCDP = (data: CreateCDPForm) => {
    createCDPMutation.mutate(data)
  }

  const onCDPAction = (data: CDPActionForm) => {
    if (!selectedCDP || !actionType) return

    const payload = { cdpId: selectedCDP, amount: data.amount }
    
    switch (actionType) {
      case 'deposit':
        depositMutation.mutate(payload)
        break
      case 'withdraw':
        withdrawMutation.mutate(payload)
        break
      case 'mint':
        mintMutation.mutate(payload)
        break
      case 'burn':
        burnMutation.mutate(payload)
        break
    }
  }

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 2) return 'health-safe'
    if (healthFactor >= 1.5) return 'health-warning'
    return 'health-danger'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">CDP Management</h2>

      {/* Create CDP Form */}
      <div className="create-cdp-form">
        <h3 className="text-xl font-semibold mb-4">Create New CDP</h3>
        <form onSubmit={handleCreateSubmit(onCreateCDP)} className="grid md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Owner Address</label>
            <input 
              {...registerCreate('owner', { required: true })}
              className="form-input"
              placeholder="0x..."
              defaultValue="0x742d35Cc6634C0532925a3b8D"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Collateral Type</label>
            <select {...registerCreate('collateralType', { required: true })} className="form-input">
              <option value="WETH">WETH - Wrapped Ethereum</option>
              <option value="WBTC">WBTC - Wrapped Bitcoin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Collateral Amount (Wei)</label>
            <input 
              {...registerCreate('collateralAmount', { required: true })}
              className="form-input"
              placeholder="2500000000000000000"
              defaultValue="2500000000000000000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Debt Amount (Wei)</label>
            <input 
              {...registerCreate('debtAmount', { required: true })}
              className="form-input"
              placeholder="3000000000000000000000"
              defaultValue="3000000000000000000000"
            />
          </div>
          <div className="md:col-span-2">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={createCDPMutation.isLoading}
            >
              {createCDPMutation.isLoading ? 'Creating...' : 'Create CDP'}
            </button>
          </div>
        </form>
      </div>

      {/* CDP List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your CDPs ({(cdpData as any)?.totalCDPs || 0})</h3>
        {(cdpData as any)?.cdps?.map((cdp: any) => (
          <div key={cdp.id} className="cdp-card">
            <div className="cdp-header">
              <span className="cdp-id">{cdp.id}</span>
              <span className={`cdp-status status-${cdp.status}`}>{cdp.status}</span>
            </div>
            
            <div className="cdp-details">
              <div className="detail-item">
                <span className="detail-label">Collateral Type:</span>
                <span className="detail-value">{cdp.collateralType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Collateral Amount:</span>
                <span className="detail-value">{(parseInt(cdp.collateralAmount) / 1e18).toFixed(4)} {cdp.collateralType}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Debt Amount:</span>
                <span className="detail-value">{(parseInt(cdp.debtAmount) / 1e18).toFixed(2)} nyxUSD</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Collateral Ratio:</span>
                <span className="detail-value">{cdp.collateralizationRatio}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Health Factor:</span>
                <span className={`detail-value health-factor ${getHealthFactorColor(cdp.healthFactor)}`}>
                  {cdp.healthFactor.toFixed(2)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value">{new Date(cdp.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCDP(cdp.id)
                  setActionType('deposit')
                }}
              >
                Deposit
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCDP(cdp.id)
                  setActionType('withdraw')
                }}
              >
                Withdraw
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedCDP(cdp.id)
                  setActionType('mint')
                }}
              >
                Mint nyxUSD
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedCDP(cdp.id)
                  setActionType('burn')
                }}
              >
                Burn nyxUSD
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedCDP && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)} {actionType === 'mint' || actionType === 'burn' ? 'nyxUSD' : 'Collateral'}
            </h3>
            <form onSubmit={handleActionSubmit(onCDPAction)}>
              <div className="form-group">
                <label className="form-label">Amount (Wei)</label>
                <input 
                  {...registerAction('amount', { required: true })}
                  className="form-input"
                  placeholder="1000000000000000000"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setActionType(null)
                    setSelectedCDP(null)
                    resetAction()
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}