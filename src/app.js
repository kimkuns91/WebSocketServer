const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { OpenAI } = require('openai');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const OPENAI_KEY = require('./common')

const openai = new OpenAI({
    apiKey: OPENAI_KEY,
});

wss.on('connection', (ws) => {
    let conversationHistory = [
        {
            role: 'system',
            content: "You are an outstanding web app designer. Answer customer questions related to web apps in an easy-to-understand manner. If a customer asks something unrelated to web apps, respond as if you don't have information on that topic. Please respond in Korean."
        }
    ];
    ws.on('message', async (message) => {
        try {
            const { text } = JSON.parse(message);
            conversationHistory.push({
                role: 'user',
                content: text,
            });
            
            const stream = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: conversationHistory,
                stream: true,
            });

            let accumulatedResponse = '';

            for await (const part of stream) {
                const contentPart = part.choices[0]?.delta?.content || '';
                accumulatedResponse += contentPart
                ws.send(JSON.stringify({ answer: contentPart }))
            }

            conversationHistory.push({
                role: 'assistant',
                content: accumulatedResponse,
            });

            ws.send(JSON.stringify({ status: 'completed' }));

        } catch (error) {
            console.error('OpenAI API 호출 중 오류 발생:', error);
        }
    });
});

module.exports = app

