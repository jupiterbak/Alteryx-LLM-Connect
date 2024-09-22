import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { AyxAppWrapper, Box, Tabs, Tab, Typography, makeStyles, Theme, Grid, NativeSelect, TextField, Checkbox, FormControlLabel, FormGroup, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@alteryx/ui';
import { Alteryx, Delete as DeleteIcon, Plus as AddIcon } from '@alteryx/icons';
import { Context as UiSdkContext, DesignerApi, JsEvent } from '@alteryx/react-comms';
import { IntlProvider, FormattedMessage } from 'react-intl';
import { config, Platform } from './config';

const DEFAULT_PLATFORM = "OpenAI"
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
//const DEFAULT_API_KEYS = [{ key: "OPENAI_API_KEY", value: "<yourkey>" }];
const DEFAULT_MODEL = "gpt-3.5-turbo"
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

// Mock field names for the dropdown
const fieldNames = ['', 'Field1', 'Field2', 'Field3', 'Prompt'];

// Extract supported platforms, models, and API URLs
const platformConfig = config.supported_platforms.reduce((acc, platform) => {
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
}));

const App = async () => {
  const classes = useStyles();
  const [model, handleUpdateModel] = useContext(UiSdkContext);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  const val = await JsEvent(UiSdkContext,'FileBrowse', {});
  console.log(val);

  // Dev Harness Specific Code ---------- Start
  // The following code is specifically a dev harness functionality.
  // If you're developing a tool for Designer, you'll want to remove this
  // and check out our docs for guidance 
  useEffect(() => {
    handleUpdateModel(model)
  }, []);
  // Dev Harness Specific Code ---------- End

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

  const handlePlatformChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedPlatform = event.target.value as string;
    handleUpdateModel({
      ...model,
      Configuration: {
        ...model.Configuration,
        platform: selectedPlatform,
        endpoint: platformConfig[selectedPlatform]?.apiUrl || '',
        model: '' // Reset model when platform changes
      }
    });
    setSelectedPlatform(config.supported_platforms.find(p => p.name === selectedPlatform) || null);
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

  return (
    <Grid container className={classes.root} direction="column" spacing={2} >
      <Grid item xs={12}>
        <Typography variant="h4" className={classes.title}>
          <FormattedMessage id="title" defaultMessage="LLM Connect" />
        </Typography>
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
                fullWidth
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
                className={classes.textField}
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
              >
                <option value="">
                  <FormattedMessage id="platform.selectOption" defaultMessage="Select a platform" />
                </option>
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
            <Grid item xs={12}>
              <TextField
                label={<FormattedMessage id="platform.url" defaultMessage="URL" />}
                value={model.Configuration.endpoint || ''}
                onChange={handleEndpointChange}
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12}>
              {model.Configuration.platform !== "Others (Custom)" && (
                <Typography variant="subtitle1">
                  <FormattedMessage id="platform.selectModel" defaultMessage="Select Model" />
                </Typography>
              )}
              {model.Configuration.platform === "Others (Custom)" ? (
                <TextField
                  label={<FormattedMessage id="platform.modelName" defaultMessage="Model Name" />}
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
                >
                  <option value="">
                    <FormattedMessage id="platform.selectModelOption" defaultMessage="Select a model" />
                  </option>
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
            {model.Configuration.useApiKey === "1" && (
              <Grid item xs={12}>
                <TableContainer component={Paper} className={classes.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><FormattedMessage id="platform.apiKeyName" defaultMessage="API Key Name" /></TableCell>
                        <TableCell><FormattedMessage id="platform.apiKeyValue" defaultMessage="API Key Value" /></TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(model.Configuration.apiKeys || []).map((apiKey, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              value={apiKey.key}
                              onChange={handleAPIKeyChange(index, 'key')}
                              fullWidth
                              disabled
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={apiKey.value}
                              onChange={handleAPIKeyChange(index, 'value')}
                              fullWidth
                              type="password"
                              disabled
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => removeApiKey(index)} size="small" disabled>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addApiKey}
                  color="primary"
                  className={classes.addButton}
                  disabled
                >
                  <FormattedMessage id="platform.addApiKey" defaultMessage="Add API Key" />
                </Button>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">
                <FormattedMessage
                  id="apiKeyInstructions"
                  defaultMessage="For security reasons, please define your API Keys as environment variables. Follow {docLink} for more information."
                  values={{
                    docLink: (
                      <a href={selectedPlatform?.doc_url || '#'} target="_blank" rel="noopener noreferrer">
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
          </Grid>
        )}
        {activeTab === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.temperature" defaultMessage="Temperature" />}
                type="number"
                value={model.Configuration.temperature ?? DEFAULT_TEMPERATURE}
                onChange={handleTemperatureChange('temperature')}
                fullWidth
                className={classes.textField}
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
                className={classes.textField}
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
                className={classes.textField}
                inputProps={{ step: 1, min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.stop" defaultMessage="Stop" />}
                value={model.Configuration.stop ?? DEFAULT_STOP}
                onChange={handleStopChange}
                fullWidth
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<FormattedMessage id="inferenceSettings.seed" defaultMessage="Seed" />}
                type="number"
                value={model.Configuration.seed ?? DEFAULT_SEED}
                onChange={handleSeedChange('seed')}
                fullWidth
                className={classes.textField}
                inputProps={{ step: 1, min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
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
              </FormGroup>
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
      useSystemPrompt: USE_SYSTEM_PROMPT 
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
      "platform.modelName": "Model Name",
      "inferenceSettings.temperature": "Temperature",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Max Token",
      "inferenceSettings.stop": "Stop",
      "inferenceSettings.seed": "Seed",
      "inferenceSettings.checkSafety": "Check Safety",
      "inferenceSettings.enableCache": "Enable Cache",
      "apiKeyInstructions": "For security reasons, please define your API Keys as environment variables. Follow {docLink} for more information.",
      "apiKeyInstructions.docLink": "this link",
    },
    es: {
      "title": "Conexión LLM",
      "instructions": "Configure los ajustes de conexión LLM y el prompt a continuación. {note}",
      "instructions.note": "\nNota: Los modelos de visión no son compatibles.",
      "tab.prompt": "Prompt",
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
      "platform.modelName": "Nombre del Modelo",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Token Máximo",
      "inferenceSettings.stop": "Parar",
      "inferenceSettings.seed": "Semilla",
      "inferenceSettings.checkSafety": "Verificar Seguridad",
      "inferenceSettings.enableCache": "Habilitar Caché",
      "apiKeyInstructions": "Por razones de seguridad, defina sus claves API como variables de entorno. Siga {docLink} para más información.",
      "apiKeyInstructions.docLink": "este enlace",
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
      "platform.modelName": "Nom du Modèle",
      "inferenceSettings.temperature": "Temperatura",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Token Maximum",
      "inferenceSettings.stop": "Arrêt",
      "inferenceSettings.seed": "Graine",
      "inferenceSettings.checkSafety": "Vérifier la Sécurité",
      "inferenceSettings.enableCache": "Activer le Cache",
      "apiKeyInstructions": "Pour des raisons de sécurité, veuillez définir vos clés API comme variables d'environnement. Suivez {docLink} pour plus d'informations.",
      "apiKeyInstructions.docLink": "ce lien",
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
      "platform.modelName": "Modellname",
      "inferenceSettings.temperature": "Temperatur",
      "inferenceSettings.topP": "Top P",
      "inferenceSettings.maxToken": "Max Token",
      "inferenceSettings.stop": "Stopp",
      "inferenceSettings.seed": "Seed",
      "inferenceSettings.checkSafety": "Sicherheit Prüfen",
      "inferenceSettings.enableCache": "Cache Aktivieren",
      "apiKeyInstructions": "Aus Sicherheitsgründen definieren Sie bitte Ihre API-Schlüssel als Umgebungsvariablen. Folgen Sie {docLink} für weitere Informationen.",
      "apiKeyInstructions.docLink": "diesem Link",
    }
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
