const Subscription = require('../models/Subscription');
const Interest = require('../models/Interest');
const Watchlist = require('../models/Watchlist');
const optimizerService = require('../services/subscriptionOptimizerService');

/**
 * Get subscription optimization recommendations
 */
exports.getOptimizationRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's subscriptions
    const subscriptions = await Subscription.find({ user: userId });

    // Fetch user's interests
    const interests = await Interest.findOne({ user: userId });

    // Fetch user's watchlist
    const watchlist = await Watchlist.find({ user: userId });

    // Check if user has enough data
    if (subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No subscriptions found. Add your subscriptions to get optimization recommendations.',
        recommendations: null
      });
    }

    // Prepare data for analysis
    const userData = {
      subscriptions: subscriptions.map(sub => ({
        name: sub.serviceName || sub.name,
        cost: sub.monthlyPrice || sub.cost,
        startDate: sub.startDate,
        billingCycle: sub.billingCycle
      })),
      interests: interests ? {
        genres: interests.genres,
        preferredContentType: interests.preferredContentType,
        watchingTime: interests.watchingTime
      } : null,
      watchlist: watchlist.map(item => ({
        customTitle: item.customTitle,
        platform: item.recommendedPlatforms?.[0]?.platform || item.platform || 'Unknown',
        type: item.customType || item.type,
        status: item.status
      }))
    };

    // Get recommendations from optimizer service
    const recommendations = await optimizerService.analyzeSubscriptions(userData);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting optimization recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

/**
 * Get subscription timeline/schedule recommendations
 */
exports.getSubscriptionSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.find({ user: userId }).sort({ startDate: 1 });

    // Create a 12-month schedule
    const schedule = [];
    const today = new Date();

    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + month, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const monthData = {
        month: monthName,
        date: monthDate,
        subscriptions: [],
        totalCost: 0
      };

      // Check which subscriptions are active this month
      subscriptions.forEach(sub => {
        const startDate = new Date(sub.startDate);
        const endDate = sub.endDate ? new Date(sub.endDate) : null;

        // Check if subscription is active during this month
        if (startDate <= monthDate && (!endDate || endDate >= monthDate)) {
          monthData.subscriptions.push({
            name: sub.name,
            cost: sub.cost,
            status: 'active'
          });
          monthData.totalCost += sub.cost;
        }
      });

      schedule.push(monthData);
    }

    // Calculate totals
    const yearlyTotal = schedule.reduce((sum, month) => sum + month.totalCost, 0);
    const averageMonthly = yearlyTotal / 12;

    res.json({
      success: true,
      schedule,
      summary: {
        yearlyTotal: yearlyTotal.toFixed(2),
        averageMonthly: averageMonthly.toFixed(2),
        currentMonthTotal: schedule[0].totalCost.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting subscription schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating schedule',
      error: error.message
    });
  }
};
