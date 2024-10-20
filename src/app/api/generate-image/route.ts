'use server'

import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

async function generateImageWithRetry(prompt: string, retries = 0): Promise<OpenAI.Images.ImagesResponse> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    return response;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return generateImageWithRetry(prompt, retries + 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    const response = await generateImageWithRetry(prompt);
    return NextResponse.json({ imageUrl: response.data[0].url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
