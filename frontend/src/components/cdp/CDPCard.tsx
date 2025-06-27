import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  depositCollateral,
  withdrawCollateral,
  mintNyxUSD,
  burnNyxUSD,
} from "../../services/api";

interface CDPCardProps {
  cdp: {
    id: string;
    status: string;
    collateralType: string;
    collateralAmount: string;
    debtAmount: string;
    collateralizationRatio: number;
    healthFactor: number;
    createdAt: string;
    owner: string;
  };
}

interface CDPActionForm {
  amount: string;
}

export const CDPCard: React.FC<CDPCardProps> = ({ cdp }) => {
  const [expanded, setExpanded] = useState(false);
  const [actionType, setActionType] = useState<
    "deposit" | "withdraw" | "mint" | "burn" | null
  >(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CDPActionForm>();

  // Mutations for CDP actions
  const depositMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) =>
      depositCollateral(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cdps"]);
        setShowActionModal(false);
        setActionType(null);
        reset();
      },
    },
  );

  const withdrawMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) =>
      withdrawCollateral(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cdps"]);
        setShowActionModal(false);
        setActionType(null);
        reset();
      },
    },
  );

  const mintMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) =>
      mintNyxUSD(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cdps"]);
        setShowActionModal(false);
        setActionType(null);
        reset();
      },
    },
  );

  const burnMutation = useMutation(
    ({ cdpId, amount }: { cdpId: string; amount: string }) =>
      burnNyxUSD(cdpId, amount),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cdps"]);
        setShowActionModal(false);
        setActionType(null);
        reset();
      },
    },
  );

  const handleAction = (data: CDPActionForm) => {
    if (!actionType) return;

    // Convert to Wei for API
    const amountInWei = (parseFloat(data.amount) * 1e18).toString();
    const payload = { cdpId: cdp.id, amount: amountInWei };

    switch (actionType) {
      case "deposit":
        depositMutation.mutate(payload);
        break;
      case "withdraw":
        withdrawMutation.mutate(payload);
        break;
      case "mint":
        mintMutation.mutate(payload);
        break;
      case "burn":
        burnMutation.mutate(payload);
        break;
    }
  };

  const openActionModal = (type: "deposit" | "withdraw" | "mint" | "burn") => {
    setActionType(type);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setActionType(null);
    reset();
  };

  // Health factor color coding
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 2) return "text-green-600 bg-green-100";
    if (healthFactor >= 1.5) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getHealthFactorIcon = (healthFactor: number) => {
    if (healthFactor >= 2) return "🟢";
    if (healthFactor >= 1.5) return "🟡";
    return "🔴";
  };

  // Status color coding
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-700 bg-green-100";
      case "at_risk":
        return "text-yellow-700 bg-yellow-100";
      case "liquidated":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  // Calculate derived values
  const collateralValue = parseInt(cdp.collateralAmount) / 1e18;
  const debtValue = parseInt(cdp.debtAmount) / 1e18;
  const collateralUSDValue = collateralValue * 2000; // Assuming ETH price
  const liquidationPrice = (debtValue * 1.5) / collateralValue;

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-card-foreground font-bold">
                  {cdp.id.slice(-2)}
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    CDP #{cdp.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(cdp.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Health Factor Indicator */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {getHealthFactorIcon(cdp.healthFactor)}
                  </span>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthFactorColor(cdp.healthFactor)}`}
                  >
                    {cdp.healthFactor.toFixed(2)}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cdp.status)}`}
                >
                  {cdp.status}
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span
                className={`text-xl transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Collateral
              </div>
              <div className="text-lg font-bold text-blue-900">
                {collateralValue.toFixed(4)}
              </div>
              <div className="text-xs text-blue-600">{cdp.collateralType}</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-1">
                Debt
              </div>
              <div className="text-lg font-bold text-purple-900">
                {debtValue.toFixed(0)}
              </div>
              <div className="text-xs text-purple-600">nyxUSD</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">
                C-Ratio
              </div>
              <div className="text-lg font-bold text-green-900">
                {cdp.collateralizationRatio}%
              </div>
              <div className="text-xs text-green-600">
                {cdp.collateralizationRatio >= 200
                  ? "Safe"
                  : cdp.collateralizationRatio >= 150
                    ? "Moderate"
                    : "Risky"}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium mb-1">
                Liq. Price
              </div>
              <div className="text-lg font-bold text-orange-900">
                ${liquidationPrice.toFixed(0)}
              </div>
              <div className="text-xs text-orange-600">ETH Price</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => openActionModal("deposit")}
              className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Deposit
            </button>
            <button
              onClick={() => openActionModal("withdraw")}
              className="flex-1 min-w-[120px] bg-gray-600 hover:bg-gray-700 text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Withdraw
            </button>
            <button
              onClick={() => openActionModal("mint")}
              className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Mint nyxUSD
            </button>
            <button
              onClick={() => openActionModal("burn")}
              className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Burn nyxUSD
            </button>
          </div>
        </div>

        {/* Collapsible Details */}
        {expanded && (
          <div className="border-t border-border p-6 bg-muted">
            <h4 className="font-semibold text-card-foreground mb-4">
              Detailed Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position Details */}
              <div className="space-y-3">
                <h5 className="font-medium text-card-foreground">
                  Position Details
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-mono text-card-foreground">
                      {cdp.owner.slice(0, 6)}...{cdp.owner.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Collateral Value:
                    </span>
                    <span className="font-medium text-card-foreground">
                      ${collateralUSDValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Available to Mint:
                    </span>
                    <span className="font-medium text-green-600">
                      {Math.max(
                        0,
                        collateralUSDValue / 1.5 - debtValue,
                      ).toFixed(0)}{" "}
                      nyxUSD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Available to Withdraw:
                    </span>
                    <span className="font-medium text-blue-600">
                      {Math.max(
                        0,
                        collateralValue - (debtValue * 1.5) / 2000,
                      ).toFixed(4)}{" "}
                      ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="space-y-3">
                <h5 className="font-medium text-card-foreground">
                  Risk Metrics
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Health Factor:
                    </span>
                    <span
                      className={`font-medium ${
                        cdp.healthFactor >= 2
                          ? "text-green-600"
                          : cdp.healthFactor >= 1.5
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {cdp.healthFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Liquidation Threshold:
                    </span>
                    <span className="font-medium text-orange-600">150%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current ETH Price:
                    </span>
                    <span className="font-medium text-card-foreground">
                      $2,000
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Price Drop to Liquidation:
                    </span>
                    <span
                      className={`font-medium ${
                        ((2000 - liquidationPrice) / 2000) * 100 > 25
                          ? "text-green-600"
                          : ((2000 - liquidationPrice) / 2000) * 100 > 10
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {(((2000 - liquidationPrice) / 2000) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            {cdp.healthFactor < 1.5 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="font-medium text-red-900">
                    High Risk Position
                  </span>
                </div>
                <p className="text-sm text-red-700">
                  This CDP is at risk of liquidation. Consider depositing more
                  collateral or repaying debt to improve the health factor.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">
                  {actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
                  {actionType === "mint" || actionType === "burn"
                    ? "nyxUSD"
                    : "Collateral"}
                </h3>
                <button
                  onClick={closeActionModal}
                  className="text-muted-foreground hover:text-card-foreground transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                CDP #{cdp.id}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleAction)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Amount (
                    {actionType === "mint" || actionType === "burn"
                      ? "nyxUSD"
                      : cdp.collateralType}
                    )
                  </label>
                  <input
                    {...register("amount", {
                      required: "Amount is required",
                      min: {
                        value: 0.01,
                        message: "Amount must be greater than 0",
                      },
                    })}
                    type="number"
                    step="0.01"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-background text-foreground ${
                      errors.amount
                        ? "border-red-300 bg-red-50"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Action Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Transaction Info
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Current Health Factor:</span>
                      <span className="font-medium">
                        {cdp.healthFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas Fee:</span>
                      <span>~$5-15</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeActionModal}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-card-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    depositMutation.isPending ||
                    withdrawMutation.isPending ||
                    mintMutation.isPending ||
                    burnMutation.isPending
                  }
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {depositMutation.isPending ||
                  withdrawMutation.isPending ||
                  mintMutation.isPending ||
                  burnMutation.isPending
                    ? "Processing..."
                    : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
