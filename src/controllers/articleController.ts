import { MongooseError } from "mongoose";
import handleMongooseError from "../utils/errorHandler";
import {Request, Response} from 'express'
import Article from "../models/articleModel";
import { IUser } from "../models/userModel";

export const getArticle = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const article = await Article.findOne({_id: id})
        if(!article)
            return res.status(404).json({status: "Not Found", message: "Article not found"});

        return res.status(200).json({status: "OK", article})
    } catch(e){
        handleMongooseError(e as MongooseError, res)
    }
}

export const getAllArticles = async (req: Request, res: Response) => {
    try {
        const articles = await Article.find({})
        res.status(200).json({status: "OK", articles: articles})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

export const postArticle = async (req: Request, res: Response) => {
    const {title, content, image} = req.body
    console.log(req.body)
    try {
        const article = await Article.create({title, content, image, author: (req.user as IUser)._id})
        return res.status(201).json({status: "Created", article})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

export const putArticle = async (req: Request, res: Response) => {
    const {id} = req.params
    const {title, content, author} = req.body
    try {
        const article = await Article.findOne({_id: id})
        if(!article)
            return res.status(404).json({status: "Not Found", message: "Article not found"});
        article.title = title
        article.content = content
        article.author = author
        await article.save()
        return res.status(200).json({status: "OK", article})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

export const deleteArticle = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const article = await Article.findOneAndDelete({_id: id})
        if(!article)
            return res.status(404).json({status: "Not Found", message: "Article not found"});
        return res.status(200).json({status: "OK", message: "Article deleted"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}