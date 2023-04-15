const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

//@desc Get all users
//@route GET /users
//@access Private

const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password').lean()
    if(!users){
        return res.status(400).json({message:'No users found'})
    }
    res.json(users)
})
//@desc Create New user
//@route POST /users
//@access Private

const createNewUser = asyncHandler(async (req, res, next) => {
    const { username, password, roles } = req.body;

    //Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'}); 
    }

    //Check for duplicates
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate) {
        return res.status(409).json({message: 'Duplicate username'})
    }

    //hash the password
    const hashedPwd = await bcrypt.hash(password, 10) //salt rounds

    const userObject = { username, "password": hashedPwd, roles }

    //Create and store new user
    const user = await User.create(userObject)

    if (user) { //created
        res.status(201).json({message: `New user ${username} created`})
    } else { //
        res.status(400).json({message: 'Invalid user data received'});
    }
})

//@desc Update a user
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async (req, res, next) => {
    const { id, username, roles, active, password } = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active != boolean) {
        
    }
})

//@desc Delete a user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async (req, res, next) => {

})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}