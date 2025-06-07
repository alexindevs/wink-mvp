/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import geoip from 'fast-geoip'

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
      // In development, you might get null, so provide a fallback
      ip = '127.0.0.1'; // or just leave empty string
    }
    
    console.log('Detected IP:', ip);
    const geo = await geoip.lookup(ip || '')
    const location = geo ? `${geo.city ?? ''}, ${geo.region}, ${geo.country}` : 'an unknown location'

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
        const prompt = `Top-down photo of a beautifully plated dish of ${suggestion.name}, made with ${suggestion.ingredients.join(", ")}. It's a dish native to " Styled like a food magazine shoot, realistic lighting.`;

        try {
          const imageRes = await openai.images.generate({
            model: "dall-e-2",
            prompt,
            n: 1,
            size: "512x512",
            response_format: "url", // use "b64_json" if you want base64 instead
          });

          if (!imageRes || !imageRes.data || imageRes.data.length === 0) {
            console.error(`Image generation failed for ${suggestion.name}:`, imageRes.data);
            return { ...suggestion, picture: null };
          }

          const imageUrl = imageRes.data[0]?.url ?? null;
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
