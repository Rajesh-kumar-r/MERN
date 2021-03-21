const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();
const config = require('config')
const { check, validationResult } = require('express-validator/check');

// import modal
const User = require('../../models/User')

// @route   POST api/user
// @desc    register user
// @access  public

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'plaese enter a valid email').isEmail(),
    check('password', 'plaese enter a password with 6 or more character').isLength({ min: 6 }),
], async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {

        // See if users exist
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                errors: [
                    { msg: 'user already exist' }
                ]
            })
        }

        // Get user gravaat
        const avatar = gravatar.url(email, {
            s: 200,
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save in DB
        await user.save();

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