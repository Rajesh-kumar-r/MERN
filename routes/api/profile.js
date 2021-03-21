const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator/check')


// @route   GET api/profile/me
// @desc    Get current users PRofile
// @access  Private

router.get('/me', auth, async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json([{ msg: 'There in no profile for this users' }]);
        }

    } catch (err) {
        console.error(err)
        return res.status(500).json([{ msg: 'Server error' }])
    }

});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skill', 'Skills is required').not().isEmpty(),
]], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array())
    }
    const {
        company,
        website,
        location,
        status,
        skill,
        bio,
        githubusername,
        youtube,
        twitter,
        facebook,
        instagram,
        linkedin
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skill) {
        profileFields.skill = skill.split(',').map(skill => skill.trim());
    };

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (twitter) profileFields.social.twitter = twitter;
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        console.log(profile);
        if (profile) {
            // Update existing Profile
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            return res.json(profile);
        }

        // Save profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error')
    }
});

// @route   GET api/profile
// @desc    Get all users PRofile
// @access  Private

router.get('/', auth, async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.status(200).json(profiles);
    } catch (err) {
        console.error(err)
        return res.status(500).json([{ msg: 'Server error' }])
    }

});

// @route   GET api/profile/user/:user_id
// @desc    Get all users PRofile
// @access  Public

router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).send('user not found')
        }
        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        if (err.kind == 'ObjectId') {
            return res.status(400).send('user not found')
        }
        return res.status(500).json([{ msg: 'Server error' }])
    }

});

// @route   DELETE api/profile
// @desc    Delete user, profile and post 
// @access  Private

router.delete('/', auth, async(req, res) => {
    try {
        // Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });

        return res.status(200).send('Deleted Success fully');
    } catch (err) {
        console.error(err);
        return res.status(500).json([{ msg: 'Server error' }])
    }

});

module.exports = router;