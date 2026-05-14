import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GameState, GameResponse, getCurrentLandmark } from '@/lib/gameState';
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/prompt';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { state, choice }: { state: GameState; choice: string } = await req.json();

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserMessage(state, choice),
        },
      ],
    });

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip any markdown code fences if Claude wraps the JSON
    const jsonText = rawText.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

    let parsed: GameResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse game response', raw: rawText },
        { status: 500 }
      );
    }

    // Ensure landmark is updated based on miles
    parsed.state.landmark = getCurrentLandmark(parsed.state.milesFromStart);

    // Guard against Claude omitting nested objects
    parsed.state.wagonParts = parsed.state.wagonParts ?? { wheels: 0, axles: 0, tongues: 0 };
    parsed.state.party = parsed.state.party ?? [];
    parsed.state.recentEvents = parsed.state.recentEvents ?? [];

    // Keep recentEvents capped at 4
    if (parsed.state.recentEvents.length > 4) {
      parsed.state.recentEvents = parsed.state.recentEvents.slice(-4);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Game API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
