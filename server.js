import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";

dotenv.config();

const app = express();

const upload = multer({
    dest: "uploads/"
});

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/scan", upload.single("receipt"), async (req, res) => {

    try{

        const image = fs.readFileSync(req.file.path);

        const base64 = image.toString("base64");

        const response = await client.chat.completions.create({

            model:"gpt-4.1",

            messages:[
                {
                    role:"user",

                    content:[
                        {
                            type:"text",

                            text:
`Read this receipt.

Return ONLY JSON.

{
merchant:"",
date:"",
subtotal:"",
tax:"",
total:"",
category:""
}`
                        },
                        {
                            type:"image_url",

                            image_url:{
                                url:`data:image/png;base64,${base64}`
                            }
                        }
                    ]
                }
            ]
        });

        fs.unlinkSync(req.file.path);

        res.json(
            JSON.parse(
                response.choices[0].message.content
            )
        );

    }
    catch(err){

        res.status(500).json(err);

    }

});

app.listen(3000);