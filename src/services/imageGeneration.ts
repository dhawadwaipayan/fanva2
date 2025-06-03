

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

  try {
    // Prepare the content array for GPT image generation
    const content = [
      {
        type: "text",
        text: materialImage 
          ? "Use the material reference to turn the flat sketch into a realistic garment. Create a high-quality, realistic rendering that shows the garment with the texture and appearance of the reference material."
          : "Turn this flat sketch into a realistic garment rendering. Create a high-quality, realistic image that shows the garment with proper textures, shading, and professional appearance."
      },
      {
        type: "image_url",
        image_url: {
          url: flatSketch,
          detail: "high"
        }
      }
    ];

    // Add material image if provided
    if (materialImage) {
      content.push({
        type: "image_url",
        image_url: {
          url: materialImage,
          detail: "high"
        }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 4096,
        temperature: 0.7,
        tools: [
          {
            type: "dalle",
            dalle: {
              size: "1024x1024",
              quality: "hd",
              style: "natural"
            }
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    // Extract the generated image from GPT's response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;
      
      // Look for tool calls that contain the generated image
      if (message.tool_calls && message.tool_calls.length > 0) {
        const dalleCall = message.tool_calls.find(call => call.type === 'dalle');
        if (dalleCall && dalleCall.dalle && dalleCall.dalle.url) {
          return dalleCall.dalle.url;
        }
      }
      
      // Fallback: look for image content in the message
      if (message.content && typeof message.content === 'string') {
        // Parse for image URLs in the content
        const imageUrlMatch = message.content.match(/https:\/\/[^\s]+\.(?:png|jpg|jpeg|gif)/i);
        if (imageUrlMatch) {
          return imageUrlMatch[0];
        }
      }
    }
    
    throw new Error('No image found in GPT response');
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};

