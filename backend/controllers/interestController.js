const Interest = require('../models/Interest');

// @desc    Get user interests
// @route   GET /api/interests
// @access  Private
const getInterests = async (req, res) => {
  try {
    const interests = await Interest.findOne({ user: req.user._id });

    if (!interests) {
      return res.status(404).json({ message: 'No interests found. Please add your interests.' });
    }

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update user interests
// @route   POST /api/interests
// @access  Private
const createOrUpdateInterests = async (req, res) => {
  try {
    const { genres, favoriteShows, favoriteMovies, preferredContentType, watchingTime } = req.body;

    // Check if interests already exist
    let interests = await Interest.findOne({ user: req.user._id });

    if (interests) {
      // Update existing interests
      interests = await Interest.findOneAndUpdate(
        { user: req.user._id },
        {
          genres,
          favoriteShows,
          favoriteMovies,
          preferredContentType,
          watchingTime,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new interests
      interests = await Interest.create({
        user: req.user._id,
        genres,
        favoriteShows,
        favoriteMovies,
        preferredContentType,
        watchingTime,
      });
    }

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add favorite show
// @route   POST /api/interests/shows
// @access  Private
const addFavoriteShow = async (req, res) => {
  try {
    const { name, platform } = req.body;

    let interests = await Interest.findOne({ user: req.user._id });

    if (!interests) {
      interests = await Interest.create({
        user: req.user._id,
        favoriteShows: [{ name, platform }],
      });
    } else {
      interests.favoriteShows.push({ name, platform });
      await interests.save();
    }

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add favorite movie
// @route   POST /api/interests/movies
// @access  Private
const addFavoriteMovie = async (req, res) => {
  try {
    const { name, platform } = req.body;

    let interests = await Interest.findOne({ user: req.user._id });

    if (!interests) {
      interests = await Interest.create({
        user: req.user._id,
        favoriteMovies: [{ name, platform }],
      });
    } else {
      interests.favoriteMovies.push({ name, platform });
      await interests.save();
    }

    res.json(interests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete interests
// @route   DELETE /api/interests
// @access  Private
const deleteInterests = async (req, res) => {
  try {
    const interests = await Interest.findOne({ user: req.user._id });

    if (!interests) {
      return res.status(404).json({ message: 'No interests found' });
    }

    await Interest.findOneAndDelete({ user: req.user._id });

    res.json({ message: 'Interests removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInterests,
  createOrUpdateInterests,
  addFavoriteShow,
  addFavoriteMovie,
  deleteInterests,
};
