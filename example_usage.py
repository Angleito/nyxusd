#!/usr/bin/env python3
"""
Example usage of the DeFi Yield Finder for Base Network.

This script demonstrates how to use the DeFiYieldFinder to discover
safe, high-yield opportunities on the Base blockchain.
"""

import asyncio
import json
from defi_yield_finder import DeFiYieldFinder


def basic_usage():
    """Basic synchronous usage example."""
    print("=" * 60)
    print("Basic DeFi Yield Finder Usage")
    print("=" * 60)
    
    # Initialize the finder with default settings
    finder = DeFiYieldFinder()
    
    # Get safe yields with default minimum safety score (60)
    results = finder.get_safe_base_yields()
    
    print(f"\nFound {len(results.top_yields)} safe opportunities on Base network")
    print(f"Total pools analyzed: {results.summary['total_pools_analyzed']}")
    print(f"Safe pools found: {results.summary['safe_pools_found']}")
    print(f"Highest safe yield: {results.summary['highest_safe_yield']}%")
    print(f"Average safe yield: {results.summary['average_safe_yield']}%")
    
    # Display top 5 opportunities
    print("\n" + "=" * 60)
    print("Top 5 Safe Yield Opportunities:")
    print("=" * 60)
    
    for i, pool in enumerate(results.top_yields[:5], 1):
        print(f"\n{i}. {pool['protocol']} - {pool['pool']}")
        print(f"   APY: {pool['apy']}%")
        print(f"   TVL: ${pool['tvl_usd']:,.0f}")
        print(f"   Safety Score: {pool['safety_score']}/100")
        print(f"   Risk Level: {pool['risk_level']}")
        print(f"   Description: {pool['description']}")
        if pool.get('has_il_risk'):
            print("   ⚠️  Impermanent Loss Risk")
    
    # Display warnings
    if results.warnings:
        print("\n" + "=" * 60)
        print("Important Warnings:")
        print("=" * 60)
        for warning in results.warnings:
            print(f"⚠️  {warning}")


def custom_settings_usage():
    """Example with custom configuration."""
    print("\n" + "=" * 60)
    print("Custom Configuration Example")
    print("=" * 60)
    
    # Initialize with custom settings
    custom_config = {
        "MIN_SAFETY_SCORE": 70,  # Higher safety threshold
        "MAX_RESULTS": 10,        # Fewer results
        "CACHE_ENABLED": True,    # Enable caching
        "REDIS_ENABLED": False    # Use in-memory cache only
    }
    
    finder = DeFiYieldFinder(custom_config=custom_config)
    
    # Get only very safe yields (score >= 80)
    results = finder.get_safe_base_yields(min_safety_score=80)
    
    print(f"\nFound {len(results.top_yields)} very safe opportunities (score >= 80)")
    
    if results.top_yields:
        best_pool = results.top_yields[0]
        print(f"\nBest opportunity:")
        print(f"  {best_pool['protocol']} - {best_pool['pool']}")
        print(f"  APY: {best_pool['apy']}%")
        print(f"  Safety Score: {best_pool['safety_score']}/100")
    else:
        print("No pools met the high safety criteria")


async def async_usage():
    """Asynchronous usage example."""
    print("\n" + "=" * 60)
    print("Async Usage Example")
    print("=" * 60)
    
    finder = DeFiYieldFinder()
    
    # Fetch yields asynchronously
    results = await finder.get_safe_base_yields_async(min_safety_score=65)
    
    print(f"\nAsync fetch complete!")
    print(f"Found {len(results.top_yields)} opportunities with safety score >= 65")
    
    # Group by risk level
    risk_groups = {}
    for pool in results.top_yields:
        risk = pool['risk_level']
        if risk not in risk_groups:
            risk_groups[risk] = []
        risk_groups[risk].append(pool)
    
    print("\nOpportunities by risk level:")
    for risk_level, pools in sorted(risk_groups.items()):
        avg_apy = sum(p['apy'] for p in pools) / len(pools) if pools else 0
        print(f"  {risk_level}: {len(pools)} pools (avg APY: {avg_apy:.1f}%)")


def export_to_json():
    """Export results to JSON file."""
    print("\n" + "=" * 60)
    print("Exporting Results to JSON")
    print("=" * 60)
    
    finder = DeFiYieldFinder()
    results = finder.get_safe_base_yields(min_safety_score=60)
    
    # Save to JSON file
    output_file = "base_yields_report.json"
    with open(output_file, 'w') as f:
        json.dump(results.to_dict(), f, indent=2)
    
    print(f"\nResults exported to {output_file}")
    print(f"File contains {len(results.top_yields)} yield opportunities")


def filter_by_protocol():
    """Example of filtering results by specific protocols."""
    print("\n" + "=" * 60)
    print("Filtering by Specific Protocols")
    print("=" * 60)
    
    finder = DeFiYieldFinder()
    results = finder.get_safe_base_yields()
    
    # Filter for specific protocols
    target_protocols = {"Aerodrome", "Uniswap", "Aave", "Moonwell"}
    
    filtered_pools = [
        pool for pool in results.top_yields
        if pool['protocol'] in target_protocols
    ]
    
    print(f"\nFound {len(filtered_pools)} opportunities from target protocols:")
    for pool in filtered_pools[:3]:
        print(f"  • {pool['protocol']}: {pool['apy']}% APY (Score: {pool['safety_score']})")


def stable_pools_only():
    """Example focusing on stable pools (less IL risk)."""
    print("\n" + "=" * 60)
    print("Stable Pools Only")
    print("=" * 60)
    
    finder = DeFiYieldFinder()
    results = finder.get_safe_base_yields()
    
    # Filter for stable pools
    stable_pools = [
        pool for pool in results.top_yields
        if pool.get('is_stable', False)
    ]
    
    print(f"\nFound {len(stable_pools)} stable pool opportunities:")
    for pool in stable_pools[:5]:
        print(f"  • {pool['pool']}: {pool['apy']}% APY")
        print(f"    TVL: ${pool['tvl_usd']:,.0f}, Safety: {pool['safety_score']}/100")


if __name__ == "__main__":
    print("\n" + "🚀 DeFi Yield Finder for Base Network " + "🚀")
    print("Finding safe, high-yield opportunities...\n")
    
    # Run examples
    basic_usage()
    custom_settings_usage()
    filter_by_protocol()
    stable_pools_only()
    
    # Run async example
    print("\n" + "=" * 60)
    print("Running async example...")
    asyncio.run(async_usage())
    
    # Export results
    export_to_json()
    
    print("\n" + "=" * 60)
    print("✅ All examples completed successfully!")
    print("=" * 60)