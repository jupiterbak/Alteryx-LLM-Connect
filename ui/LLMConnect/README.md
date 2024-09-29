# Alteryx Dev Harness - LLMConnect Tool

The Dev Harness is a real-time development environment for building custom tools that will be used within the Alteryx platform. It allows you to rapidly prototype and prove out UIs for your custom tools utilizing the UI-SDK packages: [react-comms](https://alteryx.github.io/react-comms/) and [alteryx-ui](https://alteryx.github.io/alteryx-ui/).

## LLMConnect Tool

This Dev Harness instance is specifically set up for the LLMConnect tool, which provides an interface for interacting with Large Language Models (LLMs) within Alteryx.

### Features

- **Chat Interface**: Allows users to interact with the LLM in a chat-like format.
- **Model Selection**: Users can choose from different LLM providers and models.
- **API Key Management**: Securely input and manage API keys for different LLM providers.
- **Chat History**: View and manage the history of interactions with the LLM.
- **Customizable Prompts**: Set custom system prompts and user messages.

### Getting Started

The Dev Harness is already equipped with all of the packages you'll need to build the LLMConnect tool. After cloning the repo, follow these steps:

1. Run `npm install` to set up all dependencies.
2. Use `npm run start` to launch the Dev Harness at localhost port 8080.

### Key Components

The `index.tsx` file contains the main `App` component, which includes:

- `ModelSelector`: For choosing the LLM provider and model.
- `APIKeyInput`: For securely inputting API keys.
- `AIChatHistory`: Displays the chat history and allows user interaction.
- `SystemPromptInput`: For setting custom system prompts.
- `UserMessageInput`: For inputting user messages to the LLM.

### State Management

The tool uses React's `useState` and `useEffect` hooks for state management, handling:

- Selected model and provider
- API keys
- Chat history
- System prompts and user messages

### Styling

The tool utilizes Alteryx UI components and custom CSS for styling, ensuring a consistent look and feel with the Alteryx platform.

### Webpack

We provide a basic webpack configuration that can be extended to your individual use case. The configuration that comes with the Dev Harness is set up for both dev and prod environments.

### Further Customization

You can modify the `index.tsx` file to add new features, change the layout, or integrate with additional services as needed for the LLMConnect tool.