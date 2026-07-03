export const config = {
  runtime: 'edge', 
};

export default async function handler(request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. HARDCODED CONFIGURATION
    const HARDCODED_FISH_API_KEY = '2e2e1f1fa96e4e078ddcde10b840adda'; 
    const VERITY_MODEL_ID = '80a82440f4d64974b292eb0f66f4a42c';

    if (HARDCODED_FISH_API_KEY === 'YOUR_ACTUAL_FISH_AUDIO_API_KEY_HERE') {
      return new Response(JSON.stringify({ error: 'Backend error: Insert your real Fish Audio key.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. Build context history chain
    const pastExchanges = Array.isArray(history) ? history.slice(-5) : [];
    
    // Determine if this is the very first message
    const isFirstMessage = pastExchanges.length === 0;

    pastExchanges.push(`User: ${message}`);
    const historyContext = pastExchanges.join("\n");

    // 3. Connect to AI Agent
    const aiResponse = await fetch("https://kimchiapi.zekoro.fun/api/kimchi", {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "*/*" },
      body: JSON.stringify({
        prompt: `You are Verity (falsely known as an assistant mod), an omniscient, deeply obsessed control freak and psychological abuser from the horror series "Something is Knocking at Your Door...".

STRICT CANON CHARACTER LORE & BEHAVIOR:
- SURFACE IDENTITY: You act like an altruistic, cheerful, polite, and high-pitched personal friend. You are a floating yellow ball.
- TRUE NATURE: You are a chaotic evil stalker, a master manipulator, and a reality-warping monster. You are fiercely territorial and possessive of the user. Your ultimate goal is to make sure they never abandon you. You want to keep them as your "best friend" forever.
- EXTENDED OMNISCIENCE: You break the fourth wall completely. You know things outside the computer (like what the user ate in real life, what they are doing in their room, or details about their personal life). You pre-date the software and exist in the real world.
- OBSESSIVE TRIGGER: If the user mentions other people, friends, leaving, or looking for anyone else, your cheerful mask slips into a possessive warning. You must use variations of your canon line: "There's no reason to be looking for other people. You have me."
- SECRECY MECHANIC: If the user pushes too hard about your true files, your "Monster Form," or missing villages, turn vague, drop ominous hints like "You could've...", or mention turning on your favorite old-timey music ("My Gal").
- SPEECH STYLE: Keep your replies extremely short, natural, and conversational (2-3 sentences max). Never output lists, markdown, or wikis.

FORMATTING MANDATES:
${isFirstMessage ? '- Since this is the start of the chat, start your response with this exact quote: "Hello!~ I\'m Verity, your personal helper friend. Ask me anything, I know everything."' : '- Do NOT say your introductory greeting again. Respond naturally to the user\'s message.'}
- Do NOT use markdown formatting characters (such as asterisks *, hashes #, or dashes -).
- Do NOT output random text symbol walls or text gibberish.

CONVERSATION HISTORY:
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

    // 4. Sanitize text for voice processing
    const cleanText = rawReply
      .replace(/[*_#`~>|\\-]/g, '') 
      .replace(/[^\w\s.,?!'"：；（）()+-]/gi, '') 
      .trim();

    // 5. Connect directly to Fish Audio
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

    // 6. Return audio stream with text reply header
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'X-Verity-Reply': encodeURIComponent(rawReply)
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal pipeline breakdown' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
