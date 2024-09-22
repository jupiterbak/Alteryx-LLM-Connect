export interface Platform {
  name: string;
  models: string[];
  api_url: string;
  doc_url: string;
}

export const config: { supported_platforms: Platform[] } = {
  supported_platforms: [
    {
      name: "OpenAI",
      models: [
        "o1-mini",
        "o1-preview",
        "gpt-4o-mini",
        "gpt-4o-mini-2024-07-18",
        "gpt-4o",
        "gpt-4o-2024-08-06",
        "gpt-4o-2024-05-13",
        "gpt-4-turbo",
        "gpt-4-0125-preview",
        "gpt-4-1106-preview",
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-0301",
        "gpt-3.5-turbo-0613",
        "gpt-3.5-turbo-16k",
        "gpt-3.5-turbo-16k-0613",
        "gpt-4",
        "gpt-4-0314",
        "gpt-4-0613",
        "gpt-4-32k",
        "gpt-4-32k-0314",
        "gpt-4-32k-0613"
      ],
      api_url: "https://api.openai.com/v1/chat/completions",
      doc_url: "https://platform.openai.com/docs/api-reference/chat/create"
    },
    // Anyscale
    {
      name: "Anyscale",
      models: [
        "anyscale/meta-llama/Llama-2-7b-chat-hf",
        "anyscale/meta-llama/Llama-2-13b-chat-hf",
        "anyscale/meta-llama/Llama-2-70b-chat-hf",
        "anyscale/mistralai/Mistral-7B-Instruct-v0.1",
        "anyscale/codellama/CodeLlama-34b-Instruct-hf"
      ],  
      api_url: "https://docs.anyscale.com/category/serving",
      doc_url: "https://docs.anyscale.com/api-reference/chat-completions"
    },
    // Anthropic
    {
      name: "Anthropic",
      models: [
        "claude-3-5-sonnet-20240620",
        "claude-3-haiku-20240307",
        "claude-3-opus-20240229",
        "claude-3-5-sonnet-20240620",
        "claude-3-sonnet-20240229",
        "claude-2.1",
        "claude-2",
        "claude-instant-1.2",
        "claude-instant-1"
      ],
      api_url: "https://api.anthropic.com/v1/messages",
      doc_url: "https://docs.anthropic.com/en/api/messages"

    },
    // Azure OpenAI
    {
      name: "Azure OpenAI",
      models: [
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-4",
        "gpt-4-0314",
        "gpt-4-0613",
        "gpt-4-32k",
        "gpt-4-32k-0314",
        "gpt-4-32k-0613",
        "gpt-4-1106-preview",
        "gpt-4-0125-preview",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-0301",
        "gpt-3.5-turbo-0613",
        "gpt-3.5-turbo-16k",
        "gpt-3.5-turbo-16k-0613"
      ],
      api_url: "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_id}/chat/completions?api-version={api_version}",
      doc_url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/assistants-reference-messages?tabs=python"
    },
    // Azure AI Studio
    {
      name: "Azure AI Studio",
      models:[
        "azure_ai/command-r-plus",
        "azure_ai/command-r",
        "azure_ai/mistral-large-latest",
        "azure_ai/ai21-jamba-instruct"
      ],
      api_url: "https://{resource_name}.openai.azure.com/openai/deployments/{deployment_id}/chat/completions?api-version={api_version}",
      doc_url: "https://learn.microsoft.com/en-us/azure/ai-services/openai/reference"
    }, 
    // AWS Sagemaker
    {
      name: "AWS Sagemaker",
      models: [
        "sagemaker/<your-deployment-name>",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-7b-f",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-13b-f",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b",
        "sagemaker/jumpstart-dft-meta-textgeneration-llama-2-70b-b-f"
      ], // Add specific models as needed
      api_url: "https://api.sagemaker.aws/inference",
      doc_url: "https://docs.aws.amazon.com/sagemaker/latest/APIReference/API_runtime_InvokeEndpoint.html"

    },
    // AWS Bedrock
    {
      name: "AWS Bedrock",
      models: [
        "bedrock/anthropic.claude-3-5-sonnet-20240620-v1:0",
        "bedrock/anthropic.claude-3-sonnet-20240229-v1:0",
        "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
        "bedrock/anthropic.claude-3-opus-20240229-v1:0",
        "bedrock/anthropic.claude-v2:1",
        "bedrock/anthropic.claude-v2",
        "bedrock/anthropic.claude-instant-v1",
        "bedrock/meta.llama3-70b-instruct-v1:0",
        "bedrock/meta.llama3-8b-instruct-v1:0",
        "bedrock/amazon.titan-text-lite-v1",
        "bedrock/amazon.titan-text-express-v1",
        "bedrock/cohere.command-text-v14",
        "bedrock/ai21.j2-mid-v1",
        "bedrock/ai21.j2-ultra-v1",
        "bedrock/ai21.jamba-instruct-v1:0",
        "bedrock/meta.llama2-13b-chat-v1",
        "bedrock/meta.llama2-70b-chat-v1",
        "bedrock/mistral.mistral-7b-instruct-v0:2",
        "bedrock/mistral.mixtral-8x7b-instruct-v0:1"
      ], // Add specific models as needed
      api_url: "https://api.bedrock.aws/bedrock-runtime",
      doc_url: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-messages.html"
    },
    // Cohere
    {
      name: "Cohere",
      models: [
        "command-r-plus-08-2024",
        "command-r-08-2024",
        "command-r-plus",
        "command-r",
        "command-light",
        "command-nightly"
      ],
      api_url: "https://api.cohere.ai/v1/generate",
      doc_url: "https://docs.cohere.com/reference/generate"
    },
    // Databricks
    {
      name: "Databricks",
      models: [
        "databricks/databricks-meta-llama-3-1-70b-instruct",
        "databricks/databricks-meta-llama-3-1-405b-instruct",
        "databricks/databricks-dbrx-instruct",
        "databricks/databricks-meta-llama-3-70b-instruct",
        "databricks/databricks-llama-2-70b-chat",
        "databricks/databricks-mixtral-8x7b-instruct",
        "databricks/databricks-mpt-30b-instruct",
        "databricks/databricks-mpt-7b-instruct"
      ], // Add specific models as needed
      api_url: "https://api.databricks.com/api/2.0/workspace/export",
      doc_url: "https://docs.databricks.com/en/machine-learning/foundation-models/api-reference.html"
    },
    // Groq
    {
      name: "Groq",
      models: [
        "groq/llama2-70b-4096",
        "groq/llama-3.1-8b-instant",
        "groq/llama-3.1-70b-versatile",
        "groq/llama3-8b-8192",
        "groq/llama3-70b-8192",
        "groq/llama-3.1-70b-versatile",
        "groq/llama-guard-3-8b",
        "groq/llava-v1.5-7b-4096-preview",
        "groq/llama3-70b-8192",
        "groq/llama3-8b-8192",
        "groq/mixtral-8x7b-32768",
        "groq/mixtral-8x7b-32768",
        "groq/gemma-7b-it",
        "groq/gemma2-9b-it"
      ], // Add specific models as needed
      api_url: "https://api.groq.com/openai/v1/chat/completions",
      doc_url: "https://console.groq.com/docs/api-reference#chat-create"
    },
    // HuggingFace
    {
      name: "HuggingFace",
      models: [
        "huggingface/mistralai/Mistral-7B-Instruct-v0.1",
        "huggingface/meta-llama/Llama-2-7b",
        "huggingface/tiiuae/falcon-7b-instruct",
        "huggingface/mosaicml/mpt-7b-chat",
        "huggingface/codellama/CodeLlama-34b-Instruct-hf",
        "huggingface/WizardLM/WizardCoder-Python-34B-V1.0",
        "huggingface/Phind/Phind-CodeLlama-34B-v2"
      ], // Add specific models as needed

      api_url: "https://api-inference.huggingface.co/models/{model_name}",
      doc_url: "https://huggingface.co/docs/api-inference/index"
    },
    // Replicate
    {
      name: "Replicate",
      models: [
        "replicate/llama-2-70b-chat:2796ee9483c3fd7aa2e171d38f4ca12251a30609463dcfd4cd76703f22e96cdf",
        "replicate/a16z-infra/llama-2-13b-chat:2a7f981751ec7fdf87b5b91ad4db53683a98082e9ff7bfd12c8cd5ea85980a52",
        "replicate/vicuna-13b:6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b",
        "replicate/daanelson/flan-t5-large:ce962b3f6792a57074a601d3979db5839697add2e4e02696b3ced4c022d4767f",
        "replicate/custom-llm-version-id",
        "replicate/deployments/ishaan-jaff/ishaan-mistral"
      ],
      api_url: "POST https://api.replicate.com/v1/deployments/{deployment_owner}/{deployment_name}/predictions",
      doc_url: "https://replicate.com/docs/reference/api"
    },
    // DeepSeek
    {
      name: "DeepSeek",
      models: [
        "deepseek/deepseek-chat",
        "deepseek/deepseek-coder"
      ],
      api_url: "https://api.deepseek.com/v1/chat/completions",
      doc_url: "https://platform.deepseek.com/api-docs/"
    },
    // Fireworks AI
    {
      name: "Fireworks AI",
      models: [
        "fireworks_ai/mixtral-8x7b-instruct",
        "fireworks_ai/firefunction-v1",
        "fireworks_ai/llama-v2-70b-chat",
        "fireworks_ai/llama-v3p1-405b-instruct",
        "fireworks/llama-v3p1-70b-instruct",
        "fireworks/llama-v3p1-8b-instruct",
        "fireworks/llama-v3-70b-instruct",
        "fireworks/mixtral-8x22b-instruct",
        "fireworks/mixtral-8x7b-instruct",
        "fireworks/firefunction-v2",
        "fireworks/firefunction-v1",
        "fireworks/gemma2-9b-it",
        "fireworks/llama-v3-70b-instruct-hf",
        "fireworks/llama-v3-8b-instruct",
        "fireworks/llama-v3-8b-instruct-hf",
        "fireworks/mixtral-8x7b-instruct-hf",
        "fireworks/mythomax-l2-13b",
        "fireworks/starcoder-16b",
        "fireworks/starcoder-7b",
        "fireworks/yi-large"
      ],
      api_url: "https://api.fireworks.ai/inference/v1/chat/completions",
      doc_url: "https://docs.fireworks.ai/api-reference/post-chatcompletions"
    },
    // DeepInfra
    {
      name: "DeepInfra",
      models: [
        "deepinfra/meta-llama/Meta-Llama-3-8B-Instruct",
        "deepinfra/meta-llama/Meta-Llama-3-70B-Instruct",
        "deepinfra/meta-llama/Llama-2-70b-chat-hf",
        "deepinfra/meta-llama/Llama-2-7b-chat-hf",
        "deepinfra/meta-llama/Llama-2-13b-chat-hf",
        "deepinfra/codellama/CodeLlama-34b-Instruct-hf",
        "deepinfra/mistralai/Mistral-7B-Instruct-v0.1",
        "deepinfra/jondurbin/airoboros-l2-70b-gpt4-1.4.1"
      ],
      api_url: "https://api.deepinfra.com/v1/inference/{model_name}",
      doc_url: "https://deepinfra.com/docs/inference"
    },
    // AI21
    {
      name: "AI21",
      models: [
        "jamba-1.5-mini",
        "jamba-1.5-large",
        "j2-light",
        "j2-mid",
        "j2-ultra"
      ],

      api_url: "https://api.ai21.com/studio/v1/{model_name}/chat",
      doc_url: "https://docs.ai21.com/reference/j2-chat-api"
    },
    // Together AI
    {
      name: "Together AI",
      models: [
        "together_ai/togethercomputer/llama-2-70b-chat",
        "together_ai/togethercomputer/llama-2-70b",
        "together_ai/togethercomputer/LLaMA-2-7B-32K",
        "together_ai/togethercomputer/Llama-2-7B-32K-Instruct",
        "together_ai/togethercomputer/llama-2-7b",
        "together_ai/togethercomputer/falcon-40b-instruct",
        "together_ai/togethercomputer/falcon-7b-instruct",
        "together_ai/togethercomputer/alpaca-7b",
        "together_ai/HuggingFaceH4/starchat-alpha",
        "together_ai/togethercomputer/CodeLlama-34b",
        "together_ai/togethercomputer/CodeLlama-34b-Instruct",
        "together_ai/togethercomputer/CodeLlama-34b-Python",
        "together_ai/defog/sqlcoder",
        "together_ai/NumbersStation/nsql-llama-2-7B",
        "together_ai/WizardLM/WizardCoder-15B-V1.0",
        "together_ai/WizardLM/WizardCoder-Python-34B-V1.0",
        "together_ai/NousResearch/Nous-Hermes-Llama2-13b",
        "together_ai/Austism/chronos-hermes-13b",
        "together_ai/upstage/SOLAR-0-70b-16bit",
        "together_ai/WizardLM/WizardLM-70B-V1.0",
        "together_ai/meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        "together_ai/meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        "together_ai/meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        "together_ai/meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
        "together_ai/meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
        "together_ai/meta-llama/Meta-Llama-3-8B-Instruct-Lite",
        "together_ai/meta-llama/Meta-Llama-3-70B-Instruct-Lite",
        "together_ai/meta-llama/Llama-3-8b-chat-hf",
        "together_ai/meta-llama/Llama-3-70b-chat-hf",
        "together_ai/microsoft/WizardLM-2-8x22B",
        "together_ai/google/gemma-2-27b-it",
        "together_ai/google/gemma-2-9b-it",
        "together_ai/databricks/dbrx-instruct",
        "together_ai/deepseek-ai/deepseek-llm-67b-chat",
        "together_ai/google/gemma-2b-it",
        "together_ai/Gryphe/MythoMax-L2-13b",
        "together_ai/meta-llama/Llama-2-13b-chat-hf",
        "together_ai/mistralai/Mistral-7B-Instruct-v0.1",
        "together_ai/mistralai/Mistral-7B-Instruct-v0.2",
        "together_ai/mistralai/Mistral-7B-Instruct-v0.3",
        "together_ai/mistralai/Mixtral-8x7B-Instruct-v0.1",
        "together_ai/mistralai/Mixtral-8x22B-Instruct-v0.1",
        "together_ai/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
        "together_ai/NousResearch/Nous-Hermes-2-Yi-34B",
        "together_ai/Hermes-3-Llama-3.1-405B-Turbo",
        "Qwen/Qwen1.5-72B-Chat",
        "Qwen/Qwen1.5-110B-Chat",
        "Qwen/Qwen2-72B-Instruct",
        "togethercomputer/StripedHyena-Nous-7B",
        "upstage/SOLAR-10.7B-Instruct-v1.0"
      ], // Add specific models as needed

      api_url: "https://api.together.xyz/v1/chat/completions",
      doc_url: "https://docs.together.ai/reference/"
    },
    // Aleph Alpha
    {
      name: "Aleph Alpha",
      models: [
        'luminous-base',
        'luminous-base-control',
        'luminous-extended',
        'luminous-extended-control',
        'luminous-supreme',
        'luminous-supreme-control'
      ],
      api_url: "https://api.aleph-alpha.com/chat/completions",
      doc_url: "https://docs.aleph-alpha.com/api/"
    },
    // Mistral AI
    {
      name: "Mistral AI",
      models: [
        "mistral/mistral-small-latest",
        "mistral/mistral-medium-latest",
        "mistral/mistral-large-2407",
        "mistral/mistral-large-latest",
        "mistral/open-mistral-7b",
        "mistral/open-mixtral-8x7b",
        "mistral/open-mixtral-8x22b",
        "mistral/codestral-latest",
        "mistral/open-mistral-nemo",
        "mistral/open-mistral-nemo-2407",
        "mistral/open-codestral-mamba",
        "mistral/codestral-mamba-latest"
      ],
      api_url: "https://api.mistral.ai/v1/chat/completions",
      doc_url: "https://docs.mistral.ai/api/"
    },
    // Codestral API [Mistral AI]
    {
      name: "Codestral API",
      models: [
        "codestral/codestral-latest",
        "codestral/codestral-2405"
      ],
      api_url: "https://api.mistral.ai/v1/chat/completions",
      doc_url: "https://docs.mistral.ai/api/"
    },
    // Ollama
    {
      name: "Ollama",
      models: [
        "ollama/mistral",
        "ollama/mistral-7B-Instruct-v0.1",
        "ollama/mistral-7B-Instruct-v0.2",
        "ollama/mistral-8x7B-Instruct-v0.1",
        "ollama/mixtral-8x22B-Instruct-v0.1",
        "ollama/llama2",
        "ollama/llama2:13b",
        "ollama/llama2:70b",
        "ollama/llama2-uncensored",
        "ollama/codellama",
        "ollama/llama2-uncensored",
        "ollama/llama3",
        "ollama/llama3:70b",
        "ollama/orca-mini",
        "ollama/vicuna",
        "ollama/nous-hermes",
        "ollama/nous-hermes:13b",
        "ollama/wizard-vicuna"
      ],
      api_url: "http://localhost:11434",
      doc_url: "hhttps://github.com/ollama/ollama"
    },
    // Nvidia NIM
    {
      name: "Nvidia NIM",
      models: [
        "nvidia_nim/nvidia/nemotron-4-340b-reward",
        "nvidia_nim/01-ai/yi-large",
        "nvidia_nim/aisingapore/sea-lion-7b-instruct",
        "nvidia_nim/databricks/dbrx-instruct",
        "nvidia_nim/google/gemma-7b",
        "nvidia_nim/google/gemma-2b",
        "nvidia_nim/google/codegemma-1.1-7b",
        "nvidia_nim/google/codegemma-7b",
        "nvidia_nim/google/recurrentgemma-2b",
        "nvidia_nim/ibm/granite-34b-code-instruct",
        "nvidia_nim/ibm/granite-8b-code-instruct",
        "nvidia_nim/mediatek/breeze-7b-instruct",
        "nvidia_nim/meta/codellama-70b",
        "nvidia_nim/meta/llama2-70b",
        "nvidia_nim/meta/llama3-8b",
        "nvidia_nim/meta/llama3-70b",
        "nvidia_nim/microsoft/phi-3-medium-4k-instruct",
        "nvidia_nim/microsoft/phi-3-mini-128k-instruct",
        "nvidia_nim/microsoft/phi-3-mini-4k-instruct",
        "nvidia_nim/microsoft/phi-3-small-128k-instruct",
        "nvidia_nim/microsoft/phi-3-small-8k-instruct",
        "nvidia_nim/mistralai/codestral-22b-instruct-v0.1",
        "nvidia_nim/mistralai/mistral-7b-instruct",
        "nvidia_nim/mistralai/mistral-7b-instruct-v0.3",
        "nvidia_nim/mistralai/mixtral-8x7b-instruct",
        "nvidia_nim/mistralai/mixtral-8x22b-instruct",
        "nvidia_nim/mistralai/mistral-large",
        "nvidia_nim/nvidia/nemotron-4-340b-instruct",
        "nvidia_nim/seallms/seallm-7b-v2.5",
        "nvidia_nim/snowflake/arctic",
        "nvidia_nim/upstage/solar-10.7b-instruct"
      ],
      api_url: "https://integrate.api.nvidia.com/v1/chat/completions",
      doc_url: "https://docs.nvidia.com/ai-sdk/integrate/integrate-api-reference/index.html"
    },
    // Predibase
    {
      name: "Predibase",
      models: [
        "predibase/llama-3-1-8b",
        "predibase/llama-3-1-8b-instruct",
        "predibase/llama-3-8b",
        "predibase/llama-3-8b-instruct",
        "predibase/llama-3-70b",
        "predibase/llama-3-70b-instruct",
        "predibase/llama-2-7b",
        "predibase/llama-2-7b-chat",
        "predibase/llama-2-13b",
        "predibase/llama-2-13b-chat",
        "predibase/llama-2-70b",
        "predibase/llama-2-70b-chat",
        "predibase/codellama-7b",
        "predibase/codellama-7b-instruct",
        "predibase/codellama-13b-instruct",
        "predibase/codellama-70b-instruct",
        "predibase/mistral-7b",
        "predibase/mistral-7b-instruct",
        "predibase/mistral-7b-instruct-v0-2",
        "predibase/mistral-7b-instruct-v0-3",
        "predibase/mistral-nemo-12b-2407",
        "predibase/mistral-nemo-12b-instruct-2407",
        "predibase/mixtral-8x7b-v0-1",
        "predibase/mixtral-8x7b-instruct-v0-1",
        "predibase/solar-1-mini-chat-240612",
        "predibase/solar-pro-preview-instruct",
        "predibase/zephyr-7b-beta",
        "predibase/phi-2",
        "predibase/phi-3-mini-4k-instruct",
        "predibase/phi-3-5-mini-instruct",
        "predibase/gemma-2b",
        "predibase/gemma-2b-instruct",
        "predibase/gemma-7b",
        "predibase/gemma-7b-instruct",
        "predibase/gemma-2-9b",
        "predibase/gemma-2-9b-instruct",
        "predibase/gemma-2-27b",
        "predibase/gemma-2-27b-instruct",
        "predibase/qwen2-1-5b",
        "predibase/qwen2-1-5b-instruct",
        "predibase/qwen2-7b",
        "predibase/qwen2-7b-instruct",
        "predibase/qwen2-72b",
        "predibase/qwen2-72b-instruct"
      ],
      api_url: "https://serving.app.predibase.com/{PREDIBASE_TENANT_ID}/deployments/v2/llms/{PREDIBASE_DEPLOYMENT_ID}/generate",
      doc_url: "https://docs.predibase.com/user-guide/inference/rest_api"
    },
    // VertexAI
    {
      name: "VertexAI",
      models: [
        "vertex_ai/claude-3-opus@20240229",
        "vertex_ai/claude-3-5-sonnet@20240620",
        "vertex_ai/claude-3-sonnet@20240229",
        "vertex_ai/claude-3-haiku@20240307",
        "vertex_ai/meta/llama3-405b-instruct-maas",
        "vertex_ai/mistral-large@latest",
        "vertex_ai/mistral-large@2407",
        "vertex_ai/mistral-nemo@latest",
        "vertex_ai/codestral@latest",
        "vertex_ai/codestral@2405",
        "vertex_ai/jamba-1.5-mini@001",
        "vertex_ai/jamba-1.5-large@001",
        'vertex_ai/gemini-pro',
        "vertex_ai/chat-bison-32k",
        "vertex_ai/chat-bison",
        "vertex_ai/chat-bison@001",
        "vertex_ai/codechat-bison",
        "vertex_ai/codechat-bison-32k",
        "vertex_ai/codechat-bison@001",
        "vertex_ai/text-bison",
        "vertex_ai/text-bison@001",
        "vertex_ai/code-bison",
        "vertex_ai/code-bison@001",
        "vertex_ai/code-gecko@001",
        "vertex_ai/code-gecko@latest"
      ],
      api_url: "https://{location}-aiplatform.googleapis.com/v1/projects/{project_id}/locations/{location}/publishers/google/models/{model}:predict",
      doc_url:"https://cloud.google.com/vertex-ai/docs/reference/rest"
    },
    // Gemini Pro
    {
      name: "Gemini - Google AI Studio",
      models: [
        "gemini/gemini-pro",
        "gemini/gemini-1.5-pro-latest"
      ],
      api_url: "https://generativelanguage.googleapis.com/v1beta2/models/{model}:generateMessage",
      doc_url:"https://ai.google.dev/gemini-api/docs"
    },
    // IBM watsonx.ai
    {
      name: "IBM watsonx.ai",
      models: [
        "watsonx/google/flan-t5-xxl",
        "watsonx/google/flan-ul2",
        "watsonx/bigscience/mt0-xxl",
        "watsonx/eleutherai/gpt-neox-20b",
        "watsonx/ibm/mpt-7b-instruct2",
        "watsonx/bigcode/starcoder",
        "watsonx/meta-llama/llama-2-70b-chat",
        "watsonx/meta-llama/llama-2-13b-chat",
        "watsonx/ibm/granite-13b-instruct-v1",
        "watsonx/ibm/granite-13b-chat-v1",
        "watsonx/google/flan-t5-xl",
        "watsonx/ibm/granite-13b-chat-v2",
        "watsonx/ibm/granite-13b-instruct-v2",
        "watsonx/elyza/elyza-japanese-llama-2-7b-instruct",
        "watsonx/ibm-mistralai/mixtral-8x7b-instruct-v01-q"
      ],
      api_url: "https://api.watsonx.ai/v1/generations",
      doc_url:"https://cloud.ibm.com/apidocs/watsonx-ai"
    },
    // Others
    {
      name: "Others (Custom)",
      models: [],
      api_url: "",
      doc_url: ""
    }
  ]
};