import type { ComponentType } from 'react';
import { ThemeConfigEditor } from './ThemeConfigEditor';

/**
 * Registry of custom editors keyed by the `customEditor` field on
 * SchemaDescriptor. MdmsResourceEdit consults this map; when a key is set
 * and resolves, the generic form is bypassed in favor of the custom one.
 *
 * Keep this map tiny — custom editors are the exception, not the rule.
 * Every schema that can be served by the descriptor + widget system should
 * stay on that path.
 */
export const customEditors: Record<string, ComponentType> = {
  'theme-config': ThemeConfigEditor,
};

export { ThemeConfigEditor };
