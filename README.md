# ConnectLLM for Alteryx

ConnectLLM is a powerful and flexible custom Tool for Alteryx that enables seamless integration with Large Language Models (LLMs) for batch completions. This tool simplifies the process of interacting with various language models, making it easy for Alteryx users to incorporate advanced natural language processing capabilities into their workflows.

## Features

- Support for 1000+ LLMs models across 20+ platforms
- Integration with major AI providers including OpenAI, Microsoft Azure, Google (Gemini and Vertex AI), Mistral AI, AWS Bedrock, IBM, and more
- Batch processing for efficient completions
- Customizable inference parameters
- Simulation mode for testing and development
- Easy integration with Alteryx workflows
- Parameter saving for consistent reuse
- Caching mechanism to avoid redundant and costly API calls
- Multi-language support (English, Spanish, French, German, Polish, Portuguese, Chinese, Japanese, Russian)

## Installation

To install ConnectLLM for Alteryx:

1. Download the ConnectLLM.yxi file from the releases page
2. Double-click the .yxi file to install it in Alteryx Designer
3. Restart Alteryx Designer to complete the installation
4. Set up your API keys as environment variables

## Usage

1. Drag the ConnectLLM tool from the tool palette onto your Alteryx workflow
2. Connect your input data stream to the tool
3. Configure the tool settings:
   - Select the LLM provider and model from the extensive list of 1000+ supported options across 20+ platforms
   - Set inference parameters (temperature, max tokens, etc.)
   - Choose between live API calls or simulation mode
   - Configure caching options to optimize API usage
   - Select Batch inference to process multiple records in a single API call
4. Run your workflow to generate batch completions

## Configuration

ConnectLLM allows you to customize various settings:

- LLM Provider: Choose from 1000+ supported models across 20+ platforms, including OpenAI, Microsoft Azure, Google (Gemini and Vertex AI), Mistral AI, AWS Bedrock, IBM, and more
- Model Selection: Pick the specific model for your task from a wide range of options
- Inference Parameters: Adjust settings like temperature, max tokens, and top_p
- Batch inference: Process multiple records in a single API call
- API Configuration: Set API keys and endpoints for your chosen provider as environment variables
- Simulation Mode: Enable/disable mocking for testing purposes
- Caching: Configure caching settings to reduce API calls and costs
- Language: Select the input and output language for your completions

## Language Support

ConnectLLM supports multiple languages for input and output:

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Polish (pl)
- Portuguese (pt)
- Chinese (cn)
- Japanese (ja)
- Russian (ru)

You can select the desired language in the tool configuration to ensure your completions are generated in the appropriate language.

## Saving Parameters

You can save your configuration settings for easy reuse:

1. Set up your desired parameters in the tool configuration
2. Click the "Save Parameters" button
3. Give your configuration a name
4. Load saved parameters in future workflows using the "Load Parameters" option

## Contributing

We welcome contributions to ConnectLLM for Alteryx! Please see our [Contributing Guide](CONTRIBUTING.md) for more information on how to get started.

## License

ConnectLLM for Alteryx is released under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on our [GitHub repository](https://github.com/jupiterbak/ConnectLLM-Alteryx/issues) or contact Alteryx support.
