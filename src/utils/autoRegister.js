import { componentConfigs } from '../config/componentConfigs';
import { urlManager } from './urlManager';

export const autoRegisterComponents = () => {
  Object.entries(componentConfigs).forEach(([componentName, config]) => {
    urlManager.registerComponent(config.id, config);
  });
};