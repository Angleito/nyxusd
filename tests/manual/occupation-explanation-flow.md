# Occupation Explanation Flow Test Guide

This document describes the new occupation explanation step that appears after users select their occupation.

## Overview

After selecting an occupation, users now see a detailed explanation of how the AI will tailor investment strategies using profession-specific concepts. This gives users a chance to:

1. Understand the approach before proceeding
2. Change their occupation selection if needed
3. Feel confident that explanations will be relatable

## Test Scenarios

### Scenario 1: Basic Flow with Confirmation

1. **Select Occupation**
   - User: "I'm a truck driver"
   - System: Auto-selects "Truck Driver"

2. **Occupation Explanation Screen**
   - Shows detailed explanation with truck driving analogies:
     - Portfolio Management = Route Planning
     - Risk Assessment = Pre-Trip Inspections
     - Yield Optimization = Fuel Efficiency
     - Liquidity = Available Parking
   - Two buttons appear:
     - "Yes, this works perfectly!" (primary, purple)
     - "Change" (secondary, gray)

3. **Confirm Approach**
   - User: "yes that works" or "perfect" or "continue"
   - System: Auto-clicks continue button
   - AI: "Great! I'll use these familiar concepts throughout our conversation. Now let's assess your risk tolerance."

### Scenario 2: Change Occupation

1. **Initial Selection**
   - User: "I'm a chef"
   - System: Shows chef explanation

2. **Request Change**
   - User: "actually I want to change" or "no" or "different"
   - System: Auto-clicks "Change" button
   - Shows three occupation options

3. **Select New Occupation**
   - User: "truck driver"
   - System: Updates to truck driver explanation
   - Shows updated approach

### Scenario 3: Direct Occupation Switch

1. **On Explanation Screen**
   - Currently showing chef explanation
   - User: "I'm actually a retail manager"
   - System: Automatically switches to retail manager explanation

## Natural Language Patterns

### Confirmation Phrases

- "yes that works"
- "perfect"
- "sounds good"
- "this works for me"
- "continue"
- "let's go"

### Change Request Phrases

- "change"
- "no"
- "different"
- "I want to change"
- "let me adjust"
- "actually"

### Direct Selection

- "I'm a chef"
- "truck driver"
- "retail manager"

## Visual Design

### Explanation Card

- Dark background (gray-900/50)
- Purple icon (Briefcase)
- Title: "Perfect! Here's how I'll tailor my approach for a [Occupation]"
- Content box with detailed explanation
- Help text: "Does this approach work for you?"

### Button States

- Continue button: Purple, full width on mobile
- Change button: Gray, smaller width
- When change is clicked: Shows all three occupation options

## Occupation-Specific Explanations

### Chef

- **Portfolio Management** = Menu Planning
- **Risk Assessment** = Food Safety Protocols
- **Yield Optimization** = Profit Margins
- **Liquidity** = Mise en Place

### Truck Driver

- **Portfolio Management** = Route Planning
- **Risk Assessment** = Pre-Trip Inspections
- **Yield Optimization** = Fuel Efficiency
- **Liquidity** = Available Parking

### Retail Store Manager

- **Portfolio Management** = Product Mix
- **Risk Assessment** = Loss Prevention
- **Yield Optimization** = Inventory Turnover
- **Liquidity** = Cash Flow Management

## Animation Details

- Smooth transitions when changing occupations
- Auto-action focus with purple glow
- Height animation when showing/hiding options
- Scale effects on button interactions

## Edge Cases to Test

1. Rapid occupation changes
2. Conflicting inputs (saying "yes" then immediately "change")
3. Unrecognized occupation requests
4. Network delays during transitions
5. Mobile responsiveness of explanation text
