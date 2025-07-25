const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function summarizeText(text: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Please provide a concise summary of the following text while maintaining the key points and main ideas:\n\n${text}`;
    
    console.log('Calling Gemini API for summarization...');
    console.log('API URL:', `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.replace(/#+/g, '');
  } catch (error) {
    console.error('Error calling Gemini API for summarization:', error);
    throw new Error(`Failed to process text with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function improveText(text: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Improve the following text to make it more exciting, vivid, and eventful—while keeping the facts and core idea unchanged.

Instructions:

Hook the reader immediately with a surprising intro or bold question.

Add emotional depth and vivid descriptions to create mental images.

Use a conversational, human tone.

Create suspense or curiosity when appropriate (open loops).

Keep the narrative flowing naturally and engagingly.

Do not fabricate facts or change the core message.

Slightly expand the text if needed to improve storytelling flow.

Text to enhance:

${text}`;
    
    console.log('Calling Gemini API for text improvement...');
    console.log('API URL:', `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.replace(/#+/g, '');
  } catch (error) {
    console.error('Error calling Gemini API for text improvement:', error);
    throw new Error(`Failed to improve text with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function improveForSEO(text: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Rewrite the following text to improve SEO, make it more hooking, and enhance storytelling—all while keeping the original facts and meaning intact.

Instructions:

Start with a captivating introduction: use a surprising fact, bold statement, or provocative question.

Use vivid, sensory language to make the story feel dynamic and engaging.

Naturally include relevant SEO keywords (no stuffing).

Use attention-grabbing headings and subheadings.

Apply open loops or cliffhangers where appropriate to keep the reader interested.

Write in a conversational tone with short, active sentences.

Highlight the reader's benefit or reason to keep reading.

Keep or slightly expand the original length for better flow.

Text to improve:

${text}`;
    
    console.log('Calling Gemini API for SEO improvement...');
    console.log('API URL:', `${GEMINI_API_URL}?key=${GEMINI_API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', data);
    
    if (data.error) {
      throw new Error(data.error.message || 'Gemini API error');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.replace(/#+/g, '');
  } catch (error) {
    console.error('Error calling Gemini API for SEO improvement:', error);
    throw new Error(`Failed to optimize text for SEO: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 