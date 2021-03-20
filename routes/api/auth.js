const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator/check');

// import modal
const User = require('../../models/User')

// @route   GET api/auth
// @desc    testing
// @access  public
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').select('-_id');
        return res.status(200).json({ user });
    } catch (err) {
        console.log(err)
        return res.status(500).json([{ msg: 'server error' }])
    }
});

// @route   POST api/auth
// @desc    Verify user and send token
// @access  public

router.post('/', [
    check('email', 'plaese enter a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        email,
        password
    } = req.body;

    try {

        // See if users exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                errors: [
                    { msg: 'Invalid credential' }
                ]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                errors: [
                    { msg: 'Invalid credential' }
                ]
            })
        }

        // Get JWT
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000 }, (error, token) => {
            if (error) throw errors;
            // return JWTtoken
            return res.json({ token })
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ errors: 'Server error' })
    }
});


module.exports = router;