const bcrypt = require('bcrypt');
const secret_key = process.env.SECRET_KEY

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');



const register = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    console.log('Signup request:', req.body);

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'User already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ firstname, lastname, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: 'Registered successfully' });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
}



const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' }); // 401
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' }); // 401
        }

        const token = jwt.sign(
            { email: user.email, _id: user._id },
            secret_key,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            userId: user._id,
            username: user.firstname + ' ' + user.lastname
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });  // 500 server error
    }
};



module.exports={login,register}
