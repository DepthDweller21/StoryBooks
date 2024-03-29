const express = require('express')
const router = express.Router()
const {ensureAuth}=require('../middleware/auth')
const Story=require('../models/Story')

//@desc show add page
//@route GET /stories/add
router.get('/add',ensureAuth,(req,res)=>{
    res.render('_stories/add')
})

//@desc send stuff to database
//@route POST /

router.post('/',ensureAuth,async (req,res)=>{
    try{
        req.body.user=req.user.id
        console.log(req.user.id)
        await Story.create(req.body)
        res.redirect('/dashboard')
    }catch(err){
        console.error(err)
        console.render('error/500')
    }
})


//@desc show public stories page
//@route GET /stories

router.get('/',ensureAuth,ensureAuth,async (req,res)=>{
    try{
        const stories = await Story.find({status: 'public'})
        .populate('user')
        .sort({createdAt:'desc'})
        .lean()
        res.render('_stories/index',{
            stories:stories
        })
    }catch(err){
        console.error(err)
        res.render('error/500')
    }
})

//@desc show single story
//@route GET /stories/:id
router.get('/:id',ensureAuth,async (req,res)=>{
    try{
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean()

        if(!story) res.render('error/404')

        res.render('_stories/show',{story:story})
    }catch(err){
        console.error(err)
        res.render('error/404')
    }
})

//@desc show edit page
//@route GET /stories/edit/:id
router.get('/edit/:id',ensureAuth, async (req,res)=>{
    const story = await Story.findOne({
        _id:req.params.id
    }).lean()

    if(!story){
        return res.render('error/404')
    }
    if(story.user != req.user.id){
        res.redirect('/stories')
    }else{
        res.render('_stories/edit',{
            story
        })
    }
})

//@desc update stories
//@route PUT /stories/:id
router.put('/:id',ensureAuth,async (req,res)=>{
    
    try{
        let story =await Story.findById(req.params.id).lean()

        if(!story)return res.render('error/404')

        if(story.user != req.user.id){
            res.redirect('/stories')
        }else{
        story=await Story.findOneAndUpdate({
            _id:req.params.id}, req.body,{new:true, runValidators:true})
        }

        res.redirect('/dashboard')
    }catch(err){
        console.error(err)
        res.render('error/500')
    }
})

router.delete('/:id',ensureAuth,async (req,res)=>{
    try {
        await Story.deleteOne({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }

})

//@desc show User's stories
//@route GET /stories/add
router.get('/user/:id',ensureAuth,async (req,res)=>{
    
    try{
        const stories=await Story.find({
            user:req.params.id,
            status:'public'
        })
        .populate('user')
        .lean()
        console.log('got your shit')
        res.render('_stories/index',{
            stories:stories
        })
    }catch(err){

    }
})

module.exports=router;