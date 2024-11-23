# Copyright (C) 2022 Alteryx, Inc. All rights reserved.
#
# Licensed under the ALTERYX SDK AND API LICENSE AGREEMENT;
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.alteryx.com/alteryx-sdk-and-api-license-agreement
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Example pass through tool."""

import json
import os
from typing import Any, Dict, List
from datetime import datetime

import pandas as pd
import pyarrow as pa
from ayx_python_sdk.core import Anchor, PluginV2
from ayx_python_sdk.providers.amp_provider.amp_provider_v2 import AMPProviderV2
from litellm import Cache, batch_completion, completion, completion_cost, completion_with_retries
from litellm.utils import trim_messages
from openai import OpenAIError
from pandas.core.dtypes.common import is_string_dtype
from llama_cpp import Llama
import litellm

DEFAULT_NUM_RETRIES = 100
DEFAULT_INPUT_CONTEXT_LENGTH = 4096
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"
os.environ["LITELLM_MODE"] = "PRODUCTION"

class LLMConnect(PluginV2):
    """A sample Plugin that passes data from an input connection to an output connection."""

    def __init__(self, provider: AMPProviderV2):
        """Construct the plugin."""
        self.name = "LLMConnect"
        self.provider = provider
        self.provider.io.info(f"{self.name} tool started")
        # Initialize input_dataframe as empty list to store batches
        self.dataframe_batches = []
        
        # Read all configuration values
        self.platform = self.provider.tool_config.get("platform")
        self.endpoint = self.provider.tool_config.get("endpoint")
        self.use_api_key = self.provider.tool_config.get("useApiKey") == "1"
        self.api_keys = self.provider.tool_config.get("apiKeys") if self.use_api_key else None
        self.model = self.provider.tool_config.get("model") if self.provider.tool_config.get("model") else "gpt-4o"
        self.temperature = float(self.provider.tool_config.get("temperature")) if self.provider.tool_config.get("temperature") else 0.7
        self.top_p = float(self.provider.tool_config.get("topP")) if self.provider.tool_config.get("topP") else 1.0
        self.max_token = int(self.provider.tool_config.get("maxToken")) if self.provider.tool_config.get("maxToken") else 100
        self.stop = self.provider.tool_config.get("stop") if self.provider.tool_config.get("stop") else None
        self.seed = int(self.provider.tool_config.get("seed")) if self.provider.tool_config.get("seed") else None
        self.check_safety = self.provider.tool_config.get("checkSafety") == "1" if self.provider.tool_config.get("checkSafety") else False
        self.use_caching = self.provider.tool_config.get("useCaching") == "1" if self.provider.tool_config.get("useCaching") else False
        self.prompt_field = self.provider.tool_config.get("promptField") if self.provider.tool_config.get("promptField") else "prompt"
        self.system_prompt = self.provider.tool_config.get("systemPrompt") if self.provider.tool_config.get("systemPrompt") else None
        self.use_system_prompt = self.provider.tool_config.get("useSystemPrompt") == "1" if self.provider.tool_config.get("useSystemPrompt") else False
        self.simulate_response = self.provider.tool_config.get("simulateResponse") == "1" if self.provider.tool_config.get("simulateResponse") else False
        self.simulate_response_text = self.provider.tool_config.get("simulateResponseText") if self.provider.tool_config.get("simulateResponseText") else None
        self.num_retries = int(self.provider.tool_config.get("numRetries")) if self.provider.tool_config.get("numRetries") else DEFAULT_NUM_RETRIES
        self.batch_processing = self.provider.tool_config.get("batchProcessing") == "1" if self.provider.tool_config.get("batchProcessing") else False
        self.max_budget = float(self.provider.tool_config.get("maxBudget")) if self.provider.tool_config.get("maxBudget") else 1.001
        self.enforceJsonResponse = self.provider.tool_config.get("enforceJsonResponse") =="1"
        self.gpu_offload = self.provider.tool_config.get("gpuOffload") == "1" if self.provider.tool_config.get("gpuOffload") else False
        self.n_gpu_layers = int(self.provider.tool_config.get("nGpuLayers")) if self.provider.tool_config.get("nGpuLayers") else 10
        self.gpu_memory = int(self.provider.tool_config.get("gpuMemory")) if self.provider.tool_config.get("gpuMemory") else 10
        self.input_context_length = int(self.provider.tool_config.get("inputContextLength")) if self.provider.tool_config.get("inputContextLength") else DEFAULT_INPUT_CONTEXT_LENGTH

        # log tool config
        self.provider.io.info(f"Tool Config: {json.dumps(self.provider.tool_config, indent=2)}")
        
        self.total_cost = 0
        self.start_time = datetime.now()

        self.max_log_size = 10 * 1024 * 1024  # 10MB in bytes
        self.log_file = None
        self.create_new_log_file()

        litellm.drop_params = True
        litellm.set_verbose=False
        # Set litellm global params
        litellm.max_budget = 10000.0 #self.max_budget
        if self.use_caching:
            self.provider.io.info(f"Using caching")
            cache_path = os.path.expanduser("~/.ayx/litellm_cache/")
            os.makedirs(os.path.dirname(cache_path), exist_ok=True)
            litellm.cache = Cache(type="disk", disk_cache_dir=cache_path)
            litellm.enable_cache()
        else:
            self.provider.io.info(f"Not using caching")
            litellm.disable_cache() 
        
        # Add logic to handle local inference
        if self.platform == "**Local Inference**":
            self.provider.io.info(f"Using local inference")
            self.llama = Llama(model_path=self.model)
        else:
            self.llama = None
            self.provider.io.info(f"Using remote inference")

    def create_new_log_file(self):
        if self.log_file:
            self.log_file.close()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = f"{timestamp}_{os.getpid()}"
        log_filename = f"llm_connect_cost_{unique_id}.log"
        self.log_path = os.path.expanduser(f"~/.ayx/{log_filename}")

        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)

        # Open the file stream
        self.log_file = open(self.log_path, 'w')
        self.log_file.write(f"Start Time: {datetime.now()}\n")
        self.log_file.write(f"Model: {self.model}\n")
        self.log_file.write(f"Platform: {self.platform}\n")
        self.provider.io.info(f"Log file will be written to: {self.log_path}")

        # Log all the configuration values by converting tool_config to a string
        self.log_file.write(f"Tool Config: {json.dumps(self.provider.tool_config, indent=2)}\n")

    def check_log_size(self):
        if os.path.getsize(self.log_path) > self.max_log_size:
            self.create_new_log_file()

    def my_custom_logging_fn(self, model_call_dict):
        self.check_log_size()
        self.log_file.write(f"model call log details: {model_call_dict}\n")
        self.log_file.flush()  # Ensure the data is written to the file

    def process_row_locally(self, row):
        """Process a single row of data through the LLM. instantiated locally using llama.cpp"""
        if self.use_system_prompt:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": row}
            ]
        else:
            messages = [{"role": "user", "content": row}]
        

        try:
            self.provider.io.info(f"Requesting messages: {json.dumps(messages, indent=2)}")
            completion_kwargs = {
                "messages": messages,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "max_tokens": self.max_token,
                "stop": self.stop,
                "seed": self.seed,
                "stream": False
            }
            
            if self.enforceJsonResponse:
                completion_kwargs["response_format"] = {"type": "json_object"}

            if self.simulate_response:
                output_content = self.simulate_response_text
                prompt_tokens = 0
                completion_tokens = 0
            else:
                response = self.llama.create_chat_completion_openai_v1(**completion_kwargs)
                self.provider.io.info(f"Response received.")
                output_content = response.choices[0].message.content
                prompt_tokens = response.usage.prompt_tokens
                completion_tokens = response.usage.completion_tokens

            # No cost for local inference
            cost = 0 # Set cost to 0 for simulated responses

            return pd.Series({
                'output': output_content,
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'cost($)': cost
            })
        
        except Exception as e:
            self.provider.io.error(f"Error in completion: {str(e)}")
            return pd.Series({
                'output': None,
            })


    def process_row(self, row):
        """Process a single row of data through the LLM."""
        if self.use_system_prompt:
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": row}
            ]
        else:
            messages = [{"role": "user", "content": row}]
        messages = trim_messages(messages, self.model)

        try:
            self.provider.io.info(f"Requesting messages: {json.dumps(messages, indent=2)}")
            completion_kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "max_tokens": self.max_token,
                "stop": self.stop,
                "seed": self.seed,
                "timeout": 10,
                "stream": False,
                "drop_params": False,
                "num_retries": 100, #self.num_retries,
                "logger_fn": self.my_custom_logging_fn,
            }

            if self.use_caching:
                completion_kwargs["caching"] = True
            else:
                completion_kwargs["caching"] = False

            if self.simulate_response:
                completion_kwargs["mock_response"] = self.simulate_response_text

            if self.platform == "Others (Custom)":
                completion_kwargs["base_url"] = self.endpoint
                if self.use_api_key:
                    completion_kwargs["api_key"] = self.api_keys
            
            # self.provider.io.info(f"Sending request...")
            response = completion(**completion_kwargs)
            # self.provider.io.info(f"Response received.")

            output_content = response.choices[0].message.content
            prompt_tokens = response.usage.prompt_tokens
            completion_tokens = response.usage.completion_tokens
            
            if not self.simulate_response and not self.platform == "Others (Custom)":
                try:
                    cost = completion_cost(completion_response=response)
                    self.total_cost += cost
                except Exception as e:
                    self.provider.io.warn(f"Model {self.model} does not support cost calculation.")
                    cost = 0 # Set cost to 0 if model does not support cost calculation
            else:
                cost = 0 # Set cost to 0 for simulated responses

            return pd.Series({
                'output': output_content,
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'cost($)': cost
            })

        except Exception as e:
            self.provider.io.error(f"Error in completion: {str(e)}")
            return pd.Series({
                'output': None,
                'prompt_tokens': None,
                'completion_tokens': None,
                'cost($)': None
            })

    def process_batch(self, input_dataframe):
        """Process multiple rows of data through the LLM in batch mode."""
        batch_messages = []
        for _, row in input_dataframe.iterrows():
            if self.use_system_prompt:
                messages = [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": row[self.prompt_field]}
                ]
            else:
                messages = [
                    {"role": "user", "content": row[self.prompt_field]}
                ]
            batch_messages.append(trim_messages(messages, self.model))
        
        try:
            completion_kwargs = {
                "model": self.model,
                "messages": batch_messages,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "max_tokens": self.max_token,
                "stop": self.stop,
                "seed": self.seed,
                "drop_params": True,
                "stream": False,
                "timeout": 10,
                "num_retries": 100, #self.num_retries,
            }

            if self.use_caching:
                completion_kwargs["caching"] = True
            else:
                completion_kwargs["caching"] = False

            if self.simulate_response:
                completion_kwargs["mock_response"] = self.simulate_response_text

            if self.platform == "Others (Custom)":
                completion_kwargs["base_url"] = self.endpoint
                if self.use_api_key:
                    completion_kwargs["api_key"] = self.api_keys
            
            self.provider.io.info(f"Sending batch request...")
            responses = batch_completion(**completion_kwargs)
            self.provider.io.info(f"Batch response received.")

            outputs = []
            prompt_tokens_list = []
            completion_tokens_list = []
            costs = []

            for response in responses:
                output_content = response.choices[0].message.content
                prompt_tokens = response.usage.prompt_tokens
                completion_tokens = response.usage.completion_tokens
                
                if not self.simulate_response:
                    try:    
                        cost = completion_cost(completion_response=response)
                        self.total_cost += cost
                    except Exception as e:
                        self.provider.io.warn(f"Model {self.model} does not support cost calculation.")
                        cost = 0 # Set cost to 0 if model does not support cost calculation
                else:
                    cost = 0  # Set cost to 0 for simulated responses

                outputs.append(output_content)
                prompt_tokens_list.append(prompt_tokens)
                completion_tokens_list.append(completion_tokens)
                costs.append(cost)

            return outputs, prompt_tokens_list, completion_tokens_list, costs

        except Exception as e:
            self.provider.io.error(f"Error in batch completion: {str(e)}")
            return ([None] * len(input_dataframe), 
                   [None] * len(input_dataframe),
                   [None] * len(input_dataframe),
                   [None] * len(input_dataframe))

    def on_record_batch(self, batch: "pa.Table", anchor: Anchor) -> None:
        """
        Process the passed record batch.

        The method that gets called whenever the plugin receives a record batch on an input.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        batch
            A pyarrow Table containing the received batch.
        anchor
            A namedtuple('Anchor', ['name', 'connection']) containing input connection identifiers.
        """
        # self.provider.write_to_anchor("Output", batch)  
        # log the batch

        metadata = batch.schema
        if not any([field_name == self.prompt_field for field_name in metadata.names]):
            raise RuntimeError(
                f"Incoming data must contain a column with the prompt field: '{self.prompt_field}'"
            )
        
        current_batch = batch.to_pandas(split_blocks=False)
        if not is_string_dtype(current_batch[self.prompt_field]):
            raise RuntimeError(f"'{self.prompt_field}' column must be of 'string' data type")
        
        # Process the current batch
        if self.batch_processing:
            # Batch processing
            outputs, prompt_tokens_list, completion_tokens_list, costs = self.process_batch(current_batch)
            
            # Add results to the current batch
            current_batch['output'] = outputs
            current_batch['prompt_tokens'] = prompt_tokens_list
            current_batch['completion_tokens'] = completion_tokens_list
            current_batch['cost($)'] = costs
        # if local inference 
        elif self.platform == "**Local Inference**":
            result = current_batch[self.prompt_field].transform(self.process_row_locally)
            
            # Add results to the current batch
            current_batch['output'] = result['output']
            current_batch['prompt_tokens'] = result['prompt_tokens']
            current_batch['completion_tokens'] = result['completion_tokens']
            current_batch['cost($)'] = result['cost($)']
        else:
            # Single processing using pandas transform
            result = current_batch[self.prompt_field].transform(self.process_row)
            
            # Add results to the current batch
            current_batch['output'] = result['output']
            current_batch['prompt_tokens'] = result['prompt_tokens']
            current_batch['completion_tokens'] = result['completion_tokens']
            current_batch['cost($)'] = result['cost($)']
        
        # Write the current batch to the output anchor
        self.provider.io.info(f"Writing final batch to output anchor.")
        self.provider.write_to_anchor("Output", pa.Table.from_pandas(current_batch))


    def on_incoming_connection_complete(self, anchor: Anchor) -> None:
        """
        Call when an incoming connection is done sending data including when no data is sent on an optional input anchor.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        anchor
            NamedTuple containing anchor.name and anchor.connection.
        """
        self.provider.io.info(f"Incoming connection complete for anchor: {anchor.name}")

    def on_complete(self) -> None:
        """Clean up any plugin resources."""

        # Write final information and close the log file
        end_time = datetime.now()
        self.log_file.write(f"End Time: {end_time}\n")
        self.log_file.write(f"Total Cost: ${self.total_cost:.4f}\n")
        self.log_file.close()
