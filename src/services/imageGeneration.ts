
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
    // First, use GPT-4o to analyze the images and create a detailed prompt
    const content = [
      {
        type: "text",
        text: materialImage 
          ? "Analyze this flat sketch and material reference. Create a detailed description for generating a realistic garment that combines the design from the sketch with the texture and appearance of the reference material. Focus on realistic rendering details, lighting, and professional presentation."
          : "Analyze this flat sketch and create a detailed description for generating a realistic garment rendering. Focus on realistic textures, proper lighting, professional presentation, and high-quality details."
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

    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json();
      throw new Error(error.error?.message || 'Failed to analyze images');
    }

    const analysisData = await analysisResponse.json();
    const description = analysisData.choices[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated from image analysis');
    }

    // Now use DALL-E 3 to generate the realistic garment image
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a high-quality, photorealistic rendering of a garment based on this description: ${description}. The image should be professionally lit, show realistic textures and materials, and be suitable for fashion presentation. Style: photorealistic, professional fashion photography.`,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      throw new Error(error.error?.message || 'Failed to generate image with DALL-E');
    }

    const imageData = await imageResponse.json();
    
    if (imageData.data && imageData.data[0] && imageData.data[0].url) {
      return imageData.data[0].url;
    } else {
      throw new Error('No image URL found in DALL-E response');
    }
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
