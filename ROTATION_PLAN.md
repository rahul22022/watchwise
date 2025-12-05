# Subscription Rotation Plan Feature

## Overview
The Subscription Optimizer now includes an intelligent **Rotation Plan** that helps users maximize their content access while staying within their current monthly budget.

## How It Works

### 1. **Budget-Based Planning**
- Uses the user's **current total monthly spending** as the budget
- Example: If you spend $45/month on 4 subscriptions, the rotation plan keeps you at $45/month

### 2. **Smart Scoring System**
Each subscription is scored based on:
- **Watchlist Items** (2x weight): Number of shows/movies in your watchlist from that platform
- **Genre Match**: How well the platform's content matches your selected genres
- Subscriptions are prioritized by total score

### 3. **Optimal Rotation**
- Calculates how many subscriptions can be active simultaneously within budget
- Creates a 12-month schedule rotating through all subscriptions
- Ensures you access every service while maintaining your budget

## Example Scenario

**Current Situation:**
- 4 subscriptions: Netflix ($15), Hulu ($12), Disney+ ($11), HBO Max ($10)
- Total: $48/month = $576/year
- Budget: $48/month

**Rotation Plan:**
- Keep 2-3 active at a time (within $48 budget)
- Month 1-4: Netflix + Hulu ($27) - Watch priority content
- Month 5-8: Disney+ + HBO Max ($21) - Switch to other content
- Month 9-12: Rotate back or mix based on watchlist
- **Yearly Savings: ~$150-200**

## Features

### 📊 Rotation Summary
- Monthly budget display
- Active subscriptions count
- Estimated yearly savings

### 📅 12-Month Schedule
- Clear month-by-month breakdown
- Shows which subscriptions to activate/cancel each month
- Displays cost per month
- Includes reason for each selection

### 💡 Implementation Tips
- Calendar reminder suggestions
- Cancel/resubscribe guidance
- Platform pause options
- Watch history preservation info

## Technical Implementation

### Backend Logic (`subscriptionOptimizerService.js`)

#### `createRotationPlan()`
1. Scores subscriptions by watchlist content and genre match
2. Determines simultaneous services within budget
3. Creates 12-month rotation schedule
4. Calculates yearly savings

#### Scoring Algorithm:
```javascript
totalScore = (watchlistItems × 2) + genreMatchScore
```

#### Rotation Strategy:
- Prioritizes high-score subscriptions in early months
- Rotates through all services over 12 months
- Maintains budget constraint each month

### Frontend Display (`Recommendations.js`)

#### New Tab: "🔄 Rotation Plan"
- Summary cards with key metrics
- Explanation of how rotation works
- Month-by-month schedule with:
  - Active subscriptions
  - Monthly cost
  - Reason for selection
  - Action reminders

## User Benefits

### 💰 Financial
- Save $100-300+ per year depending on subscriptions
- Stay within current budget (no extra spending)
- Clear visibility into yearly costs

### 📺 Content Access
- Access all subscriptions throughout the year
- Prioritized based on your watchlist
- Aligned with your genre preferences

### ⏰ Time Management
- Focused viewing periods
- Avoid subscription overwhelm
- Clear start/end dates for each service

## Usage Flow

1. **Add Subscriptions** (Subscriptions page)
   - Enter all streaming services with costs

2. **Set Preferences** (Interests page)
   - Select favorite genres
   - Add shows/movies to watchlist

3. **View Rotation Plan** (Optimizer → Rotation Plan tab)
   - See personalized 12-month schedule
   - Review savings estimate
   - Note which services to activate each month

4. **Implement**
   - Set calendar reminders for 1st of each month
   - Cancel current month's subscriptions
   - Activate next month's subscriptions
   - Enjoy content and save money!

## Smart Features

### Adaptive Scoring
- Platforms with more watchlist items get priority
- Genre matching ensures relevant content access
- Balances cost with content value

### Budget Flexibility
- Works with any budget (from 1 service to many)
- Automatically adjusts simultaneous services
- Maximizes content access within constraints

### Real-World Friendly
- Accounts for platform cancellation policies
- Reminds users about watch history preservation
- Suggests "pause" option where available

## API Endpoints

### GET `/api/optimization/recommendations`
Returns rotation plan in response:
```json
{
  "recommendations": {
    "rotationPlan": {
      "monthlyBudget": 48,
      "simultaneousServices": 2,
      "totalSubscriptions": 4,
      "months": [...],
      "yearlyTotal": 360,
      "estimatedSavings": 216
    }
  }
}
```

## Future Enhancements

- **Automated Reminders**: Email/SMS notifications before rotation
- **Content Calendar Integration**: Rotate based on show release dates
- **Group Plans**: Optimize family/friend sharing arrangements
- **API Integration**: Automatic cancel/reactivate with streaming APIs
- **Seasonal Optimization**: Suggest rotations based on content seasons
- **Historical Analytics**: Track actual savings over time

## Testing

### Test Scenario 1: Multiple Subscriptions
1. Add 4+ subscriptions with varying costs
2. Add watchlist items across different platforms
3. Select favorite genres
4. View rotation plan - should show smart rotation

### Test Scenario 2: Few Subscriptions
1. Add only 1-2 subscriptions
2. View rotation plan - shows message about needing more subs

### Test Scenario 3: High Budget
1. Add many subscriptions (6+) with high budget
2. Rotation plan keeps more services active simultaneously
3. Savings still realized through optimization

## Notes

- Rotation plan is generated on-demand (no database storage)
- Completely client-side rendering (fast updates)
- Works without OpenAI API key (rule-based)
- Integrates seamlessly with existing watchlist/interests data

---

**Result:** Users can save hundreds of dollars per year while still accessing all their streaming content through smart subscription rotation! 🎉
