const axios = require('axios');

/**
 * Service to analyze user subscriptions and provide optimization recommendations
 * using AI/LLM capabilities
 */
class SubscriptionOptimizerService {
  constructor() {
    // Using OpenAI API - users should set OPENAI_API_KEY in environment
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-3.5-turbo';
  }

  /**
   * Analyze user's subscriptions and provide recommendations
   */
  async analyzeSubscriptions(userData) {
    const { subscriptions, interests, watchlist } = userData;

    // Calculate current monthly spending
    const currentSpending = this.calculateMonthlySpending(subscriptions);

    // If no API key, provide rule-based recommendations
    if (!this.apiKey) {
      return this.getRuleBasedRecommendations(subscriptions, interests, watchlist, currentSpending);
    }

    try {
      // Prepare prompt for LLM
      const prompt = this.buildPrompt(subscriptions, interests, watchlist, currentSpending);

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a financial advisor specializing in streaming subscription optimization. Analyze user data and provide actionable recommendations to save money while maintaining access to their favorite content.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const analysis = response.data.choices[0].message.content;
      return this.parseAIResponse(analysis, subscriptions, currentSpending);
    } catch (error) {
      console.error('Error calling OpenAI API:', error.message);
      // Fallback to rule-based recommendations
      return this.getRuleBasedRecommendations(subscriptions, interests, watchlist, currentSpending);
    }
  }

  /**
   * Build prompt for LLM
   */
  buildPrompt(subscriptions, interests, watchlist, currentSpending) {
    const subsList = subscriptions.map(s => 
      `${s.name} ($${s.cost}/month) - Active since ${new Date(s.startDate).toLocaleDateString()}`
    ).join('\n');

    const genresList = interests?.genres?.join(', ') || 'Not specified';
    const contentType = interests?.preferredContentType || 'Not specified';
    
    const watchlistSummary = watchlist.map(w => 
      `${w.customTitle} on ${w.platform || 'Unknown platform'}`
    ).join('\n');

    return `Analyze these streaming subscriptions and provide optimization recommendations:

CURRENT SUBSCRIPTIONS:
${subsList}

TOTAL MONTHLY SPENDING: $${currentSpending}

USER PREFERENCES:
- Favorite Genres: ${genresList}
- Content Type: ${contentType}
- Watchlist Items (${watchlist.length} items):
${watchlistSummary || 'Empty'}

Please provide:
1. Which subscriptions to KEEP (and why)
2. Which subscriptions to CANCEL (and why)
3. Timing strategy (when to start/stop subscriptions)
4. Estimated monthly savings
5. Alternative cost-saving strategies

Format your response as:
KEEP: [List with reasons]
CANCEL: [List with reasons]
STRATEGY: [Timing recommendations]
SAVINGS: [Amount and percentage]
ALTERNATIVES: [Other suggestions]`;
  }

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(analysis, subscriptions, currentSpending) {
    const result = {
      currentSpending,
      recommendations: {
        keep: [],
        cancel: [],
        strategy: '',
        savings: { amount: 0, percentage: 0 },
        alternatives: []
      },
      fullAnalysis: analysis
    };

    try {
      // Extract keep recommendations
      const keepMatch = analysis.match(/KEEP:(.*?)(?=CANCEL:|STRATEGY:|$)/s);
      if (keepMatch) {
        result.recommendations.keep = this.extractListItems(keepMatch[1]);
      }

      // Extract cancel recommendations
      const cancelMatch = analysis.match(/CANCEL:(.*?)(?=STRATEGY:|SAVINGS:|$)/s);
      if (cancelMatch) {
        result.recommendations.cancel = this.extractListItems(cancelMatch[1]);
      }

      // Extract strategy
      const strategyMatch = analysis.match(/STRATEGY:(.*?)(?=SAVINGS:|ALTERNATIVES:|$)/s);
      if (strategyMatch) {
        result.recommendations.strategy = strategyMatch[1].trim();
      }

      // Extract savings
      const savingsMatch = analysis.match(/SAVINGS:(.*?)(?=ALTERNATIVES:|$)/s);
      if (savingsMatch) {
        const savingsText = savingsMatch[1];
        const amountMatch = savingsText.match(/\$?(\d+(?:\.\d+)?)/);
        if (amountMatch) {
          result.recommendations.savings.amount = parseFloat(amountMatch[1]);
          result.recommendations.savings.percentage = 
            Math.round((result.recommendations.savings.amount / currentSpending) * 100);
        }
      }

      // Extract alternatives
      const altMatch = analysis.match(/ALTERNATIVES:(.*?)$/s);
      if (altMatch) {
        result.recommendations.alternatives = this.extractListItems(altMatch[1]);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    return result;
  }

  /**
   * Extract list items from text
   */
  extractListItems(text) {
    const items = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, '').trim();
      if (cleaned && cleaned.length > 5) {
        items.push(cleaned);
      }
    }
    
    return items;
  }

  /**
   * Rule-based recommendations (fallback when no API key)
   */
  getRuleBasedRecommendations(subscriptions, interests, watchlist, currentSpending) {

    const result = {
      currentSpending,
      recommendations: {
        keep: [],
        cancel: [],
        strategy: '',
        savings: { amount: 0, percentage: 0 },
        alternatives: [],
        rotationPlan: null
      },
      fullAnalysis: '',
      spendingBreakdown: {
        currentMonth: { subscriptions: [], total: currentSpending },
        nextMonth: { subscriptions: [], total: 0 },
        threeMonthSchedule: []
      }
    };

    // Analyze which platforms have watchlist content
    const platformUsage = this.analyzePlatformUsage(subscriptions, watchlist);

    // Categorize subscriptions based on watchlist and genre preferences
    // Use intelligent scoring: watchlist items are most important, then genre matching
    if (subscriptions.length === 0) {
      result.recommendations.strategy = 'Add subscriptions to get personalized recommendations.';
      return result;
    }

    subscriptions.forEach(sub => {
      const usage = platformUsage[sub.name] || { count: 0, items: [] };
      const genreMatch = this.calculateGenreMatchScore(sub, interests, watchlist);
      const totalValue = usage.count * 3 + genreMatch; // Increased weight for watchlist items
      
      // Keep if has watchlist content OR matches user preferences
      if (usage.count > 0 || genreMatch > 0) {
        let reason = '';
        if (usage.count > 0 && genreMatch > 0) {
          reason = `${usage.count} watchlist items + matches your preferences`;
        } else if (usage.count > 0) {
          reason = `${usage.count} items in your watchlist`;
        } else if (genreMatch > 0) {
          reason = `Matches your interests (${genreMatch} relevant items)`;
        } else {
          reason = 'Aligns with your viewing preferences';
        }
        result.recommendations.keep.push(
          `${sub.name} ($${sub.cost}/month) - ${reason}`
        );
      } else {
        // Consider rotating if no watchlist content and no interest match
        const reason = 'No current watchlist content - consider rotating when needed';
        result.recommendations.cancel.push(
          `${sub.name} ($${sub.cost}/month) - ${reason}`
        );
      }
    });

    // Calculate savings from cancellations
    const savingsAmount = result.recommendations.cancel.reduce((sum, item) => {
      const costMatch = item.match(/\$(\d+(?:\.\d+)?)/);
      return sum + (costMatch ? parseFloat(costMatch[1]) : 0);
    }, 0);

    result.recommendations.savings.amount = savingsAmount;
    result.recommendations.savings.percentage = 
      Math.round((savingsAmount / currentSpending) * 100);

    // Build spending breakdown
    result.spendingBreakdown = this.buildSpendingBreakdown(
      subscriptions,
      platformUsage,
      interests,
      watchlist,
      currentSpending
    );

    // Create rotation plan based on watchlist and genres
    result.recommendations.rotationPlan = this.createRotationPlan(
      subscriptions,
      interests,
      watchlist,
      platformUsage,
      currentSpending
    );

    // Strategy recommendations with rotation plan
    result.recommendations.strategy = this.buildRotationStrategy(
      result.recommendations.rotationPlan,
      subscriptions.length
    );

    // Alternative strategies
    result.recommendations.alternatives = [
      'Share subscriptions with family/friends using family plans to split costs',
      'Wait for free trials when new shows you want are released',
      'Use annual plans for frequently-used services (often 15-20% cheaper)',
      'Check if your mobile carrier or credit card offers free subscriptions',
      'Consider ad-supported tiers which are typically $5-10 cheaper'
    ];

    // Build full analysis text
    result.fullAnalysis = this.buildRuleBasedAnalysis(result);

    return result;
  }

  /**
   * Analyze which platforms are used in watchlist
   */
  analyzePlatformUsage(subscriptions, watchlist) {
    const usage = {};

    subscriptions.forEach(sub => {
      usage[sub.name] = { count: 0, items: [] };
    });

    watchlist.forEach(item => {
      if (item.platform && usage[item.platform]) {
        usage[item.platform].count++;
        usage[item.platform].items.push(item.customTitle);
      }
    });

    return usage;
  }

  /**
   * Calculate total monthly spending
   */
  calculateMonthlySpending(subscriptions) {
    if (!subscriptions || subscriptions.length === 0) return 0;
    
    const total = subscriptions.reduce((sum, sub) => {
      const cost = Number(sub.cost) || 0;
      return sum + cost;
    }, 0);
    
    console.log('Monthly Spending Calculation:', {
      subscriptionCount: subscriptions.length,
      costs: subscriptions.map(s => ({ name: s.name, cost: s.cost })),
      total
    });
    
    return total;
  }

  /**
   * Build readable analysis from rule-based recommendations
   */
  buildRuleBasedAnalysis(result) {
    let analysis = `📊 SUBSCRIPTION OPTIMIZATION ANALYSIS\n\n`;
    analysis += `Current Monthly Spending: $${result.currentSpending}\n\n`;

    analysis += `✅ SUBSCRIPTIONS TO KEEP:\n`;
    result.recommendations.keep.forEach(item => {
      analysis += `• ${item}\n`;
    });

    if (result.recommendations.cancel.length > 0) {
      analysis += `\n❌ SUBSCRIPTIONS TO CANCEL:\n`;
      result.recommendations.cancel.forEach(item => {
        analysis += `• ${item}\n`;
      });
    }

    analysis += `\n📅 OPTIMIZATION STRATEGY:\n${result.recommendations.strategy}\n`;

    analysis += `\n💰 POTENTIAL SAVINGS:\n`;
    analysis += `• Monthly: $${result.recommendations.savings.amount}\n`;
    analysis += `• Annual: $${(result.recommendations.savings.amount * 12).toFixed(2)}\n`;
    analysis += `• Percentage: ${result.recommendations.savings.percentage}% reduction\n`;

    analysis += `\n💡 ALTERNATIVE STRATEGIES:\n`;
    result.recommendations.alternatives.forEach(item => {
      analysis += `• ${item}\n`;
    });

    if (result.recommendations.rotationPlan) {
      analysis += `\n🔄 ROTATION PLAN:\n`;
      analysis += `Budget: $${result.recommendations.rotationPlan.monthlyBudget}/month\n`;
      analysis += `Active Services: ${result.recommendations.rotationPlan.simultaneousServices}\n\n`;
      
      result.recommendations.rotationPlan.months.forEach((month, idx) => {
        analysis += `Month ${idx + 1}: ${month.subscriptions.map(s => s.name).join(', ')} - $${month.totalCost.toFixed(2)}\n`;
      });
    }

    return analysis;
  }

  /**
   * Create a rotation plan that stays within the user's current budget
   */
  createRotationPlan(subscriptions, interests, watchlist, platformUsage, currentSpending) {
    console.log('=== createRotationPlan called ===');
    console.log('Subscriptions:', subscriptions.length);
    console.log('Current spending:', currentSpending);
    
    if (subscriptions.length < 2) {
      console.log('Not enough subscriptions for rotation (need 2+)');
      return null;
    }

    // Filter valid subscriptions
    const validSubs = subscriptions.filter(sub => {
      const isValid = sub && sub.name && sub.cost !== undefined && !isNaN(Number(sub.cost)) && Number(sub.cost) > 0;
      return isValid;
    });
    
    if (validSubs.length < 2) {
      console.log('Not enough valid subscriptions with cost data');
      return null;
    }
    
    // Recalculate current spending from valid subscriptions
    const actualSpending = validSubs.reduce((sum, sub) => sum + Number(sub.cost), 0);
    console.log('Actual spending from valid subs:', actualSpending);
    
    if (actualSpending === 0) {
      console.log('No spending to optimize');
      return null;
    }
    
    // Score each subscription based on watchlist content and genre matching
    const scoredSubs = validSubs.map(sub => {
      const usage = platformUsage[sub.name] || { count: 0, items: [] };
      const genreMatchScore = this.calculateGenreMatchScore(sub, interests, watchlist);
      
      return {
        name: sub.name,
        cost: Number(sub.cost),
        watchlistItems: usage.count,
        genreScore: genreMatchScore,
        totalScore: usage.count * 10 + genreMatchScore * 5, // High weight for watchlist
        items: usage.items || []
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    console.log('Scored subscriptions:', scoredSubs.map(s => ({
      name: s.name,
      cost: s.cost,
      watchlistItems: s.watchlistItems,
      score: s.totalScore
    })));

    // Determine how many services can be active simultaneously within 60% of budget
    // This creates savings while still maintaining access
    const targetBudget = Math.ceil(actualSpending * 0.6); // Aim for 40% savings
    let simultaneousServices = 1;
    let runningCost = 0;
    
    for (let i = 0; i < scoredSubs.length; i++) {
      if (runningCost + scoredSubs[i].cost <= targetBudget) {
        runningCost += scoredSubs[i].cost;
        simultaneousServices = i + 1;
      } else {
        break;
      }
    }

    // Ensure at least one service
    simultaneousServices = Math.max(1, simultaneousServices);
    console.log('Simultaneous services:', simultaneousServices, 'Target budget:', targetBudget);

    // Create 12-month rotation schedule
    const months = [];
    let currentIndex = 0;

    for (let month = 0; month < 12; month++) {
      const monthSubs = [];
      let monthCost = 0;
      const monthPlatforms = [];

      // Select subscriptions for this month based on rotation
      for (let i = 0; i < simultaneousServices && (currentIndex + i) < scoredSubs.length; i++) {
        const subIndex = (currentIndex + i) % scoredSubs.length;
        const sub = scoredSubs[subIndex];
        
        if (monthCost + sub.cost <= actualSpending) {
          monthPlatforms.push(sub.name);
          monthSubs.push({
            name: sub.name,
            cost: sub.cost,
            reason: sub.watchlistItems > 0 
              ? `${sub.watchlistItems} watchlist items` 
              : sub.genreScore > 0 
              ? 'Matches your interests'
              : 'Content variety',
            watchlistItems: sub.items
          });
          monthCost += sub.cost;
        }
      }

      // Find watchlist items available this month
      const availableContent = watchlist.filter(item => 
        item.platform && monthPlatforms.includes(item.platform)
      ).map(item => ({
        title: item.customTitle || 'Untitled',
        platform: item.platform,
        type: item.customType || item.type || 'TV Show'
      }));

      // Find watchlist items NOT available (waiting for rotation)
      const waitingContent = watchlist.filter(item => 
        item.platform && !monthPlatforms.includes(item.platform)
      ).slice(0, 5).map(item => ({
        title: item.customTitle || 'Untitled',
        platform: item.platform,
        type: item.customType || item.type || 'TV Show'
      }));

      months.push({
        month: month + 1,
        monthName: new Date(2025, month, 1).toLocaleDateString('en-US', { month: 'long' }),
        subscriptions: monthSubs,
        totalCost: monthCost,
        availableContent,
        availableCount: availableContent.length,
        waitingContent,
        waitingCount: waitingContent.length
      });

      // Rotate to next set of subscriptions
      currentIndex = (currentIndex + 1) % scoredSubs.length;
    }

    const yearlyTotal = months.reduce((sum, m) => sum + m.totalCost, 0);
    const estimatedSavings = Math.max(0, (actualSpending * 12) - yearlyTotal);

    console.log('Rotation plan created:', {
      simultaneousServices,
      monthsCreated: months.length,
      yearlyTotal,
      estimatedSavings
    });

    return {
      monthlyBudget: targetBudget,
      simultaneousServices,
      totalSubscriptions: validSubs.length,
      months,
      yearlyTotal,
      averageMonthly: yearlyTotal / 12,
      estimatedSavings,
      savingsPercentage: Math.round((estimatedSavings / (actualSpending * 12)) * 100)
    };
  }

  /**
   * Calculate how well a subscription matches user's genre preferences
   */
  calculateGenreMatchScore(subscription, interests, watchlist) {
    if (!interests || !interests.genres || interests.genres.length === 0) {
      return 0;
    }

    // Count watchlist items from this platform that match user's genres
    const platformItems = watchlist.filter(item => item.platform === subscription.name);
    
    // Simple scoring: 1 point per matching item
    return platformItems.length;
  }

  /**
   * Get reason for including subscription in rotation month
   */
  getRotationReason(subscription, monthIndex) {
    const reasons = [
      `High watchlist priority (${subscription.watchlistItems} items)`,
      'Genre match with your preferences',
      'Rotating to maximize content access',
      'Seasonal content availability'
    ];

    if (subscription.watchlistItems > 0) {
      return reasons[0];
    } else if (subscription.genreScore > 0) {
      return reasons[1];
    } else {
      return reasons[2];
    }
  }

  /**
   * Build detailed spending breakdown for current and future months
   */
  buildSpendingBreakdown(subscriptions, platformUsage, interests, watchlist, currentSpending) {
    console.log('=== buildSpendingBreakdown called ===');
    console.log('Input - subscriptions:', subscriptions.length);
    console.log('Input - currentSpending:', currentSpending);
    console.log('Input - watchlist:', watchlist.length);
    
    // Ensure subscriptions have valid data
    const validSubscriptions = subscriptions.filter(sub => {
      const isValid = sub && sub.name && sub.cost !== undefined && !isNaN(Number(sub.cost));
      if (!isValid && sub) {
        console.log('Invalid subscription filtered:', sub.name, 'cost:', sub.cost);
      }
      return isValid;
    });
    
    console.log('Valid subscriptions:', validSubscriptions.length);
    
    if (validSubscriptions.length === 0) {
      console.log('No valid subscriptions found - returning empty breakdown');
      return {
        currentMonth: { subscriptions: [], total: 0 },
        nextMonth: { subscriptions: [], total: 0 },
        threeMonthSchedule: [],
        monthlySavings: 0,
        yearlySavings: 0
      };
    }
    
    // Recalculate spending from valid subscriptions
    const actualCurrentSpending = validSubscriptions.reduce((sum, sub) => sum + (Number(sub.cost) || 0), 0);
    console.log('Actual current spending:', actualCurrentSpending);
    
    // Current month - all active subscriptions
    const currentMonth = {
      subscriptions: validSubscriptions.map(sub => ({
        name: sub.name,
        cost: Number(sub.cost) || 0,
        watchlistItems: platformUsage[sub.name]?.count || 0
      })),
      total: actualCurrentSpending
    };

    // Identify subscriptions to keep based on usage
    // Priority: 1) Has watchlist content, 2) Matches user interests/genres, 3) Keep cheapest
    const subsWithScores = validSubscriptions.map(sub => {
      const usage = platformUsage[sub.name] || { count: 0 };
      const genreMatch = this.calculateGenreMatchScore(sub, interests, watchlist);
      const cost = Number(sub.cost) || 0;
      const score = usage.count * 10 + genreMatch * 5; // High weight for watchlist
      
      return {
        sub,
        usage: usage.count,
        genreMatch,
        cost,
        score
      };
    });

    // Sort by score (descending) then by cost (ascending)
    subsWithScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.cost - b.cost;
    });

    console.log('Subscription scores:', subsWithScores.map(s => ({
      name: s.sub.name,
      score: s.score,
      usage: s.usage,
      cost: s.cost
    })));

    // Keep subscriptions with score > 0, or keep at least 1-2 cheapest
    let finalSubsToKeep = subsWithScores.filter(s => s.score > 0).map(s => s.sub);
    
    if (finalSubsToKeep.length === 0 && validSubscriptions.length > 0) {
      // No matches - keep 1-2 cheapest subscriptions
      finalSubsToKeep = subsWithScores.slice(0, Math.min(2, subsWithScores.length)).map(s => s.sub);
      console.log('No scoring matches - keeping cheapest:', finalSubsToKeep.map(s => s.name));
    }

    console.log('Final subscriptions to keep:', finalSubsToKeep.map(s => s.name));

    const nextMonthTotal = finalSubsToKeep.reduce((sum, sub) => sum + (Number(sub.cost) || 0), 0);
    console.log('Next month total:', nextMonthTotal);

    // Next month with recommendations applied
    const nextMonth = {
      subscriptions: finalSubsToKeep.map(sub => ({
        name: sub.name,
        cost: Number(sub.cost) || 0,
        watchlistItems: platformUsage[sub.name]?.count || 0,
        reason: platformUsage[sub.name]?.count > 0 
          ? `${platformUsage[sub.name].count} watchlist items`
          : 'Matches your preferences'
      })),
      total: nextMonthTotal
    };

    // Create 3-month schedule with watchlist content
    const threeMonthSchedule = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Month 1: current subscriptions, Months 2-3: recommended subscriptions
      const monthSubscriptions = i === 0 ? validSubscriptions : finalSubsToKeep;
      const activePlatforms = monthSubscriptions.map(s => s.name);
      const monthTotal = i === 0 ? actualCurrentSpending : nextMonthTotal;

      // Find watchlist items available this month
      const availableContent = watchlist.filter(item => 
        item.platform && activePlatforms.includes(item.platform)
      ).slice(0, 10).map(item => ({
        title: item.customTitle || 'Untitled',
        platform: item.platform,
        type: item.customType || item.type || 'TV Show',
        status: item.status
      }));

      console.log(`Month ${i + 1} (${monthName}):`, {
        subscriptions: monthSubscriptions.length,
        total: monthTotal,
        content: availableContent.length
      });

      threeMonthSchedule.push({
        month: monthName,
        monthNumber: i + 1,
        subscriptions: monthSubscriptions.map(sub => ({
          name: sub.name,
          cost: Number(sub.cost) || 0,
          watchlistItems: platformUsage[sub.name]?.count || 0
        })),
        total: monthTotal,
        availableContent,
        contentCount: availableContent.length
      });
    }

    const monthlySavings = Math.max(0, actualCurrentSpending - nextMonthTotal);
    const yearlySavings = monthlySavings * 12;

    console.log('Final breakdown:', {
      currentTotal: actualCurrentSpending,
      nextTotal: nextMonthTotal,
      monthlySavings,
      yearlySavings,
      scheduleLength: threeMonthSchedule.length
    });

    return {
      currentMonth,
      nextMonth,
      threeMonthSchedule,
      monthlySavings,
      yearlySavings
    };
  }

  /**
   * Build rotation strategy text
   */
  buildRotationStrategy(rotationPlan, totalSubs) {
    if (!rotationPlan) {
      return 'Consider rotating subscriptions monthly to maximize content access while minimizing costs.';
    }

    const avgMonthlyCost = rotationPlan.yearlyTotal / 12;
    const monthlySavings = rotationPlan.monthlyBudget - avgMonthlyCost;

    let strategy = `🔄 SMART ROTATION PLAN:\n\n`;
    strategy += `Your current budget allows ${rotationPlan.simultaneousServices} active subscription(s) at a time out of ${totalSubs} total.\n\n`;
    strategy += `By rotating your subscriptions every ${Math.ceil(12 / (totalSubs / rotationPlan.simultaneousServices))} months, you can:\n`;
    strategy += `• Stay within your $${rotationPlan.monthlyBudget}/month budget\n`;
    strategy += `• Access all ${totalSubs} services throughout the year\n`;
    strategy += `• Save approximately $${monthlySavings.toFixed(2)}/month on average\n`;
    strategy += `• Total yearly savings: $${rotationPlan.estimatedSavings.toFixed(2)}\n\n`;
    strategy += `📅 RECOMMENDED ROTATION:\n`;
    
    // Show first 3 months as example
    for (let i = 0; i < Math.min(3, rotationPlan.months.length); i++) {
      const month = rotationPlan.months[i];
      strategy += `\nMonth ${month.month}: ${month.subscriptions.map(s => s.name).join(' + ')} ($${month.totalCost.toFixed(2)})\n`;
      month.subscriptions.forEach(sub => {
        strategy += `  • ${sub.name}: ${sub.reason}\n`;
      });
    }

    if (rotationPlan.months.length > 3) {
      strategy += `\n...and so on for the remaining ${rotationPlan.months.length - 3} months.\n`;
    }

    strategy += `\n💡 TIP: Set calendar reminders to cancel/reactivate subscriptions at the start of each rotation period.`;

    return strategy;
  }
}

module.exports = new SubscriptionOptimizerService();
