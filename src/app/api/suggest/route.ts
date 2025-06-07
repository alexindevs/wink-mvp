/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import geoip from 'fast-geoip'
import { rateAndUsageLimiter } from '@/lib/rateLimiter';
import { kv } from '@/lib/kv' // make sure this is correctly set up

interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  missingIngredients: string[];
  steps: string[];
  picture?: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getMealImage(meal: MealSuggestion) {
  const cacheKey = `meal:image:${meal.name.toLowerCase().replace(/\s+/g, '_')}`
  const cachedUrl = await kv.get<string>(cacheKey)

  if (cachedUrl) return cachedUrl

  const prompt = `Top-down photo of a beautifully plated dish of ${meal.name}, made with ${meal.ingredients.join(', ')}. Styled like a food magazine shoot, realistic lighting.`

  const imageRes = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '512x512',
    response_format: 'url',
  })

  if (!imageRes?.data?.length) {
    console.error(`Image generation failed for ${meal.name}:`, imageRes.data)
    return null
  }

  const imageUrl = imageRes.data[0]?.url
  if (!imageUrl) {
    console.error(`Image URL not found for ${meal.name}:`, imageRes.data)
    return null
  }

  await kv.set(cacheKey, imageUrl)
  await kv.expire(cacheKey, 60 * 60 * 24 * 7);

  return imageUrl
}

export async function POST(req: NextRequest) {
  try {
    const { input, time, day } = await req.json();
    
    // Get IP from headers only
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    
    let ip = '';
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp;
    } else {
      ip = '127.0.0.1';
    }
    
    console.log('Detected IP:', ip);
    const limit = await rateAndUsageLimiter(ip);
    if (!limit.ok) {
      return NextResponse.json({ error: limit.reason }, { status: 429 });
    }
    const geo = await geoip.lookup(ip || '')
    const location = geo ? `${geo.city ?? ''}, ${geo.region}, ${geo.country}` : 'an unknown location'
    console.log('Detected location:', location);

    const systemPrompt = `
You are a helpful kitchen assistant.

A user is located in ${location}. Today is ${day}, and it's currently ${time}.

They have the following ingredients: ${input}.

Making sure the meals are real and relevant, suggest a maximum of 5 meals they could cook, formatted **strictly** in the following JSON structure:

[
  {
    "name": "Meal Name",
    "description": "Short summary of what it is.",
    "ingredients": ["all", "ingredients", "used"],
    "missingIngredients": ["which ingredients the user doesn't have, formatted exactly as listed in ingredients"],
    "steps": ["list", "each", "step", "clearly"]
  }
]

Do not include any text before or after the JSON. Do not include any markdown formatting. Output only valid JSON.
    `.trim();

    // Call GPT to generate suggestions
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content ?? "";
    let suggestions: MealSuggestion[] = [];

    try {
      suggestions = JSON.parse(raw);
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON format from AI", raw }, { status: 500 });
    }

    // For each suggestion, generate a food image
    const suggestionsWithImages = await Promise.all(
      suggestions.map(async (suggestion) => {
        try {
          const imageUrl = await getMealImage(suggestion);
          return { ...suggestion, picture: imageUrl };
        } catch (imageError) {
          console.error(`Image generation failed for ${suggestion.name}:`, imageError);
          return { ...suggestion, picture: null };
        }
      })
    );

    return NextResponse.json({ result: suggestionsWithImages });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
