import { useMemo } from 'react';
import { useGetList, type Validator } from 'ra-core';

export interface MobileRules {
  pattern: string;
  minLength: number;
  maxLength: number;
  errorMessage: string;
  prefix?: string;
}

// Kenya default — matches the ValidationConfigs.mobileNumberValidation MDMS
// record seeded at tenant `ke`. Used if the MDMS fetch fails or returns empty.
const FALLBACK: MobileRules = {
  pattern: '^0?[17][0-9]{8}$',
  minLength: 9,
  maxLength: 10,
  prefix: '+254',
  errorMessage:
    'Enter a valid Kenyan mobile: 9 digits starting with 1 or 7, or 10 digits starting with 07 / 01',
};

function parseRules(record: Record<string, unknown> | undefined): MobileRules {
  if (!record) return FALLBACK;
  const raw = record.rules as Record<string, unknown> | undefined;
  if (!raw) return FALLBACK;
  return {
    pattern: typeof raw.pattern === 'string' ? raw.pattern : FALLBACK.pattern,
    minLength:
      typeof raw.minLength === 'number' ? raw.minLength : FALLBACK.minLength,
    maxLength:
      typeof raw.maxLength === 'number' ? raw.maxLength : FALLBACK.maxLength,
    prefix: typeof raw.prefix === 'string' ? raw.prefix : FALLBACK.prefix,
    errorMessage:
      typeof raw.errorMessage === 'string' && raw.errorMessage
        ? raw.errorMessage
        : FALLBACK.errorMessage,
  };
}

export interface UseMobileValidatorResult {
  rules: MobileRules;
  validator: Validator;
  isLoading: boolean;
}

export function useMobileValidator(): UseMobileValidatorResult {
  const { data, isLoading } = useGetList('mobile-validation', {
    pagination: { page: 1, perPage: 20 },
    sort: { field: 'validationName', order: 'ASC' },
  });

  const rules = useMemo<MobileRules>(() => {
    if (!data || data.length === 0) return FALLBACK;
    const preferred =
      data.find(
        (r) =>
          (r as Record<string, unknown>).validationName ===
          'defaultMobileValidation',
      ) ?? data[0];
    return parseRules(preferred as Record<string, unknown>);
  }, [data]);

  const validator = useMemo<Validator>(() => {
    let compiled: RegExp | null = null;
    try {
      compiled = new RegExp(rules.pattern);
    } catch {
      compiled = null;
    }
    return (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return 'Required';
      }
      const s = String(value);
      if (s.length < rules.minLength || s.length > rules.maxLength) {
        return rules.errorMessage;
      }
      if (compiled && !compiled.test(s)) {
        return rules.errorMessage;
      }
      return undefined;
    };
  }, [rules]);

  return { rules, validator, isLoading };
}
