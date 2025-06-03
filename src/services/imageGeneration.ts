
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
    // Prepare the content array for GPT Image 1 generation
    const content = [
      {
        type: "text",
        text: materialImage 
          ? "Create a high-quality, photorealistic rendering of a garment that combines the design from this flat sketch with the texture and appearance of the reference material. The image should be professionally lit, show realistic textures and materials, and be suitable for fashion presentation. Style: photorealistic, professional fashion photography."
          : "Create a high-quality, photorealistic rendering of a garment based on this flat sketch. The image should be professionally lit, show realistic textures and materials, and be suitable for fashion presentation. Style: photorealistic, professional fashion photography."
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
        model: "gpt-4.1-image-1",
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 4096,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image with GPT Image 1');
    }

    const data = await response.json();
    
    // Extract the generated image from GPT Image 1 response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;
      
      // Look for image content in the message
      if (message.content && Array.isArray(message.content)) {
        const imageContent = message.content.find(item => item.type === 'image_url');
        if (imageContent && imageContent.image_url && imageContent.image_url.url) {
          return imageContent.image_url.url;
        }
      }
      
      // Fallback: look for image URLs in text content
      if (message.content && typeof message.content === 'string') {
        const imageUrlMatch = message.content.match(/https:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp)/i);
        if (imageUrlMatch) {
          return imageUrlMatch[0];
        }
      }
    }
    
    throw new Error('No image found in GPT Image 1 response');
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
