const mongoose = require('mongoose'); //Creates "digital ID cards" for logged-in users
const bcrypt = require('bcryptjs'); //Encrypts passwords so they're safe in database

// User schema - defines how user data is stored in MongoDB
const userSchema = new mongoose.Schema({
    //Basic user info - *** CHANGED FROM fullname TO fullName ***
    fullName: {  // ← FIXED: Changed from 'fullname' to 'fullName'
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be atleast 2 characters'],
        maxlength: [100, 'Name connot exceed 100 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, //unique emails everytime
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
        index: true, //for faster queries
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId; // *** FIXED: Changed from 'googlrID' to 'googleId' ***
        },
        minlength: [6, 'Password must be at least 6 characters'] //goin to be in hash before storing in database
    },

    //Google 0Auth information (if user signs up with Google)
    googleId: {
        type: String,
        sparse: true, //allows multiple null values but unique non-null values
        index: true,
    },

    profilePicture: {
        type: String,
        default: null
    },


    // And make password NOT required for Google users:
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password only required if NOT using Google
        },
        minlength: [6, 'Password must be at least 6 characters']
    },

    //User role and status
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    isEmailVerified: {  // *** FIXED: Changed from 'isEmailverfied' to 'isEmailVerified' ***
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    //Security fields
    lastLogin: {
        type: Date,
        default: null
    },

    loginAttempts: {
        type: Number,
        default: 0
    },

    lockUntil: {
        type: Date,
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    //Timestamps - *** FIXED: Changed from 'createAt' to 'createdAt' ***
    createdAt: {  // ← FIXED: Changed from 'createAt' to 'createdAt'
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            //Remove password and sensitive fields when converting to JSON
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpires;
                delete ret.__v;
                return ret;
            }
        }
    });

//Index for better query performance 
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ googleId: 1 });

//Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

//pre-save middleware to hash password 
userSchema.pre('save', async function (next) {
    //Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        //Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});

//Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        //Compare the provided password with the hashed password in database 
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

//Instance method to handle failed login attemps 
userSchema.methods.incLoginAttempts = async function () {
    // if we have a previous lock that has expired, restart at 1
    // *** FIXED: Changed from 'lookUntil' to 'lockUntil' ***
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },  // ← FIXED: Changed from 'lookUntil'
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    //lock account after 5 failed attempts for 2 hours 
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; //2 hours
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne(
        { $unset: { loginAttempts: 1, lockUntil: 1 } }
    );
};

//Static method to find user by email - *** FIXED: Changed from 'static' to 'statics' ***
userSchema.statics.findByEmail = function (email) {  // ← FIXED: Changed from 'static' to 'statics'
    return this.findOne({
        email: email.toLowerCase(),
        isActive: true
    });
};

//Static method to create user with Google 0Auth
userSchema.statics.findOrCreateGoogleUser = async function (profile) {
    try {
        // Try to find existing user with this Google ID
        let user = await this.findOne({ googleId: profile.id });

        if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return user;
        }

        // Check if user exists with the same email
        user = await this.findByEmail(profile.emails[0].value);

        if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.profilePicture = profile.photos[0]?.value || null;
            user.isEmailVerified = true;
            user.lastLogin = new Date();
            await user.save();
            return user;
        }

        // Create new user
        user = new this({
            fullName: profile.displayName,  // *** FIXED: This now matches the schema field name ***
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value || null,
            isEmailVerified: true,
            lastLogin: new Date()
        });

        await user.save();
        return user;

    } catch (error) {
        throw error;
    }
};

// Static method to get user statistics
userSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                },
                googleUsers: {
                    $sum: { $cond: [{ $ne: ['$googleId', null] }, 1, 0] }
                },
                emailUsers: {
                    $sum: { $cond: [{ $eq: ['$googleId', null] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        googleUsers: 0,
        emailUsers: 0
    };
};

module.exports = mongoose.model('User', userSchema);