
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

  // Prepare the input content array
  const inputContent = [];
  
  // Add flat sketch image
  inputContent.push({
    type: "input_image",
    image_url: flatSketch
  });

  // Add material image if provided
  if (materialImage) {
    inputContent.push({
      type: "input_image", 
      image_url: materialImage
    });
  }

  // Add text instruction
  inputContent.push({
    type: "input_text",
    text: "use the material reference to turn the flat sketch into a realistic garment"
  });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content: inputContent
          },
          {
            type: "image_generation_call",
            id: `ig_${Math.random().toString(36).substr(2, 9)}`
          }
        ],
        text: {
          format: {
            type: "text"
          }
        },
        reasoning: {},
        tools: [
          {
            type: "image_generation",
            size: "1024x1024",
            quality: "high",
            output_format: "png",
            background: "transparent",
            moderation: "auto",
            partial_images: 3
          }
        ],
        temperature: 1,
        max_output_tokens: 2048,
        top_p: 1,
        store: true
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    // Extract the generated image from the response
    // The response structure may vary, so we'll need to adapt based on the actual response
    if (data.output && data.output.image) {
      return data.output.image;
    } else if (data.image) {
      return data.image;
    } else {
      throw new Error('No image found in response');
    }
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
