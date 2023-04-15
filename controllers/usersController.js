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
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== boolean) {
        return res.status(400).json({ message: 'All fields are required'})
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    //Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()

    //Allow updates to the original user
    if(duplicate && duplicate?._id.toString() != id) { 
       return res.status(409).json({ message: 'Duplicate usernames'}) 
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password) {
        //hash the password
        user.password = await bcrypt.hash(password, 10) //salt rounds
    }

    const updateUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

//@desc Delete a user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({message: 'User ID Required'})
    }
    const notes = await Note.findOne({ user: id }).lean().exec()
    
    if(notes?.length) {
        return res.status(400).json({ message : 'User has assigned note'})
    }

    const user = await User.findById(id).exec()
    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await User.deleteOne()
    
    const reply = `${result.username} with ID ${result._id} deleted successfully`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}