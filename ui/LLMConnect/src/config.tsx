import yaml from 'js-yaml';

export interface Platform {
  name: string;
  models: string[];
  api_url: string;
  doc_url: string;
}

export interface Config {
  supported_platforms: Platform[];
}

// Default empty config
const defaultConfig: Config = {
  supported_platforms: []
};

// Cache for loaded config
let cachedConfig: Config | null = null;

/**
 * Load config from YAML file at runtime
 * This allows modifying config.yaml after the build
 */
export async function loadConfig(): Promise<Config> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('./config.yaml');
    if (!response.ok) {
      console.error('Failed to load config.yaml:', response.statusText);
      return defaultConfig;
    }
    const yamlText = await response.text();
    cachedConfig = yaml.load(yamlText) as Config;
    return cachedConfig;
  } catch (error) {
    console.error('Error loading config.yaml:', error);
    return defaultConfig;
  }
}

/**
 * Get cached config synchronously (returns null if not loaded yet)
 */
export function getConfig(): Config | null {
  return cachedConfig;
}

/**
 * Clear cached config to force reload
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}
