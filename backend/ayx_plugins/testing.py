from litellm import Cache, batch_completion, completion, completion_cost, completion_with_retries
from litellm.utils import trim_messages
from openai import OpenAIError
from pandas.core.dtypes.common import is_string_dtype
import litellm
import os
import pandas as pd
def main():
    # Configure LiteLLM to use Groq
    litellm.set_verbose = False
    os.environ['LITELLM_LOG'] = 'INFO'
    litellm.drop_params = True
    # Set litellm global params
    litellm.max_budget = 10000.0 #self.max_budget
    litellm.disable_cache()

    # Initialize  InputDataFrame
    input_dataframe = pd.DataFrame({
        "prompt": ["Tell me a fun fact about programming"] * 30
    })

    # Single processing using pandas transform
    def process_row(row):
        messages = [{"role": "user", "content": row}]

        try:
            completion_kwargs = {
                "model": "groq/mixtral-8x7b-32768",
                "messages": messages,
                "temperature": 0.7,
                "top_p": 1,
                "max_tokens": 100,
                "stop": None,
                "seed": None,
                "timeout": 2,
                "stream": False,
                "drop_params": True,
                "num_retries": 3,
                "logger_fn": None,
                "request_timeout": 2,
            }

            completion_kwargs["caching"] = False
            response = completion(**completion_kwargs)

            output_content = response['choices'][0]['message']['content']
            prompt_tokens = response['usage']['prompt_tokens']
            completion_tokens = response['usage']['completion_tokens']
            
            try:
                cost = completion_cost(completion_response=response)
            except Exception as e:
                print(f"Model does not support cost calculation.")
                cost = 0 # Set cost to 0 if model does not support cost calculation

            return pd.Series({
                'output': output_content,
                'prompt_tokens': prompt_tokens,
                'completion_tokens': completion_tokens,
                'cost($)': cost
            })

        except Exception as e:
            print(f"Error in litellm completion: {str(e)}")
            return pd.Series({
                'output': None,
                'prompt_tokens': None,
                'completion_tokens': None,
                'cost($)': None
            })

    # Apply the transform function to the prompt field
    result = input_dataframe['prompt'].transform(process_row)
    
    # Add results to the dataframe
    input_dataframe['output'] = result['output']
    input_dataframe['prompt_tokens'] = result['prompt_tokens']
    input_dataframe['completion_tokens'] = result['completion_tokens']
    input_dataframe['cost($)'] = result['cost($)']
    
    print(input_dataframe)

if __name__ == "__main__":
    main()

