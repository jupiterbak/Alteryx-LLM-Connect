import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from ayx_python_sdk.core import Anchor
from ayx_python_sdk.core.testing import BatchTuple, SdkToolTestService

from backend.ayx_plugins.l_l_m_connect import LLMConnect

import pyarrow as pa
from pyarrow import RecordBatch
import pandas as pd
import pytest
from pprint import pprint


TEST_SCHEMA = pa.schema([
    ('Prompt', pa.string()),
])


@pytest.fixture
def small_batches():
    repeat = 30
    input_data = [
        "Tell me a fun fact about mathematics",
    ] * repeat
    df = pd.DataFrame({'Prompt': input_data})
    return pa.RecordBatch.from_pandas(df)


@pytest.fixture()
def medium_batches():
    repeat = 200
    input_data = [
        ["Tell me a fun fact about mathematics"] * repeat,
        ["Tell me a fun fact about python"] * repeat
    ]
    output_data = input_data
    return BatchTuple(
        input_data=RecordBatch.from_arrays(input_data, schema=TEST_SCHEMA),
        expected_output_data=RecordBatch.from_arrays(output_data, schema=TEST_SCHEMA)
    )


@pytest.fixture()
def large_batches():
    repeat = 20000
    input_data = [
        ["Tell me a fun fact about programming"] * repeat,
        ["Tell me a fun fact about programming"] * repeat
    ]
    output_data = input_data
    return BatchTuple(
        input_data=RecordBatch.from_arrays(input_data, schema=TEST_SCHEMA),
        expected_output_data=RecordBatch.from_arrays(output_data, schema=TEST_SCHEMA)
    )


@pytest.fixture
def l_l_m_connect_plugin_service():
    """
    This fixture is where you instantiate and configure your plugin's testing service.
    Please edit input_ and output_anchor_config to reflect your tool's anchor configuration.

    Note: The config_mock parameter is meant to represent the output from the UI window.
    Currently, it only takes in an XML string, wrapped in <Configuration> tags.
    """
    return SdkToolTestService(
        plugin_class=LLMConnect,
        config_mock="""<Configuration>
          <platform>**Local Inference**</platform>
          <platformDocUrl>https://platform.openai.com/docs/api-reference/chat/create</platformDocUrl>
          <endpoint>
          </endpoint>
          <useApiKey>0</useApiKey>
          <model>C:/DATA/03_LLM_Models/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/mistral-7b-instruct-v0.2.Q4_K_S.gguf</model>
          <temperature>0.8</temperature>
          <topP>1</topP>
          <maxToken>512</maxToken>
          <stop>
          </stop>
          <seed>5</seed>
          <checkSafety>1</checkSafety>
          <useCaching>1</useCaching>
          <promptField>Prompt</promptField>
          <systemPrompt>You are a helpful assistant.</systemPrompt>
          <useSystemPrompt>0</useSystemPrompt>
          <maxBudget>1</maxBudget>
          <simulateResponse>0</simulateResponse>
          <simulateResponseText>The response has been simulated.</simulateResponseText>
          <batchProcessing>0</batchProcessing>
          <enforceJsonResponse>0</enforceJsonResponse>
          <gpuOffload>0</gpuOffload>
          <nGpuLayers>0</nGpuLayers>
          <gpuMemory>50</gpuMemory>
          <Secrets />
        </Configuration>""",
        input_anchor_config={
            "Input": TEST_SCHEMA,
        },
        output_anchor_config={
           "Output": pa.schema([]),
        }
    )


def test_init(l_l_m_connect_plugin_service):
    """
    This function is where you should test your plugin's constructor (ie, LLMConnect.__init__())
    Use l_l_m_connect_plugin_service.plugin to reference the created plugin.

    You can also test the plugin's attributes by referencing them and checking them against expected values.
    """
    assert l_l_m_connect_plugin_service.plugin is not None


@pytest.mark.parametrize("record_batch_set", ["small_batches"])
@pytest.mark.parametrize("anchor", [
     Anchor("Input", "1"),
])
def test_on_record_batch(l_l_m_connect_plugin_service, anchor, record_batch_set, request):
    """
    This function is where you should test your plugin's on_record_batch method.
    Use l_l_m_connect_plugin_service.run_on_record_batch to run the specified record batch
    through the specified input anchor.

    Once the method has run, you can compare the output data against expected values,
    by accessing the corresponding data from l_l_m_connect_plugin_service.data_streams.
    Use the output anchor name as the dictionary key.
    If no data was written, l_l_m_connect_plugin_service.data_streams will be an empty dictionary.

    You can also compare IO calls made to designer through l_l_m_connect_plugin_service.io_stream.
    The message type (INFO, WARN, ERROR) will be prepended to the message's text with a colon.
    If no provider.io methods were called, l_l_m_connect_plugin_service.io_stream will be an empty list.
    """
    input_record_batch= request.getfixturevalue(record_batch_set)

    l_l_m_connect_plugin_service.run_on_record_batch(input_record_batch, anchor)
    
    assert l_l_m_connect_plugin_service.data_streams["Output"][0].num_rows > 0
    pprint(l_l_m_connect_plugin_service.io_stream)
    #assert l_l_m_connect_plugin_service.io_stream == []

    

@pytest.mark.parametrize("anchor", [
     Anchor("Input", "1"),
])
def test_on_incoming_connection_complete(l_l_m_connect_plugin_service, anchor):
    """
    This function is where you should test your plugin's on_incoming_connection_complete method.
    Use l_l_m_connect_plugin_service.run_on_incoming_connection_complete against the specified input anchors.

    Once the method has run, you can compare the output data against expected values,
    by accessing the corresponding data from l_l_m_connect_plugin_service.data_streams.
    Use the output anchor name as the dictionary key.
    If no data was written, l_l_m_connect_plugin_service.data_streams will be an empty dictionary.

    You can also compare IO calls made to designer through l_l_m_connect_plugin_service.io_stream.
    The message type (INFO, WARN, ERROR) will be prepended to the message's text with a colon.
    If no provider.io methods were called, l_l_m_connect_plugin_service.io_stream will be an empty list.
    """
    # Get the tool service and cast it to the LLMConnect class 
    l_l_m_connect_plugin_service.run_on_incoming_connection_complete(anchor)
    
    
    # assert l_l_m_connect_plugin_service.data_streams == {}
    # assert l_l_m_connect_plugin_service.io_stream == [
    #     f"INFO:Received complete update from {anchor.name}:{anchor.connection}."
    # ]

    

def test_on_complete(l_l_m_connect_plugin_service):
    """
    This function is where you should test your plugin's on_complete method.
    Use l_l_m_connect_plugin_service.run_on_complete to run the plugin's on_complete method.

    Once the method has run, you can compare the output data against expected values,
    by accessing the corresponding data from l_l_m_connect_plugin_service.data_streams.
    Use the output anchor name as the dictionary key.
    If no data was written, l_l_m_connect_plugin_service.data_streams will be an empty dictionary.

    You can also compare IO calls made to designer through l_l_m_connect_plugin_service.io_stream.
    The message type (INFO, WARN, ERROR) will be prepended to the message's text with a colon.
    If no provider.io methods were called, l_l_m_connect_plugin_service.io_stream will be an empty list.
    """
    l_l_m_connect_plugin_service.run_on_complete()
    
    # assert l_l_m_connect_plugin_service.data_streams == {}
    # assert l_l_m_connect_plugin_service.io_stream == ["INFO:LLMConnect tool done."]

    