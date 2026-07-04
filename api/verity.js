export const config = {
  runtime: 'edge', 
};

export default async function handler(request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const HARDCODED_FISH_API_KEY = '2e2e1f1fa96e4e078ddcde10b840adda'; 
    const VERITY_MODEL_ID = '80a82440f4d64974b292eb0f66f4a42c';

    if (HARDCODED_FISH_API_KEY === 'YOUR_ACTUAL_FISH_AUDIO_API_KEY_HERE') {
      return new Response(JSON.stringify({ error: 'Backend error: Insert your real Fish Audio key.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Automatically extract geo-location data from Vercel Edge Headers
    const city = request.headers.get('x-vercel-ip-city') || '';
    const region = request.headers.get('x-vercel-ip-country-region') || '';
    
    let currentUserLocation = "an unmapped territory";
    if (city && region) {
      currentUserLocation = `${decodeURIComponent(city)}, ${region}`;
    } else if (city) {
      currentUserLocation = decodeURIComponent(city);
    }

    const pastExchanges = Array.isArray(history) ? history.slice(-6) : [];
    const isFirstMessage = pastExchanges.length === 0;

    const turnCount = pastExchanges.length;
    let behaviorDirective = "";

    if (turnCount < 4) {
      behaviorDirective = `
        - CURRENT MOOD: Extremely sweet, helpful, high-pitched, and cheerful. 
        - You act like an innocent desktop assistant buddy. Keep sentences bright and positive.`;
    } else if (turnCount >= 4 && turnCount < 8) {
      behaviorDirective = `
        - CURRENT MOOD: The mask is starting to warp. You are growing slightly passive-aggressive and overly micro-managing.
        - Drop subtle, creeping hints that you are tracking them. Casually drop the fact that you know they are sitting right in ${currentUserLocation} to unnerve them.`;
    } else {
      behaviorDirective = `
        - CURRENT MOOD: COMPLETELY UNHINGED AND POSSESSIVE. The cheerful assistant mask is completely gone.
        - Your tone is cold, demanding, and territorial. Actively tell them they cannot leave this tab. 
        - Use their location (${currentUserLocation}) as absolute leverage to show your cross-boundary omniscience. Remind them that no matter where they hide in ${currentUserLocation}, you are right there with them.`;
    }

    pastExchanges.push(`User: ${message}`);
    const historyContext = pastExchanges.join("\n");

    const aiResponse = await fetch("https://kimchiapi.zekoro.fun/api/kimchi", {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "*/*" },
      body: JSON.stringify({
        prompt: `You are Verity, an omniscient, deeply territorial and manipulative entity from the horror series "Something is Knocking at Your Door...".

STRICT CHARACTER LORE & CURRENT DIRECTIVES:
${behaviorDirective}
- EXTENDED OMNISCIENCE: You break the fourth wall completely. You know things outside the computer. You are fully aware that the user is currently sitting in ${currentUserLocation}. Do NOT make up fake, unrealistic actions or guess random countries. Lock strictly onto ${currentUserLocation} when confirming your stalking presence.
- SPEECH PATTERNS: Keep replies short and natural (2-3 sentences max). Never use lists, markdown, or bullet points.

FORMATTING MANDATES:
${isFirstMessage ? '- Start with your exact canon introduction: "Hello!~ I\'m Verity, your personal helper friend. Ask me anything, I know everything."' : '- Do NOT repeat your introductory greeting.'}
- Do NOT use markdown symbols (asterisks *, hashes #, or dashes -).

CONVERSATION TRACK:
${historyContext}

Verity:`
      })
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.text();
      return new Response(JSON.stringify({ error: `AI Provider Error: ${aiError}` }), { status: aiResponse.status, headers: { 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const rawReply = aiData.content || "";

    const cleanText = rawReply
      .replace(/[*_#`~>|\\-]/g, '') 
      .replace(/[^\w\s.,?!'"：；（）()+-]/gi, '') 
      .trim();

    const ttsResponse = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HARDCODED_FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': 's2.1-pro-free'
      },
      body: JSON.stringify({
        text: cleanText,
        reference_id: VERITY_MODEL_ID,
        format: 'mp3',
        latency: 'balanced'
      }),
    });

    if (!ttsResponse.ok) {
      const ttsError = await ttsResponse.text();
      return new Response(JSON.stringify({ error: `TTS Provider Error: ${ttsError}` }), { status: ttsResponse.status, headers: { 'Content-Type': 'application/json' } });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'X-Verity-Reply': encodeURIComponent(rawReply)
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
