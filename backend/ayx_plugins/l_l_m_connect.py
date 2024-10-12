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

import pandas as pd
import pyarrow as pa
from ayx_python_sdk.core import Anchor, PluginV2
from ayx_python_sdk.providers.amp_provider.amp_provider_v2 import AMPProviderV2
from litellm import Cache, batch_completion, completion, completion_cost
from litellm.utils import trim_messages
from openai import OpenAIError
from pandas.core.dtypes.common import is_string_dtype
import litellm

DEFAULT_NUM_RETRIES = 3

class LLMConnect(PluginV2):
    """A sample Plugin that passes data from an input connection to an output connection."""

    def __init__(self, provider: AMPProviderV2):
        """Construct the plugin."""
        self.name = "LLMConnect"
        self.provider = provider
        self.provider.io.info(f"{self.name} tool started")
        # Read all configuration values
        self.platform = self.provider.tool_config.get("platform")
        self.endpoint = self.provider.tool_config.get("endpoint")
        self.use_api_key = self.provider.tool_config.get("useApiKey") == "1"
        # self.api_keys = self.provider.tool_config("apiKeys")
        self.model = self.provider.tool_config.get("model")
        self.temperature = float(self.provider.tool_config.get("temperature"))
        self.top_p = float(self.provider.tool_config.get("topP"))
        self.max_token = int(self.provider.tool_config.get("maxToken"))
        self.stop = self.provider.tool_config.get("stop")
        self.seed = int(self.provider.tool_config.get("seed")) if self.provider.tool_config.get("seed") else None
        self.check_safety = self.provider.tool_config.get("checkSafety") == "1"
        self.use_caching = self.provider.tool_config.get("useCaching") == "1"
        self.prompt_field = self.provider.tool_config.get("promptField")
        self.system_prompt = self.provider.tool_config.get("systemPrompt")
        self.use_system_prompt = self.provider.tool_config.get("useSystemPrompt") == "1"
        self.simulate_response = self.provider.tool_config.get("simulateResponse") == "1"
        self.simulate_response_text = self.provider.tool_config.get("simulateResponseText")
        self.num_retries = DEFAULT_NUM_RETRIES
        self.batch_processing = self.provider.tool_config.get("batchProcessing") == "1"
        self.max_budget = float(self.provider.tool_config.get("maxBudget")) if self.provider.tool_config.get("maxBudget") else 1.001
        self.enforceJsonResponse = self.provider.tool_config.get("enforceJsonResponse") =="1"
        
        # Log all the configuration values by converting tool_config to a string
        self.provider.io.info(f"Tool Config: {json.dumps(self.provider.tool_config, indent=2)}")
        
        self.total_cost = 0
        litellm.drop_params = True
        # litellm.set_verbose=True
        # Set litellm global params
        litellm.max_budget = self.max_budget
        if self.use_caching:
            litellm.cache = Cache()
            litellm.enable_cache()
        else:
            litellm.disable_cache()        
        os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"

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

        def my_custom_logging_fn(model_call_dict):
            self.provider.io.info(f"model call details: ")      

        metadata = batch.schema
        if not any([field_name == self.prompt_field for field_name in metadata.names]):
            raise RuntimeError(
                f"Incoming data must contain a column with the prompt field: '{self.prompt_field}'"
            )
        input_dataframe = batch.to_pandas()

        if not is_string_dtype(input_dataframe[self.prompt_field]):
            raise RuntimeError(f"'{self.prompt_field}' column must be of 'string' data type")

        outputs = []
        prompt_tokens_list = []
        completion_tokens_list = []
        costs = []

        if self.batch_processing:
            # Batch processing
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
            
            self.provider.io.info(f"Batch Requesting messages: {json.dumps(batch_messages, indent=2)}")
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
                    "timeout": 30,
                    # "num_retries": self.num_retries,
                    #"response_format": "json_object" if self.enforceJsonResponse=="1" else None                    
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
                
                # if self.enforceJsonResponse:
                #     completion_kwargs["response_format"] = "json_object"
                # else:
                #     completion_kwargs["response_format"] = None

                responses = batch_completion(**completion_kwargs)

                for response in responses:
                    output_content = response['choices'][0]['message']['content']
                    prompt_tokens = response['usage']['prompt_tokens']
                    completion_tokens = response['usage']['completion_tokens']
                    
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

            except Exception as e:
                self.provider.io.error(f"Error in batch completion: {str(e)}")
                outputs = [None] * len(input_dataframe)
                prompt_tokens_list = [None] * len(input_dataframe)
                completion_tokens_list = [None] * len(input_dataframe)
                costs = [None] * len(input_dataframe)
            
            # Add results to the dataframe
            input_dataframe['output'] = outputs
            input_dataframe['prompt_tokens'] = prompt_tokens_list
            input_dataframe['completion_tokens'] = completion_tokens_list
            input_dataframe['cost($)'] = costs

        else:
            # Single processing using pandas transform
            def process_row(row):
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
                        "timeout": 30,
                        # "num_retries": self.num_retries,
                        # "response_format": "json_object" if self.enforceJsonResponse=="1" else None
                        # "check_safety": self.check_safety,
                        # "use_caching": self.use_caching,
                        # "logging_fn": my_custom_logging_fn,
                    }

                    if self.use_caching:
                        completion_kwargs["caching"] = True
                    else:
                        completion_kwargs["caching"] = False

                    if self.simulate_response:
                        completion_kwargs["mock_response"] = self.simulate_response_text

                    # if self.enforceJsonResponse:
                    #     completion_kwargs["response_format"] = "json_object"
                    # else:
                    #     completion_kwargs["response_format"] = None

                    if self.platform == "Others (Custom)":
                        completion_kwargs["base_url"] = self.endpoint
                        if self.use_api_key:
                            completion_kwargs["api_key"] = self.api_keys

                    response = completion(**completion_kwargs)

                    output_content = response['choices'][0]['message']['content']
                    prompt_tokens = response['usage']['prompt_tokens']
                    completion_tokens = response['usage']['completion_tokens']
                    
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
                    self.provider.io.error(f"Error in litellm completion: {str(e)}")
                    return pd.Series({
                        'output': None,
                        'prompt_tokens': None,
                        'completion_tokens': None,
                        'cost($)': None
                    })

            # Apply the transform function to the prompt field
            result = input_dataframe[self.prompt_field].transform(process_row)
            
            # Add results to the dataframe
            input_dataframe['output'] = result['output']
            input_dataframe['prompt_tokens'] = result['prompt_tokens']
            input_dataframe['completion_tokens'] = result['completion_tokens']
            input_dataframe['cost($)'] = result['cost($)']

        # Write the updated dataframe to the output anchor
        self.provider.io.info(f"Writing to output anchor.")
        self.provider.write_to_anchor("Output", pa.Table.from_pandas(input_dataframe))

    def on_incoming_connection_complete(self, anchor: Anchor) -> None:
        """
        Call when an incoming connection is done sending data including when no data is sent on an optional input anchor.

        This method IS NOT called during update-only mode.

        Parameters
        ----------
        anchor
            NamedTuple containing anchor.name and anchor.connection.
        """
        self.provider.io.info(
            f"Received complete update from {anchor.name}:{anchor.connection}."
        )

    def on_complete(self) -> None:
        """
        Clean up any plugin resources, or push records for an input tool.

        This method gets called when all other plugin processing is complete.

        In this method, a Plugin designer should perform any cleanup for their plugin.
        However, if the plugin is an input-type tool (it has no incoming connections),
        processing (record generation) should occur here.

        Note: A tool with an optional input anchor and no incoming connections should
        also write any records to output anchors here.
        """

        # Initialize the output dataframe
        self.provider.io.info(f"{self.name} tool done.")
        self.provider.io.info(f"Total cost: ${self.total_cost:.4f}")
