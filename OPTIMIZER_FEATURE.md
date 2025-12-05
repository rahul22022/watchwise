# WatchWise Subscription Optimizer

## New Feature: AI-Powered Subscription Recommendations

The Recommendations page has been completely repurposed to provide intelligent subscription management recommendations powered by AI.

### Features

#### 1. **Optimization Recommendations**
- **Keep/Cancel Analysis**: AI analyzes your subscriptions against your watchlist and interests to recommend which services to keep and which to cancel
- **Savings Calculator**: Shows potential monthly and annual savings
- **Smart Strategy**: Provides a detailed timing strategy for starting/stopping subscriptions

#### 2. **12-Month Schedule View**
- Visual breakdown of your subscription spending over the next 12 months
- Monthly cost tracking
- Yearly total and average calculations
- Current month highlighting

#### 3. **Money-Saving Tips**
- Family plan sharing suggestions
- Free trial strategies
- Annual plan recommendations
- Credit card/carrier bundle opportunities
- Ad-supported tier alternatives

### How It Works

#### Backend (AI Service)
The system uses a dual-mode approach:

1. **OpenAI Integration** (Optional)
   - Set `OPENAI_API_KEY` environment variable
   - Uses GPT-3.5-turbo for intelligent analysis
   - Considers user interests, watchlist, and subscription data
   - Provides personalized recommendations

2. **Rule-Based Fallback**
   - Works without API key
   - Analyzes platform usage based on watchlist
   - Recommends keeping subscriptions with watchlist content
   - Suggests canceling unused services
   - Provides standard money-saving tips

#### API Endpoints

**GET /api/optimization/recommendations**
- Returns optimization analysis with keep/cancel recommendations
- Calculates potential savings
- Provides timing strategy

**GET /api/optimization/schedule**
- Returns 12-month subscription schedule
- Shows monthly costs and active subscriptions
- Calculates yearly totals and averages

### Setup

#### Optional: OpenAI Integration
To enable AI-powered recommendations:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Add to your `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```
3. Restart the backend server

**Note**: The feature works perfectly fine without an API key using rule-based logic!

#### Backend Dependencies
All required packages are already included:
- `axios` - For API calls
- `mongoose` - Database operations
- `express` - Server framework

### Usage

1. **Add Your Subscriptions**
   - Navigate to Subscriptions page
   - Add all your streaming services with costs

2. **Set Your Interests**
   - Go to Interests page
   - Select favorite genres
   - Add shows/movies to watchlist

3. **View Optimization**
   - Click "Optimizer" in the navigation
   - View AI-generated recommendations
   - See potential savings
   - Check 12-month schedule

4. **Take Action**
   - Review keep/cancel recommendations
   - Follow the timing strategy
   - Implement money-saving tips

### Key Components

#### Backend Files
- `services/subscriptionOptimizerService.js` - Core AI logic and rule-based analysis
- `controllers/optimizationController.js` - Request handling
- `routes/optimization.js` - API routes

#### Frontend Files
- `pages/Recommendations.js` - Completely redesigned UI
- Updated navigation label to "Optimizer"

### Benefits

1. **Save Money**: Identify and eliminate underutilized subscriptions
2. **Smart Timing**: Learn when to rotate subscriptions for maximum value
3. **Personalized**: Recommendations based on YOUR watching habits
4. **Actionable**: Clear next steps and implementation strategy
5. **No Lock-in**: Works with or without OpenAI API

### Future Enhancements

- Scheduled email reminders for subscription rotation
- Historical spending trends and analytics
- Integration with actual subscription cancellation APIs
- Multi-user family plan optimization
- Seasonal content calendar integration

---

## Development Notes

The optimization service is designed to be extensible. You can:
- Switch to different LLM providers (Claude, Gemini, etc.)
- Customize the rule-based logic
- Add more money-saving strategies
- Integrate with actual subscription billing APIs

## Testing

Without OpenAI key:
1. Add 3-4 subscriptions
2. Add some watchlist items on specific platforms
3. Navigate to Optimizer
4. Should see rule-based recommendations

With OpenAI key:
1. Same steps as above
2. Recommendations will be more detailed and personalized
3. Strategy will be more nuanced

## Performance

- Rule-based mode: Instant results (<100ms)
- OpenAI mode: 2-5 seconds (API latency)
- Both modes cache results client-side
- Refresh button to re-analyze on-demand
