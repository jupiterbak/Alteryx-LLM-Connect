import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AyxAppWrapper, Box, Tabs, Tab, Typography, makeStyles, Theme, Grid, NativeSelect, TextField, Checkbox, FormControlLabel, FormGroup, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Slider } from '@alteryx/ui';
import { Alteryx, Delete as DeleteIcon, Plus as AddIcon, Server as BatchIcon, Save as SaveIcon, Download as ImportIcon } from '@alteryx/icons';
import { Context as UiSdkContext, DesignerApi, JsEvent } from '@alteryx/react-comms';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { config, Platform } from './config';

const DEFAULT_PLATFORM = "OpenAI"
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
//const DEFAULT_API_KEYS = [{ key: "OPENAI_API_KEY", value: "<yourkey>" }];
const DEFAULT_MODEL = "gpt-3.5-turbo"
const DEFAULT_PLATFORM_DOC_URL = "https://platform.openai.com/docs/api-reference/chat/create"
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_TOP_P = 1.0
const DEFAULT_MAX_TOKEN = 256
const DEFAULT_STOP = ""
const DEFAULT_SEED = 0
const DEFAULT_CHECK_SAFETY = "1"
const DEFAULT_USE_CACHING = "1"
const DEFAULT_PROMPT_FIELD = ""
const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant."
const USE_SYSTEM_PROMPT = "0"
const DEFAULT_USE_API_KEY = "0"
const DEFAULT_SIMULATE_RESPONSE = "0"
const DEFAULT_SIMULATE_RESPONSE_TEXT = "The response has been simulated."
const DEFAULT_BATCH_PROCESSING = "0"
const DEFAULT_MAX_BUDGET = 1.00
const DEFAULT_ENFORCE_JSON_RESPONSE = "0"
const DEFAULT_GPU_OFFLOAD = "0"
const DEFAULT_N_GPU_LAYERS = 0
const DEFAULT_GPU_MEMORY = 50
const DEFAULT_INPUT_CONTEXT_LENGTH = 4096


// Extract supported platforms, models, and API URLs
const platformConfig = config.supported_platforms
  .sort((a, b) => a.name.localeCompare(b.name))  // Sort platforms alphabetically by name
  .reduce((acc, platform) => {
    acc[platform.name] = {
      models: platform.models,
      apiUrl: platform.api_url
    };
    return acc;
  }, {});

const platformOptions = Object.keys(platformConfig);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  instructions: {
    marginBottom: theme.spacing(2),
    whiteSpace: 'pre-line',  // This will preserve line breaks
  },
  content: {
    marginTop: theme.spacing(2),
  },
  warningLabel: {
    color: theme.palette.warning.main,
    marginTop: theme.spacing(1),
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  tableContainer: {
    marginBottom: theme.spacing(2),
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
  italicText: {
    fontStyle: 'italic',
  },
  checkboxGroup: {
    marginTop: theme.spacing(2),
  },
  batchProcessingLabel: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    '& .MuiSvgIcon-root': {
      marginRight: theme.spacing(1),
    },
  },
  batchIcon: {
    marginRight: theme.spacing(1), // Add space between icon and text
  },
  textFieldLabel: {
    '& .MuiInputLabel-root': {
      ...theme.typography.subtitle1,
    },
  },
  boldPrimaryLabel: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  configButton: {
    minWidth: 'auto',
    padding: theme.spacing(0, 1),
    fontSize: '0.75rem',
    textTransform: 'none',
  },
  sliderLabel: {
    marginBottom: theme.spacing(1),
  },
  gpuSettingsGroup: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
}));

const App = () => {
  const classes = useStyles();
  const [model, handleUpdateModel] = useContext(UiSdkContext);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [fieldNames, setFieldNames] = useState<string[]>([]);

  const updateFieldNames = async () => {
    if (window.Alteryx) {
      const metaFields = window.Alteryx.model;

      if (metaFields && metaFields.Meta && metaFields.Meta.fields && metaFields.Meta.fields[0] && metaFields.Meta.fields[0][0] && metaFields.Meta.fields[0][0].fields) {
        const _fieldNames = metaFields.Meta.fields[0][0].fields;
        const newFieldNames = [''];
        for (const field of _fieldNames) {
          if (field.name) {
            newFieldNames.push(field.name);
          }
        }
        setFieldNames(newFieldNames);
      }
    }

    //console.log(await JsEvent('GetInputData', { anchorIndex: 0, connectionName: '' }))
  };

  useEffect(() => {
    updateFieldNames();
  }, []);

  useEffect(() => {
    updateFieldNames();
  }, [model]);

  // The following code is specifically a dev harness functionality.
  // If you're developing a tool for Designer, you'll want to remove this
  // and check out our docs for guidance 
  // useEffect(() => {
  //   handleUpdateModel(model);    
  // }, []);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePromptFieldChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        promptField: event.target.value as string
      }
    });
  };

  const handlePlatformChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedPlatform = event.target.value as string;
    const selectedPlatformConfig = config.supported_platforms.find(p => p.name === selectedPlatform);
    
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        platform: selectedPlatform,
        endpoint: platformConfig[selectedPlatform]?.apiUrl || '',
        model: (platformConfig[selectedPlatform]?.models || [])[0] || '',
        platformDocUrl: selectedPlatformConfig?.doc_url || DEFAULT_PLATFORM_DOC_URL,
        // Reset GPU settings if not Local Inference
        ...(selectedPlatform !== "**Local Inference**" && {
          gpuOffload: DEFAULT_GPU_OFFLOAD,
          nGpuLayers: DEFAULT_N_GPU_LAYERS,
          gpuMemory: DEFAULT_GPU_MEMORY
        })
      }
    });

    // Update the selected platform in state
    setSelectedPlatform(selectedPlatformConfig || null);

    // // Using Alteryx SDK to get the token
    // const val = await JsEvent('GetDataConnectionInfo', {});
    // //Deep log the val as a JSON object
    // console.log("val:", JSON.stringify(val, null, 2));
  };

  const handleMaxBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        maxBudget: Number(event.target.value)
      }
    });
  };

  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        model: event.target.value as string
      }
    });
  };

  const handleCheckboxChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        [field]: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleEnforceJsonResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enforceJsonResponse = event.target.checked ? "1" : "0";
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        enforceJsonResponse,
      }
    });
  };

  const handleSystemPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        systemPrompt: event.target.value
      }
    });
  };

  const handleUseSystemPromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        useSystemPrompt: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleEndpointChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        endpoint: event.target.value
      }
    });
  };

  const handleUseApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        useApiKey: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleAPIKeyChange = (index: number, field: 'key' | 'value') => (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleAPIKeyChange", index, field, event.target.value);
    const newApiKeys = (model.Configuration.apiKeys || []).map((apiKey, i) => {
      if (i === index) {
        return { ...apiKey, [field]: event.target.value };
      }
      return { ...apiKey };
    });
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        apiKeys: newApiKeys
      }
    });
  };

  const addApiKey = () => {
    console.log("addApiKey");
    const newApiKeys = [
      ...(model.Configuration.apiKeys || []).map(apiKey => ({ ...apiKey })),
      { key: "", value: "" }
    ];
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        apiKeys: newApiKeys
      }
    });
  };

  const removeApiKey = (index: number) => {
    console.log("removeApiKey", index);
    const newApiKeys = (model.Configuration.apiKeys || [])
      .filter((_, i) => i !== index)
      .map(apiKey => ({ ...apiKey }));
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        apiKeys: newApiKeys
      }
    });
  };

  const handleTemperatureChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        [field]: Number(event.target.value)
      }
    });
  };

  const handleTopPChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        [field]: Number(event.target.value)
      }
    });
  };

  const handleMaxTokenChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        [field]: Number(event.target.value)
      }
    });
  };

  const handleStopChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        stop: event.target.value
      }
    });
  };

  const handleSeedChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        [field]: Number(event.target.value)
      }
    });
  };

  const handleCheckSafetyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        checkSafety: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleUseCachingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        useCaching: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleSimulateResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        simulateResponse: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleSimulateResponseTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        simulateResponseText: event.target.value
      }
    });
  };

  const handleBatchProcessingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        batchProcessing: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleGpuOffloadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        gpuOffload: event.target.checked ? "1" : "0"
      }
    });
  };

  const handleInputContextLengthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        inputContextLength: Number(event.target.value)
      }
    });
  };

  const handleNGpuLayersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        nGpuLayers: Number(event.target.value)
      }
    });
  };

  const handleGpuMemoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        gpuMemory: Number(event.target.value)
      }
    });
  };

  const saveConfiguration = () => {
    const config = JSON.stringify(model.Configuration, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'llm_connect_config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          handleUpdateModel({
            ...model,
            Configuration: config
          });
        } catch (error) {
          console.error('Error parsing JSON:', error);
          // You might want to show an error message to the user here
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Grid container className={classes.root} direction="column" spacing={2}>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" className={classes.title}>
            <FormattedMessage id="title" defaultMessage="LLM Connect" />
          </Typography>
          <Box>
            <Button
              startIcon={<SaveIcon />}
              onClick={saveConfiguration}
              color="primary"
              size="small"
              className={classes.configButton}
              style={{ marginRight: '4px' }}
            >
              {/* <FormattedMessage id="saveConfig" defaultMessage="Save" /> */}
            </Button>
            <Button
              startIcon={<ImportIcon />}
              component="label"
              color="primary"
              size="small"
              className={classes.configButton}
            >
              {/* <FormattedMessage id="importConfig" defaultMessage="Import" /> */}
              <input
                type="file"
                hidden
                accept=".json"
                onChange={importConfiguration}
              />
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" className={classes.instructions}>
          <FormattedMessage 
            id="instructions" 
            defaultMessage="Configure your LLM connection settings and prompt below. {note}"
            values={{
              note: (
                <span className={classes.italicText}>
                  <FormattedMessage
                    id="instructions.note"
                    defaultMessage="\nNote: Vision models are not supported."
                  />
                </span>
              ),
            }}
          />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={<FormattedMessage id="tab.prompt" defaultMessage="Prompt" />} />
          <Tab label={<FormattedMessage id="tab.platform" defaultMessage="Platform" />} />
          <Tab label={<FormattedMessage id="tab.inferenceSettings" defaultMessage="Inference Settings" />} />
          <Tab label={<FormattedMessage id="tab.simulate" defaultMessage="Simulate" />} />
        </Tabs>
      </Grid>
      <Grid item xs={12} className={classes.content}>
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <FormattedMessage id="prompt.selectField" defaultMessage="Select Prompt Field" />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <NativeSelect
                value={model.Configuration.promptField || ''}
                onChange={handlePromptFieldChange}
                defaultValue={fieldNames[0]}
                fullWidth
                inputProps={{ placeholder: 'Select a field' }}
              >
                {fieldNames.map((fieldName) => (
                  <option key={fieldName} value={fieldName}>
                    {fieldName || <FormattedMessage id="prompt.selectFieldOption" defaultMessage="Select a field" />}
                  </option>
                ))}
              </NativeSelect>
              {!model.Configuration.promptField && (
                <Typography variant="caption" className={classes.warningLabel}>
                  <FormattedMessage id="prompt.warningLabel" defaultMessage="Please select a prompt field." />
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={model.Configuration.useSystemPrompt === "1"}
                    onChange={handleUseSystemPromptChange}
                    color="primary"
                  />
                }
                label={<FormattedMessage id="prompt.useSystemPrompt" defaultMessage="Use System Prompt" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<FormattedMessage id="prompt.systemPrompt" defaultMessage="System Prompt" />}
                multiline
                rows={4}
                value={model.Configuration.systemPrompt || ''}
                onChange={handleSystemPromptChange}
                fullWidth
                disabled={model.Configuration.useSystemPrompt !== "1"}
                className={`${classes.textField} ${classes.textFieldLabel}`}
              />
            </Grid>
          </Grid>
        )}
        {activeTab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <FormattedMessage id="platform.select" defaultMessage="Select Platform" />
              </Typography>
              <NativeSelect
                value={model.Configuration.platform || ''}
                onChange={handlePlatformChange}
                fullWidth
                className={classes.textField}
                inputProps={{ placeholder: 'Select a platform' }}
              >
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
              {!model.Configuration.platform && (
                <Typography variant="caption" className={classes.warningLabel}>
                  <FormattedMessage id="platform.warningLabel" defaultMessage="Please select a platform." />
                </Typography>
              )}
            </Grid>
            
            {model.Configuration.platform !== "**Local Inference**" && (
              <Grid item xs={12}>
                <TextField
                  label={<FormattedMessage id="platform.url" defaultMessage="URL" />}
                  value={model.Configuration.endpoint || ''}
                  onChange={handleEndpointChange}
                  fullWidth
                  className={`${classes.textField} ${classes.textFieldLabel}`}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              {model.Configuration.platform !== "Others (Custom)" && model.Configuration.platform !== "**Local Inference**" && (
                <Typography variant="subtitle1">
                  <FormattedMessage id="platform.selectModel" defaultMessage="Select Model" />
                </Typography>
              )}
              {model.Configuration.platform === "Others (Custom)" || model.Configuration.platform === "**Local Inference**" ? (
                <TextField
                  label={<FormattedMessage id="platform.modelName" defaultMessage="Model Name / Model Path" />}
                  value={model.Configuration.model || ''}
                  onChange={(event) => handleModelChange({ target: { value: event.target.value } })}
                  fullWidth
                  className={classes.textField}
                />
              ) : (
                <NativeSelect
                  value={model.Configuration.model || ''}
                  onChange={handleModelChange}
                  fullWidth
                  className={classes.textField}
                  inputProps={{ placeholder: 'Select a model' }}
                >
                  {model.Configuration.platform && platformConfig[model.Configuration.platform].models.map((modelOption) => (
                    <option key={modelOption} value={modelOption}>
                      {modelOption}
                    </option>
                  ))}
                </NativeSelect>
              )}
              {!model.Configuration.model && (
                <Typography variant="caption" className={classes.warningLabel}>
                  <FormattedMessage id="platform.modelWarningLabel" defaultMessage="Please select a model." />
                </Typography>
              )}
            </Grid>
            
            {model.Configuration.platform !== "**Local Inference**" && (
              <>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={model.Configuration.useApiKey === "1"}
                        onChange={handleUseApiKeyChange}
                        color="primary"
                        disabled
                      />
                    }
                    label={<FormattedMessage id="platform.useApiKey" defaultMessage="Use API Key" />}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    <FormattedMessage
                      id="apiKeyInstructions"
                      defaultMessage="For security reasons, please define your API Keys as environment variables. Follow {docLink} for more information."
                      values={{
                        docLink: (
                          <a href={model.Configuration.platformDocUrl || '#'} target="_blank" rel="noopener noreferrer">
                            <FormattedMessage
                              id="apiKeyInstructions.docLink"
                              defaultMessage="this link"
                            />
                          </a>
                        ),
                      }}
                    />
                  </Typography>
                </Grid>
              </>
            )}
            {model.Configuration.platform === "**Local Inference**" && (
              <Grid item xs={12}>
                <Box className={classes.gpuSettingsGroup}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={model.Configuration.gpuOffload === "1"}
                          onChange={handleGpuOffloadChange}
                          color="primary"
                        />
                      }
                      label={<FormattedMessage id="platform.gpuOffload" defaultMessage="GPU Offload" />}
                    />
                  </FormGroup>
                  {/* <Typography variant="subtitle1" className={classes.italicText}>
                    <FormattedMessage id="platform.gpuSettings" defaultMessage="GPU Settings" />
                  </Typography> */}
                  {model.Configuration.gpuOffload === "1" && (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label={<FormattedMessage id="platform.nGpuLayers" defaultMessage="Number of GPU Layers" />}
                            type="number"
                            value={model.Configuration.nGpuLayers ?? DEFAULT_N_GPU_LAYERS}
                            onChange={handleNGpuLayersChange}
                            fullWidth
                            className={`${classes.textField} ${classes.textFieldLabel}`}
                            inputProps={{ step: 1, min: 0 }}
                            disabled={true}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label={<FormattedMessage id="platform.inputContextLength" defaultMessage="Customized Input Context Length" />}
                            type="number"
                            value={model.Configuration.inputContextLength ?? DEFAULT_INPUT_CONTEXT_LENGTH}
                            onChange={handleInputContextLengthChange}
                            fullWidth
                            className={`${classes.textField} ${classes.textFieldLabel}`}
                            inputProps={{ step: 1, min: 0 }}
                            disabled={true}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography id="gpu-memory-slider" className={classes.sliderLabel}>
                            <FormattedMessage id="platform.gpuMemory" defaultMessage="GPU Memory (%)" />
                          </Typography>
                          <Slider
                            value={model.Configuration.gpuMemory ?? DEFAULT_GPU_MEMORY}
                            disabled={true}
                            onChange={(_, value) => {
                              handleUpdateModel({
                                ...model,
                                Configuration: {
                                  ...model.Configuration,
                                  gpuMemory: value as number
                                }
                              });
                            }}
                            min={0}
                            max={100}
                            valueLabelDisplay="auto"
                            aria-labelledby="gpu-memory-slider"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        )}
        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1">
                <FormattedMessage 
                  id="inferenceSettings.selectedConfig" 
                  defaultMessage="Selected Configuration: {platform} - {model}"
                  values={{
                    platform: model.Configuration.platform || 'Not selected',
                    model: model.Configuration.model || 'Not selected'
                  }}
                />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={
                  <Typography className={classes.boldPrimaryLabel}>
                    <FormattedMessage id="inferenceSettings.maxBudget" defaultMessage="Maximum Budget ($)" />
                  </Typography>
                }
                type="number"
                value={model.Configuration.maxBudget ?? DEFAULT_MAX_BUDGET}
                onChange={handleMaxBudgetChange}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.temperature" defaultMessage="Temperature" />}
                type="number"
                value={model.Configuration.temperature ?? DEFAULT_TEMPERATURE}
                onChange={handleTemperatureChange('temperature')}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
                inputProps={{ step: 0.001, min: 0, max: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.topP" defaultMessage="Top P" />}
                type="number"
                value={model.Configuration.topP ?? DEFAULT_TOP_P}
                onChange={handleTopPChange('topP')}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
                inputProps={{ step: 0.001, min: 0, max: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.maxToken" defaultMessage="Max Token" />}
                type="number"
                value={model.Configuration.maxToken ?? DEFAULT_MAX_TOKEN}
                onChange={handleMaxTokenChange('maxToken')}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
                inputProps={{ step: 1, min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.stop" defaultMessage="Stop" />}
                value={model.Configuration.stop ?? DEFAULT_STOP}
                onChange={handleStopChange}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.seed" defaultMessage="Seed" />}
                type="number"
                value={model.Configuration.seed ?? DEFAULT_SEED}
                onChange={handleSeedChange('seed')}
                fullWidth
                className={`${classes.textField} ${classes.textFieldLabel}`}
                inputProps={{ step: 1, min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup className={classes.checkboxGroup}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={model.Configuration.batchProcessing === "1"}
                      onChange={handleBatchProcessingChange}
                      color="primary"
                      //disabled={true}
                    />
                  }
                  label={
                    <Typography >
                      {/* <BatchIcon className={classes.batchIcon} /> */}
                      <FormattedMessage id="inferenceSettings.batchProcessing" defaultMessage="Batch Processing" />
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={model.Configuration.checkSafety === "1"}
                      onChange={handleCheckSafetyChange}
                      color="primary"
                    />
                  }
                  label={<FormattedMessage id="inferenceSettings.checkSafety" defaultMessage="Check Safety" />}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={model.Configuration.useCaching === "1"}
                      onChange={handleUseCachingChange}
                      color="primary"
                    />
                  }
                  label={<FormattedMessage id="inferenceSettings.enableCache" defaultMessage="Enable Cache" />}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={model.Configuration.enforceJsonResponse === "1"}
                      onChange={handleEnforceJsonResponseChange}
                      color="primary"
                    />
                  }
                  label={<FormattedMessage id="inferenceSettings.enforceJsonResponse" defaultMessage="Enforce JSON Response" />}
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <FormattedMessage
                  id="inferenceSettings.jsonModeNote"
                  defaultMessage="Important: When using JSON mode, you must also instruct the model to produce JSON yourself via a system or user message. Without this, the model may generate an unending stream of whitespace until the generation reaches the token limit, resulting in a long-running and seemingly 'stuck' request. Also note that the message content may be partially cut off if finish_reason='length', which indicates the generation exceeded max_tokens or the conversation exceeded the max context length."
                />
              </Typography>
            </Grid>
          </Grid>
        )}
        {activeTab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={model.Configuration.simulateResponse === "1"}
                    onChange={handleSimulateResponseChange}
                    color="primary"
                  />
                }
                label={<FormattedMessage id="simulate.simulateResponse" defaultMessage="Simulate Response" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<FormattedMessage id="simulate.simulatedResponseText" defaultMessage="Simulated Response Text" />}
                multiline
                rows={4}
                value={model.Configuration.simulateResponseText || ''}
                onChange={handleSimulateResponseTextChange}
                fullWidth
                disabled={model.Configuration.simulateResponse !== "1"}
                className={`${classes.textField} ${classes.textFieldLabel}`}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

const Tool = () => {
  const defaultConfig = {
    Configuration: {
      platform: DEFAULT_PLATFORM,
      platformDocUrl: DEFAULT_PLATFORM_DOC_URL,
      endpoint: DEFAULT_ENDPOINT,
      useApiKey: DEFAULT_USE_API_KEY,
      //apiKeys: DEFAULT_API_KEYS,
      model: DEFAULT_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      topP: DEFAULT_TOP_P,
      maxToken: DEFAULT_MAX_TOKEN,
      stop: DEFAULT_STOP,
      seed: DEFAULT_SEED,
      checkSafety: DEFAULT_CHECK_SAFETY,
      useCaching: DEFAULT_USE_CACHING ,
      promptField: DEFAULT_PROMPT_FIELD,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      useSystemPrompt: USE_SYSTEM_PROMPT,
      maxBudget: DEFAULT_MAX_BUDGET,
      //numRetries: DEFAULT_NUM_RETRIES,
      simulateResponse: DEFAULT_SIMULATE_RESPONSE,
      simulateResponseText: DEFAULT_SIMULATE_RESPONSE_TEXT,
      batchProcessing: DEFAULT_BATCH_PROCESSING,
      enforceJsonResponse: DEFAULT_ENFORCE_JSON_RESPONSE,
      gpuOffload: DEFAULT_GPU_OFFLOAD,
      nGpuLayers: DEFAULT_N_GPU_LAYERS,
      gpuMemory: DEFAULT_GPU_MEMORY,
    }
  };

  const messages = {
    en: {
      "title": "LLM Connect",
      "instructions": "Configure your LLM connection settings and prompt below. {note}",
      "instructions.note": "\nNote: Vision models are not supported.",
      "tab.prompt": "Prompt",
      "tab.platform": "Platform",
      "tab.inferenceSettings": "Inference Settings",
      "prompt.selectField": "Select Prompt Field",
      "prompt.selectFieldOption": "Select a field",
      "prompt.warningLabel": "Please select a prompt field.",
      "prompt.useSystemPrompt": "Use System Prompt",
      "prompt.systemPrompt": "System Prompt",
      "platform.select": "Select Platform",
      "platform.selectOption": "Select a platform",
      "platform.selectModel": "Select Model",
      "platform.selectModelOption": "Select a model",
      "platform.url": "URL",
      "platform.apiKey": "API Key",
      "platform.warningLabel": "Please select a platform.",
      "platform.modelWarningLabel": "Please select a model.",
      "platform.useApiKey": "Use API Key",
      "platform.apiKeyName": "API Key Name",
      "platform.apiKeyValue": "API Key Value",
      "platform.addApiKey": "Add API Key",
      "platform.removeApiKey": "Remove",
      "platform.modelName": "Model Name / Model Path",
      "inferenceSettings.temperature": "Temperature",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Max Token",
      "inferenceSettings.stop": "Stop",
      "inferenceSettings.seed": "Seed",
      "inferenceSettings.checkSafety": "Check Safety",
      "inferenceSettings.enableCache": "Enable Cache",
      "inferenceSettings.batchProcessing": "Batch Processing",
      "apiKeyInstructions": "For security reasons, please define your API Keys as environment variables. Follow {docLink} for more information.",
      "apiKeyInstructions.docLink": "this link",
      "tab.simulate": "Simulate",
      "simulate.simulateResponse": "Simulate Response",
      "simulate.simulatedResponseText": "Simulated Response Text",
      "inferenceSettings.maxBudget": "Maximum Budget ($)",
      "inferenceSettings.selectedConfig": "Selected Configuration: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Enforce JSON Response",
      "inferenceSettings.jsonModeNote": "Important: When using JSON mode, you must also instruct the model to produce JSON yourself via a system or user message. Without this, the model may generate an unending stream of whitespace until the generation reaches the token limit, resulting in a long-running and seemingly 'stuck' request. Also note that the message content may be partially cut off if finish_reason='length', which indicates the generation exceeded max_tokens or the conversation exceeded the max context length.",
      "saveConfig": "Save",
      "importConfig": "Import",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Number of GPU Layers",
      "platform.gpuMemory": "GPU Memory",
      "platform.inputContextLength": "Input Context Length",
    },
    es: {
      "title": "Conexión LLM",
      "instructions": "Configure los ajustes de conexión LLM y el prompt a continuación. {note}",
      "instructions.note": "\nNota: Los modelos de visión no son compatibles.",
      "tab.prompt": "Seleccionar campo de prompt",
      "tab.platform": "Plataforma",
      "tab.inferenceSettings": "Ajustes de inferencia",
      "prompt.selectField": "Seleccionar campo de prompt",
      "prompt.selectFieldOption": "Seleccione un campo",
      "prompt.warningLabel": "Por favor, seleccione el campo de prompt.",
      "prompt.useSystemPrompt": "Usar Prompt del Sistema",
      "prompt.systemPrompt": "Prompt del Sistema",
      "platform.select": "Seleccionar Plataforma",
      "platform.selectOption": "Seleccione una plataforma",
      "platform.selectModel": "Seleccionar Modelo",
      "platform.selectModelOption": "Seleccione un modelo",
      "platform.url": "URL",
      "platform.apiKey": "Clave API",
      "platform.warningLabel": "Por favor, seleccione una plataforma.",
      "platform.modelWarningLabel": "Por favor, seleccione un modelo.",
      "platform.useApiKey": "Usar Clave API",
      "platform.apiKeyName": "Nombre de la Clave API",
      "platform.apiKeyValue": "Valor de la Clave API",
      "platform.addApiKey": "Agregar Clave API",
      "platform.removeApiKey": "Eliminar",
      "platform.modelName": "Nombre del Modelo / Ruta del Modelo",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Token Máximo",
      "inferenceSettings.stop": "Parar",
      "inferenceSettings.seed": "Semilla",
      "inferenceSettings.checkSafety": "Verificar Seguridad",
      "inferenceSettings.enableCache": "Habilitar Caché",
      "inferenceSettings.batchProcessing": "Procesamiento por lotes",
      "apiKeyInstructions": "Por razones de seguridad, defina sus claves API como variables de entorno. Siga {docLink} para más información.",
      "apiKeyInstructions.docLink": "este enlace",
      "tab.simulate": "Simular",
      "simulate.simulateResponse": "Simular Respuesta",
      "simulate.simulatedResponseText": "Texto de Respuesta Simulada",
      "inferenceSettings.maxBudget": "Presupuesto Máximo ($)",
      "inferenceSettings.selectedConfig": "Configuración seleccionada: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Enforce JSON Response",
      "inferenceSettings.jsonModeNote": "Importante: Al usar JSON mode, también debe instruir al modelo a producir JSON por sí mismo mediante un mensaje del sistema o del usuario. Sin esto, el modelo puede generar una secuencia continua de espacios en blanco hasta que la generación alcance el límite de tokens, resultando en una solicitud que parece 'atascada'. También tenga en cuenta que el contenido del mensaje puede ser parcialmente cortado si finish_reason='length', que indica que la generación excedió max_tokens o que la conversación excedió la longitud máxima del contexto.",  
      "saveConfig": "Guardar",
      "importConfig": "Importar",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Número de Capas GPU",
      "platform.gpuMemory": "Memoria GPU",
      "platform.inputContextLength": "Longitud del Contexto de Entrada",
    },
    fr: {
      "title": "Connexion LLM",
      "instructions": "Configurez vos paramètres de connexion LLM et votre prompt ci-dessous. {note}",
      "instructions.note": "\nRemarque : Les modèles de vision ne sont pas pris en charge.",
      "tab.prompt": "Prompt",
      "tab.platform": "Plateforme",
      "tab.inferenceSettings": "Paramètres d'inférence",
      "prompt.selectField": "Sélectionner le champ de prompt",
      "prompt.selectFieldOption": "Sélectionnez un champ",
      "prompt.warningLabel": "Veuillez sélectionner le champ de prompt.",
      "prompt.useSystemPrompt": "Utiliser le Prompt Système",
      "prompt.systemPrompt": "Prompt Système",
      "platform.select": "Sélectionner la Plateforme",
      "platform.selectOption": "Sélectionnez une plateforme",
      "platform.selectModel": "Sélectionner le Modèle",
      "platform.selectModelOption": "Sélectionnez un modèle",
      "platform.url": "URL",
      "platform.apiKey": "Clé API",
      "platform.warningLabel": "Veuillez sélectionner une plateforme.",
      "platform.modelWarningLabel": "Veuillez sélectionner un modèle.",
      "platform.useApiKey": "Utiliser la Clé API",
      "platform.apiKeyName": "Nom de la Clé API",
      "platform.apiKeyValue": "Valeur de la Clé API",
      "platform.addApiKey": "Ajouter une Clé API",
      "platform.removeApiKey": "Supprimer",
      "platform.modelName": "Nom du Modèle / Chemin du Modèle",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Token Maximum",
      "inferenceSettings.stop": "Arrêt",
      "inferenceSettings.seed": "Graine",
      "inferenceSettings.checkSafety": "Vérifier la Sécurité",
      "inferenceSettings.enableCache": "Activer le Cache",
      "inferenceSettings.batchProcessing": "Traitement par lots",
      "apiKeyInstructions": "Pour des raisons de sécurité, veuillez définir vos clés API comme variables d'environnement. Suivez {docLink} pour plus d'informations.",
      "apiKeyInstructions.docLink": "ce lien",
      "tab.simulate": "Simuler",
      "simulate.simulateResponse": "Simuler la Réponse",
      "simulate.simulatedResponseText": "Texte de Réponse Simulée",
      "inferenceSettings.maxBudget": "Budget Maximum ($)",
      "inferenceSettings.selectedConfig": "Configuration sélectionnée: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Forcer la réponse JSON",
      "inferenceSettings.jsonModeNote": "Important: Lors de l'utilisation du mode JSON, vous devez également instruire le modèle à produire une réponse JSON par lui-même à l'aide d'un message système ou utilisateur. Sans cela, le modèle peut générer une séquence infinie de blancs jusqu'à ce que la génération atteigne la limite de tokens, entraînant une requête qui semble 'bloquée'. Notez également que le contenu du message peut être partiellement tronqué si finish_reason='length', ce qui signifie que la génération a dépassé le nombre de tokens ou que la conversation a dépassé la longueur maximale du contexte.",
      "saveConfig": "Sauvegarder",
      "importConfig": "Importer",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Nombre de Capas GPU",
      "platform.gpuMemory": "Memoire GPU",
      "platform.inputContextLength": "Longueur du Contexte d'Entrée",
    },
    de: {
      "title": "LLM-Verbindung",
      "instructions": "Konfigurieren Sie unten Ihre LLM-Verbindungseinstellungen und den Prompt. {note}",
      "instructions.note": "\nHinweis: Visionsmodelle werden nicht unterstützt.",
      "tab.prompt": "Prompt",
      "tab.platform": "Plattform",
      "tab.inferenceSettings": "Inferenz-Einstellungen",
      "prompt.selectField": "Prompt-Feld auswählen",
      "prompt.selectFieldOption": "Wählen Sie ein Feld",
      "prompt.warningLabel": "Bitte wählen Sie das Prompt-Feld aus.",
      "prompt.useSystemPrompt": "System-Prompt verwenden",
      "prompt.systemPrompt": "System-Prompt",
      "platform.select": "Plattform auswählen",
      "platform.selectOption": "Wählen Sie eine Plattform",
      "platform.selectModel": "Modell auswählen",
      "platform.selectModelOption": "Wählen Sie ein Modell",
      "platform.url": "URL",
      "platform.apiKey": "API-Schlüssel",
      "platform.warningLabel": "Bitte wählen Sie eine Plattform aus.",
      "platform.modelWarningLabel": "Bitte wählen Sie ein Modell aus.",
      "platform.useApiKey": "API-Schlüssel verwenden",
      "platform.apiKeyName": "API-Schlüssel-Name",
      "platform.apiKeyValue": "API-Schlüssel-Wert",
      "platform.addApiKey": "API-Schlüssel hinzufügen",
      "platform.removeApiKey": "Entfernen",
      "platform.modelName": "Modellname / Modellpfad",
      "inferenceSettings.temperature": "Temperatur",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Max Token",
      "inferenceSettings.stop": "Stopp",
      "inferenceSettings.seed": "Seed",
      "inferenceSettings.checkSafety": "Sicherheit Prüfen",
      "inferenceSettings.enableCache": "Cache Aktivieren",
      "inferenceSettings.batchProcessing": "Batch-Verarbeitung",
      "apiKeyInstructions": "Aus Sicherheitsgründen definieren Sie bitte Ihre API-Schlüssel als Umgebungsvariablen. Folgen Sie {docLink} für weitere Informationen.",
      "apiKeyInstructions.docLink": "diesem Link",
      "tab.simulate": "Simulieren",
      "simulate.simulateResponse": "Antwort Simulieren",
      "simulate.simulatedResponseText": "Simulierter Antworttext",
      "inferenceSettings.maxBudget": "Budget Maximum ($)",
      "inferenceSettings.selectedConfig": "Ausgewählte Konfiguration: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "JSON-Antwort erzwingen",
      "inferenceSettings.jsonModeNote": "Wichtig: Beim Verwenden von JSON-Modus muss der Modell auch selbst anweisen, JSON zu produzieren, indem Sie ein System- oder Benutzermeldung senden. Ohne dies wird das Modell eine unendliche Sequenz von Leerzeichen produzieren, bis die Generierung das Tokenlimit erreicht oder die Konversation die maximale Kontextlänge überschreitet, was eine scheinbar 'eingefrorene' Anfrage zur Folge hat. Beachten Sie auch, dass der Nachrichteninhalt möglicherweise teilweise abgeschnitten wird, wenn finish_reason='length', was bedeutet, dass die Generierung das Tokenlimit überschritten hat oder die Konversation die maximale Kontextlänge überschritten hat.",  
      "saveConfig": "Speichern",
      "importConfig": "Importieren",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Anzahl der GPU-Ebenen",
      "platform.gpuMemory": "GPU-Speicher",
      "platform.inputContextLength": "Eingabe-Kontextlänge",
    },
    pt: {
      "title": "ConecteLLM",
      "instructions": "Configure os ajustes de conexão LLM e o prompt abaixo. {note}",
      "instructions.note": "\nNota: Modelos de visão não são suportados.",
      "tab.prompt": "Prompt",
      "tab.platform": "Plataforma",
      "tab.inferenceSettings": "Configurações de inferência",
      "prompt.selectField": "Selecionar campo de prompt",
      "prompt.selectFieldOption": "Selecione um campo",
      "prompt.warningLabel": "Por favor, selecione o campo de prompt.",
      "prompt.useSystemPrompt": "Usar Prompt do Sistema",
      "prompt.systemPrompt": "Prompt do Sistema",
      "platform.select": "Selecionar Plataforma",
      "platform.selectOption": "Selecione uma plataforma",
      "platform.selectModel": "Selecionar Modelo",
      "platform.selectModelOption": "Selecione um modelo",
      "platform.url": "URL",
      "platform.apiKey": "Chave API",
      "platform.warningLabel": "Por favor, selecione uma plataforma.",
      "platform.modelWarningLabel": "Por favor, selecione um modelo.",
      "platform.useApiKey": "Usar Chave API",
      "platform.apiKeyName": "Nome da Chave API",
      "platform.apiKeyValue": "Valor da Chave API",
      "platform.addApiKey": "Adicionar Chave API",
      "platform.removeApiKey": "Remover",
      "platform.modelName": "Nome do Modelo / Caminho do Modelo",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Token Máximo",
      "inferenceSettings.stop": "Parar",
      "inferenceSettings.seed": "Seed",
      "inferenceSettings.checkSafety": "Verificar Segurança",
      "inferenceSettings.enableCache": "Habilitar Cache",
      "inferenceSettings.batchProcessing": "Processamento em lote",
      "apiKeyInstructions": "Para razões de segurança, defina suas chaves API como variáveis de ambiente. Siga {docLink} para mais informações.",
      "apiKeyInstructions.docLink": "este link",    
      "tab.simulate": "Simular",
      "simulate.simulateResponse": "Simular Resposta",
      "simulate.simulatedResponseText": "Texto de Resposta Simulado",
      "inferenceSettings.maxBudget": "Budget Máximo ($)",
      "inferenceSettings.selectedConfig": "Configuração selecionada: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Forçar Resposta JSON",
      "inferenceSettings.jsonModeNote": "Importante: Ao usar o modo JSON, você também deve instruir o modelo a produzir uma resposta JSON por si só usando uma mensagem do sistema ou do usuário. Sem isso, o modelo pode gerar uma sequência infinita de espaços em branco até que a geração atinja o limite de tokens, resultando em uma solicitação que parece 'bloquada'. Note também que o conteúdo da mensagem pode ser parcialmente truncado se finish_reason='length', o que significa que a geração excedeu max_tokens ou que a conversação excedeu o comprimento máximo do contexto.",  
      "saveConfig": "Salvar",
      "importConfig": "Importar",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Número de Capas GPU",
      "platform.gpuMemory": "Memoria GPU",
      "platform.inputContextLength": "Longitude do Contexto de Entrada",
    },
    pl: {
      "title": "LLM Connect",
      "instructions": "Skonfiguruj swoje ustawienia LLM Connect i prompt poniżej. {note}",
      "instructions.note": "\nUwaga: Modele wizyjne nie są obsługiwane.",
      "tab.prompt": "Prompt",
      "tab.platform": "Platforma",
      "tab.inferenceSettings": "Ustawienia inferencji",
      "prompt.selectField": "Wybierz pole prompt",
      "prompt.selectFieldOption": "Wybierz pole",
      "prompt.warningLabel": "Proszę wybrać pole prompt.",
      "prompt.useSystemPrompt": "Użyj systemowego prompta",
      "prompt.systemPrompt": "Systemowy prompt",
      "platform.select": "Wybierz platformę",
      "platform.selectOption": "Wybierz platformę",
      "platform.selectModel": "Wybierz model",
      "platform.selectModelOption": "Wybierz model",
      "platform.url": "URL",
      "platform.apiKey": "Klucz API",
      "platform.warningLabel": "Proszę wybrać platformę.",
      "platform.modelWarningLabel": "Proszę wybrać model.",
      "platform.useApiKey": "Użyj klucza API",
      "platform.apiKeyName": "Nazwa klucza API",
      "platform.apiKeyValue": "Wartość klucza API",
      "platform.addApiKey": "Dodaj klucz API",
      "platform.removeApiKey": "Usuń",
      "platform.modelName": "Nazwa modelu / Ścieżka modelu",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Maksymalna liczba tokenów",
      "inferenceSettings.stop": "Zatrzymaj",
      "inferenceSettings.seed": "Ziarno",
      "inferenceSettings.checkSafety": "Sprawdź bezpieczeństwo",
      "inferenceSettings.enableCache": "Włącz pamięć podręczną",
      "inferenceSettings.batchProcessing": "Przetwarzanie wsadowe",
      "apiKeyInstructions": "Dla względów bezpieczeństwa, zdefiniuj swoje klucze API jako zmienne środowiskowe. Postępuj zgodnie z {docLink} dla dalszych informacji.",
      "apiKeyInstructions.docLink": "tym linkiem",
      "inferenceSettings.maxBudget": "Budget Maksymalny ($)",
      "inferenceSettings.selectedConfig": "Wybrana konfiguracja: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Forçar Resposta JSON",
      "inferenceSettings.jsonModeNote": "Importante: Ao usar o modo JSON, você também deve instruir o modelo a produzir uma resposta JSON por si só usando uma mensagem do sistema ou do usuário. Sem isso, o modelo pode gerar uma sequência infinita de espaços em branco até que a geração atinja o limite de tokens, resultando em uma solicitação que parece 'bloquada'. Note também que o conteúdo da mensagem pode ser parcialmente truncado se finish_reason='length', o que significa que a geração excedeu max_tokens ou que a conversação excedeu o comprimento máximo do contexto.",  
      "saveConfig": "Salvar",
      "importConfig": "Importar",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Liczba Warstw GPU",
      "platform.gpuMemory": "Pamięć GPU",
      "platform.inputContextLength": "Długość Kontekstu Wejściowego",
    },
    cn: {
      "title": "LLM 连接",
      "instructions": "在下面配置您的 LLM 连接设置和提示。{note}",
      "instructions.note": "\n注意：视觉模型不受支持。",
      "tab.prompt": "提示",
      "tab.platform": "平台",
      "tab.inferenceSettings": "推理设置",
      "prompt.selectField": "选择提示字段",
      "prompt.selectFieldOption": "选择一个字段",
      "prompt.warningLabel": "请选择提示字段。",
      "prompt.useSystemPrompt": "使用系统提示",
      "prompt.systemPrompt": "系统提示",
      "platform.select": "选择平台",
      "platform.selectOption": "选择一个平台",
      "platform.selectModel": "选择模型",
      "platform.selectModelOption": "选择一个模型",
      "platform.url": "URL",
      "platform.apiKey": "API 密钥",
      "platform.warningLabel": "请选择一个平台。",
      "platform.modelWarningLabel": "请选择一个模型。",
      "platform.useApiKey": "使用 API 密钥",
      "platform.apiKeyName": "API 密钥名称",
      "platform.apiKeyValue": "API 密钥值",
      "platform.addApiKey": "添加 API 密钥",
      "platform.removeApiKey": "删除",
      "platform.modelName": "模型名称 / 模型路径",
      "inferenceSettings.temperature": "温度",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "最大令牌数",
      "inferenceSettings.stop": "停止",
      "inferenceSettings.seed": "种子",
      "inferenceSettings.checkSafety": "检查安全性",
      "inferenceSettings.enableCache": "启用缓存",
      "inferenceSettings.batchProcessing": "批处理",
      "apiKeyInstructions": "出于安全原因，请将您的 API 密钥定义为环境变量。请参阅 {docLink} 了解更多信息。",
      "apiKeyInstructions.docLink": "这个链接",
      "tab.simulate": "模拟",
      "simulate.simulateResponse": "模拟响应",
      "simulate.simulatedResponseText": "模拟响应文本",
      "inferenceSettings.maxBudget": "预算最大值 ($)",
      "inferenceSettings.selectedConfig": "选定配置: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Enforce JSON Response",
      "inferenceSettings.jsonModeNote": "重要：使用 JSON 模式时，模型还必须通过系统或用户消息指示自己生成 JSON。否则，模型可能会生成一个无限序列的空白，直到生成达到令牌限制或对话超过最大上下文长度，导致请求看起来‘卡住’。还要注意，如果 finish_reason='length'，则消息内容可能会被部分截断，这表示生成超过了 max_tokens 或对话超过了最大上下文长度。",  
      "saveConfig": "保存",
      "importConfig": "导入",
      "platform.gpuOffload": "GPU 卸载",
      "platform.nGpuLayers": "GPU 层数",
      "platform.gpuMemory": "GPU 内存",
      "platform.inputContextLength": "输入上下文长度",
    },
    ja: {
      "title": "LLM 接続",
      "instructions": "以下に LLM 接続設定とプロンプトを設定します。{note}",
      "instructions.note": "\n注意：ビジョンモデルはサポートされていません。",
      "tab.prompt": "プロンプト",
      "tab.platform": "プラットフォーム",
      "tab.inferenceSettings": "推論設定",
      "prompt.selectField": "プロンプトフィールドを選択",
      "prompt.selectFieldOption": "フィールドを選択",
      "prompt.warningLabel": "プロンプトフィールドを選択してください。",
      "prompt.useSystemPrompt": "システムプロンプトを使用",
      "prompt.systemPrompt": "システムプロンプト",
      "platform.select": "プラットフォームを選択",
      "platform.selectOption": "プラットフォームを選択",
      "platform.selectModel": "モデルを選択",
      "platform.selectModelOption": "モデルを選択",
      "platform.url": "URL",
      "platform.apiKey": "API キー",
      "platform.warningLabel": "プラットフォームを選択してください。",
      "platform.modelWarningLabel": "モデルを選択してください。",
      "platform.useApiKey": "API キーを使用",
      "platform.apiKeyName": "API キー名",
      "platform.apiKeyValue": "API キー値",
      "platform.addApiKey": "API キーを追加",
      "platform.removeApiKey": "削除",
      "platform.modelName": "モデル名 / モデルパス", 
      "inferenceSettings.temperature": "温度",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "最大トークン数",
      "inferenceSettings.stop": "停止",
      "inferenceSettings.seed": "シード",
      "inferenceSettings.checkSafety": "セキュリティを確認",
      "inferenceSettings.enableCache": "キャッシュを有効",
      "inferenceSettings.batchProcessing": "バッチ処理",
      "apiKeyInstructions": "セキュリティのため、API キーを環境変数として定義してください。詳細は {docLink} を参照してください。",
      "apiKeyInstructions.docLink": "このリンク",
      "tab.simulate": "シミュレート",
      "simulate.simulateResponse": "シミュレートされた応答",
      "simulate.simulatedResponseText": "シミュレートされた応答テキスト",
      "inferenceSettings.maxBudget": "予算最大値 ($)",
      "inferenceSettings.selectedConfig": "選択された構成: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Enforce JSON Response",
      "inferenceSettings.jsonModeNote": "重要：使用 JSON 模式时，模型还必须通过系统或用户消息指示自己生成 JSON。否则，模型可能会生成一个无限序列的空白，直到生成达到令牌限制或对话超过最大上下文长度，导致请求看起来‘卡住’。还要注意，如果 finish_reason='length'，则消息内容可能会被部分截断，这表示生成超过了 max_tokens 或对话超过了最大上下文长度。",  
      "saveConfig": "保存",
      "importConfig": "导入",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "GPU 层数",
      "platform.gpuMemory": "GPU 内存",
      "platform.inputContextLength": "输入上下文长度",
    },
    ru: {
      "title": "LLM Connect",
      "instructions": "Настройте свои настройки LLM Connect и промпт ниже. {note}",
      "instructions.note": "\nПримечание: Визуальные модели не поддерживаются.",
      "tab.prompt": "Промпт",
      "tab.platform": "Платформа",
      "tab.inferenceSettings": "Настройки инференса",
      "prompt.selectField": "Выберите поле промпта",
      "prompt.selectFieldOption": "Выберите поле",
      "prompt.warningLabel": "Пожалуйста, выберите поле промпта.",
      "prompt.useSystemPrompt": "Использовать системный промпт",
      "prompt.systemPrompt": "Системный промпт",
      "platform.select": "Выберите платформу",
      "platform.selectOption": "Выберите платформу",
      "platform.selectModel": "Выберите модель",
      "platform.selectModelOption": "Выберите модель",
      "platform.url": "URL",
      "platform.apiKey": "API-ключ",
      "platform.warningLabel": "Пожалуйста, выберите платформу.",
      "platform.modelWarningLabel": "Пожалуйста, выберите модель.",
      "platform.useApiKey": "Использовать API-ключ",
      "platform.apiKeyName": "Имя API-ключа",
      "platform.apiKeyValue": "Значение API-ключа",
      "platform.addApiKey": "Добавить API-ключ",
      "platform.removeApiKey": "Удалить",
      "platform.modelName": "Имя модели / Путь модели",
      "inferenceSettings.temperature": "Температура",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Максимальное количество токенов",
      "inferenceSettings.stop": "Стоп",
      "inferenceSettings.seed": "Сид",
      "inferenceSettings.checkSafety": "Проверить безопасность",
      "inferenceSettings.enableCache": "Включить кэш",
      "inferenceSettings.batchProcessing": "Пакетная обработка",
      "apiKeyInstructions": "Для безопасности, определите ваши API-ключи как переменные окружения. Подробнее см. {docLink}.",
      "apiKeyInstructions.docLink": "этот URL",
      "tab.simulate": "Симуляция",
      "simulate.simulateResponse": "Симулировать ответ",
      "simulate.simulatedResponseText": "Текст симулированного ответа",
      "inferenceSettings.maxBudget": "Максимальный бюджет ($)",
      "inferenceSettings.selectedConfig": "Выбранная конфигурация: {platform} - {model}",
      "inferenceSettings.enforceJsonResponse": "Enforce JSON Response",
      "inferenceSettings.jsonModeNote": "Важно: При использовании режима JSON модель также должна самостоятельно указать, чтобы она генерировала JSON с помощью системного или пользовательского сообщения. В противном случае модель может генерировать бесконечную последовательность пробелов, пока генерация не достигнет ограничения токенов или диалог не превысит максимальную длину контекста, что может привести к кажущейся 'замороженной' запросу. Также обратите внимание, что содержимое сообщения может быть частично обрезано, если finish_reason='length', что означает, что генерация превысила ограничение токенов или диалог превысил максимальную длину контекста.",  
      "saveConfig": "Сохранить",
      "importConfig": "Импортировать",
      "platform.gpuOffload": "GPU Offload",
      "platform.nGpuLayers": "Число GPU-слоев",
      "platform.gpuMemory": "Память GPU",
      "platform.inputContextLength": "Длина входного контекста",
    },          
  };

  return (
    <IntlProvider messages={messages.en} locale="en" defaultLocale="en">
      <DesignerApi messages={messages} defaultConfig={defaultConfig}>
        <AyxAppWrapper> 
          <App />
        </AyxAppWrapper>
      </DesignerApi>
    </IntlProvider>
  )
}

ReactDOM.render(
  <Tool />,
  document.getElementById('app')
);

// (async () => {
//   console.log(await JsEvent('GetInputData', { anchorIndex: 0, connectionName: '' }))
// })();