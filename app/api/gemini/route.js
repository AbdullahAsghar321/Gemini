import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { message } = await req.json();
  
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Get API key from environment variables
  const API_KEY = process.env.API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1000,
      },
    });

    const result = await model.generateContent(message);
    
    if (!result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected response format from Gemini API");
    }
    
    const response = result.response.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply: response });
    
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch response" }, 
      { status: 500 }
    );
  }
}