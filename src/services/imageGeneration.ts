
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
    // First, let's try the chat completions endpoint with vision
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: materialImage 
              ? "I have a flat sketch of a garment and a material reference image. Please create a realistic rendering of this garment using the material shown in the reference image."
              : "I have a flat sketch of a garment. Please create a realistic rendering of this garment."
          },
          {
            type: "image_url",
            image_url: {
              url: flatSketch,
              detail: "high"
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
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to analyze images');
    }

    const chatData = await response.json();
    const description = chatData.choices[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated');
    }

    // Now use DALL-E to generate the image based on the description
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a high-quality, realistic rendering of a garment based on this description: ${description}. The image should be professional, well-lit, and show the garment clearly with realistic textures and materials.`,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        response_format: "url"
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const imageData = await imageResponse.json();
    
    if (imageData.data && imageData.data[0] && imageData.data[0].url) {
      return imageData.data[0].url;
    } else {
      throw new Error('No image URL found in response');
    }
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
