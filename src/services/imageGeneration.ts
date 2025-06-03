interface GenerationRequest {
  flatSketch: string;
  materialImage?: string;
  apiKey: string;
  stream?: boolean;
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
  apiKey,
  stream = true
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

    const requestBody = {
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
      store: true,
      stream: stream
    };

    if (stream) {
      // Handle streaming response
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate image with GPT-4.1');
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream reader');
      }

      let imageUrl = '';
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Accumulate chunks in buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Split by lines and process complete lines
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                break;
              }

              // Skip empty data lines
              if (!data) continue;

              try {
                const parsed = JSON.parse(data);
                console.log('Parsed streaming data:', parsed);
                
                // Look for partial image in streaming response
                if (parsed.type === 'response.image_generation_call.partial_image' && parsed.partial_image_b64) {
                  console.log('Found partial image!');
                  imageUrl = `data:image/png;base64,${parsed.partial_image_b64}`;
                  break;
                }

                // Look for completed image generation
                if (parsed.type === 'response.image_generation_call.done' && parsed.output) {
                  if (parsed.output.image_url) {
                    imageUrl = parsed.output.image_url;
                    break;
                  }
                }

                // Alternative: Look for image content in choices
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const delta = parsed.choices[0].delta;
                  
                  if (delta.content && Array.isArray(delta.content)) {
                    const imageContent = delta.content.find(item => 
                      (item.type === 'image' || item.type === 'output_image') && item.image_url
                    );
                    if (imageContent && imageContent.image_url) {
                      imageUrl = imageContent.image_url;
                      break;
                    }
                  }
                }

                // Check for tools output in streaming response
                if (parsed.tools_output && Array.isArray(parsed.tools_output)) {
                  const imageOutput = parsed.tools_output.find(tool => tool.type === 'image_generation');
                  if (imageOutput && imageOutput.image_url) {
                    imageUrl = imageOutput.image_url;
                    break;
                  }
                }
              } catch (parseError) {
                // Don't log every parse error as they're common with streaming
                // Only log if it looks like it should be valid JSON
                if (data.startsWith('{') && data.endsWith('}')) {
                  console.warn('Failed to parse complete streaming chunk:', parseError);
                }
              }
            }
          }

          // If we found an image, break out of the reading loop
          if (imageUrl) {
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!imageUrl) {
        throw new Error('No image found in streaming response');
      }

      return imageUrl;
    } else {
      // Handle non-streaming response (fallback)
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
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
    }
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
