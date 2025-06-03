
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

  // Create a detailed prompt for the image generation
  let prompt = `Create a realistic representation of this flat sketch garment on a flat white background. Ensure all topstitches and buttons are clearly visible and detailed.`;
  
  if (materialImage) {
    prompt += ` Apply the provided material/fabric texture to the garment while maintaining the original design structure.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    // Extract base64 image data from the response
    const imageBase64 = data.data[0].b64_json;
    
    // Return as data URL for display
    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
