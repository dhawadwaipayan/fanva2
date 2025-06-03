
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

  // Construct the prompt based on the workflow shown in the image
  let prompt = `Transform this flat sketch garment into a realistic 3D representation with a clean white background. Create a photorealistic clothing item that maintains the exact design, proportions, and details from the flat sketch.`;
  
  if (materialImage) {
    prompt += ` Apply the material texture and color from the provided reference image to create a realistic fabric appearance. Ensure all topstitches, buttons, and design elements match the color and texture of the material reference.`;
  }
  
  prompt += ` The final image should be high-quality, well-lit, and professionally photographed against a pure white background.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
