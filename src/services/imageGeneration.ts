
interface GenerationRequest {
  flatSketch: string;
  materialImage?: string;
  apiKey: string;
}

export const generateRealisticGarment = async ({
  flatSketch,
  materialImage,
  apiKey
}: GenerationRequest): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Prepare the messages for GPT-4o vision API
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Using this material, render the sketch into a realistic representation on a flat white background. Ensure all topstitches and buttons match the fabric color."
        },
        {
          type: "image_url",
          image_url: {
            url: flatSketch
          }
        }
      ]
    }
  ];

  // Add material image if provided
  if (materialImage) {
    messages[0].content.push({
      type: "image_url",
      image_url: {
        url: materialImage
      }
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 4096
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    // Since GPT-4o returns text, we'll need to handle this differently
    // For now, return the response content as it might contain image data or instructions
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
