import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Exponential backoff helper
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: Request) {
  try {
    // 1. Grab the uploaded file from the frontend
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No PDF provided' }, { status: 400 });
    }

    // 2. Convert the browser File object into a Base64 string for Google
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY as string);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.8-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            candidate_summary: { type: SchemaType.STRING },
            matched_skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            readiness_score: { type: SchemaType.INTEGER },
            bias_flags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["candidate_summary", "matched_skills", "readiness_score", "bias_flags"]
        }
      }
    });

    const prompt = "You are an impartial technical recruiter. Evaluate this candidate based ONLY on the attached resume. Strip all demographic data (name, gender, university).";
    const maxRetries = 4;

    // 4. The Self-Healing Execution Loop
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Data, mimeType: 'application/pdf' } }
        ]);
        
        // Return the clean JSON to the frontend
        return NextResponse.json(JSON.parse(result.response.text()));
        
      } catch (error: any) {
        if (error.status === 503 && i < maxRetries - 1) {
          await delay((2 ** i) * 1000); // 1s, 2s, 4s backoff
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Failed to process PDF or server is overloaded.' }, { status: 500 });
  }
}