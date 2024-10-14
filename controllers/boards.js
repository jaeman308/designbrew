const express = require('express');
const router = express.Router();
const User = require('../models/user.js')
const multer = require('multer');
const upload = multer({dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype) && (file.fieldname === 'image'|| file.fieldname === 'profilePicture')) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('Unexpected field or file type'), false);
        }
    }
});

router.get('/', async (req, res) => { 
    try {
        const currentUser = await User.findById(req.session.user._id);
        res.render('boards/index.ejs', {
        boards: currentUser.boards,
        user: currentUser,
        })
    } catch (error) { 
        console.log(error)
        res.redirect('/')

    }
}); 

router.get('/new', async (req, res) => {
    try {
        const currentUsre = await User.findById(req.session.user._id);
    res.render('boards/new.ejs');
    }catch (error) {
        console.log(error);
        res.redirect ('/');
    }
});

router.get('/:boardId', async (req, res) => {
    try{ 
        const currentUser = await User.findById(req.session.user._id);
        const board = currentUser.boards.id(req.params.boardId);
        res.render('boards/show.ejs', {
            board: board,
            user: currentUser
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:boardId/edit', async (req, res) => {
    try{
        const currentUser = await User.findById(req.session.user._id);
        const board = currentUser.boards.id(req.params.boardId);
        res.render('boards/edit.ejs', {
            board: board,
        });
    }catch (error) {
        console.log(error);
        res.redirect('/')
    }
});

router.put('/:boardId', upload.single('image'), async (req, res) => {
    try{
        const currentUser = await User.findById(req.session.user._id);
        const board = currentUser.boards.id(req.params.boardId);
        board.set(req.body);

        if(req.file) {
            board.image = req.file.filename;
        }

        await currentUser.save();
        res.redirect(`/users/${currentUser._id}/boards/${req.params.boardId}`);
    }catch (error) {
        console.log(error);
        res.redirect('/')
    }
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        const boardData = {
            room: req.body.room,
            category: req.body.category,
            image: `/uploads/${req.file.filename}`,
            description: req.body.description
        }
        currentUser.boards.push(boardData);
        await currentUser.save();
        res.redirect(`/users/${currentUser._id}/boards`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.delete('/:boardId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user._id);
        currentUser.boards.id(req.params.boardId).deleteOne();
        await currentUser.save();
        res.redirect(`/users/${currentUser._id}/boards`);
    }catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;
