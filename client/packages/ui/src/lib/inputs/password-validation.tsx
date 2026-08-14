import { Checkbox } from '@healthalst/ui/components/checkbox';

interface PasswordValidationProps {
  password: string;
}

interface RuleItem {
  met: boolean;
  label: string;
}

export function PasswordValidation({ password }: PasswordValidationProps) {
  const rules: RuleItem[] = [
    {
      met: password.length >= 8,
      label: 'Password should be at least 8 characters long',
    },
    {
      met: /[A-Z]/.test(password),
      label: 'Password should contain at least one letter',
    },
    {
      met: /\d/.test(password),
      label: 'Password should contain at least one number',
    },
    {
      met: /[#$%&@^]/.test(password),
      label: 'Password should contain at least one special character (@#$%^&)',
    },
  ];

  return (
    <div className="mt-2 space-y-2">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-2">
          <Checkbox
            checked={rule.met}
            disabled
            className="rounded-full pointer-events-none"
          />
          <span className="text-foreground-muted text-xs">{rule.label}</span>
        </div>
      ))}
    </div>
  );
}

export type { PasswordValidationProps };
