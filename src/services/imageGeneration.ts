interface GenerationRequest {
  flatSketch: string;
  materialImage?: string;
  apiKey: string;
}

interface ImageContent {
  type: "input_image";
  image_url: string;
}

interface TextContent {
  type: "input_text";
  text: string;
}

type ContentItem = ImageContent | TextContent;

export const generateRealisticGarment = async ({
  flatSketch,
  materialImage,
  apiKey
}: GenerationRequest): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  try {
    // Prepare the input content array with proper typing
    const inputContent: ContentItem[] = [
      {
        type: "input_image",
        image_url: flatSketch
      }
    ];

    // Add material image if provided
    if (materialImage) {
      inputContent.push({
        type: "input_image",
        image_url: materialImage
      });
    }

    // Add text instruction as a separate object
    inputContent.push({
      type: "input_text",
      text: materialImage 
        ? "use the material reference to turn the flat sketch into a realistic garment"
        : "turn this flat sketch into a realistic garment"
    });

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
          }
        ],
        tools: [
          {
            type: "image_generation",
            size: "auto",
            quality: "high",
            output_format: "png",
            background: "transparent",
            moderation: "auto",
            partial_images: 1
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
      throw new Error(error.error?.message || 'Failed to generate image with GPT-4.1');
    }

    const data = await response.json();
    
    // Extract the generated image from the response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;
      
      // Look for image content in the message
      if (message.content && Array.isArray(message.content)) {
        const imageContent = message.content.find(item => item.type === 'image' || item.type === 'output_image');
        if (imageContent && imageContent.image_url) {
          return imageContent.image_url;
        }
      }
    }
    
    // Check if there's a generated image in the tools response
    if (data.tools_output && Array.isArray(data.tools_output)) {
      const imageOutput = data.tools_output.find(tool => tool.type === 'image_generation');
      if (imageOutput && imageOutput.image_url) {
        return imageOutput.image_url;
      }
    }
    
    throw new Error('No image found in GPT-4.1 response');
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
