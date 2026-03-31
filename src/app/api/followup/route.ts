import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { FOLLOWUP_PROMPT } from "@/lib/system-prompt";

export async function POST(request: NextRequest) {
  try {
    const { message, previousBreakdown } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: FOLLOWUP_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the breakdown I gave before:\n${JSON.stringify(previousBreakdown)}\n\nThe student says: "${message}"`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No response generated" },
        { status: 500 }
      );
    }

    const rawText = textBlock.text;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ||
      rawText.match(/(\{[\s\S]*\})/);

    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse response" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[1]);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Follow-up error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process follow-up";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
