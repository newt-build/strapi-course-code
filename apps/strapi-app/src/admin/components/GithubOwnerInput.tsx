import * as React from 'react';

type MessageDescriptor = {
  id: string;
  defaultMessage: string;
};

type GithubOwnerInputProps = {
  attribute: {
    type: string;
  };
  description?: MessageDescriptor;
  disabled?: boolean;
  error?: string | MessageDescriptor;
  intlLabel: MessageDescriptor;
  name: string;
  onChange: (event: { target: { name: string; type: string; value: string } }) => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
};

const normalizeOwner = (value: string) =>
  value
    .trim()
    .replace(/^https:\/\/github.com\//i, '')
    .replace(/^@/, '')
    .split('/')[0];

const isMessageDescriptor = (message: unknown): message is MessageDescriptor =>
  typeof message === 'object' && message !== null && 'id' in message && 'defaultMessage' in message;

const GithubOwnerInput = React.forwardRef<HTMLInputElement, GithubOwnerInputProps>((props, ref) => {
  const { attribute, description, disabled, error, intlLabel, name, onChange, placeholder, required, value } = props;

  const formattedError = isMessageDescriptor(error) ? error.defaultMessage : error;
  const formattedDescription = description?.defaultMessage;
  const hint = formattedError ?? formattedDescription;

  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ color: '#32324d', fontSize: 12, fontWeight: 600 }}>
        {intlLabel.defaultMessage}
        {required ? ' *' : null}
      </span>
      <input
        ref={ref}
        aria-describedby={hint ? `${name}-hint` : undefined}
        aria-invalid={Boolean(formattedError)}
        disabled={disabled}
        name={name}
        onBlur={(event) => {
          const normalizedValue = normalizeOwner(event.currentTarget.value);

          onChange({
            target: {
              name,
              type: attribute.type,
              value: normalizedValue,
            },
          });
        }}
        onChange={(event) => {
          onChange({
            target: {
              name,
              type: attribute.type,
              value: event.currentTarget.value,
            },
          });
        }}
        placeholder={placeholder ?? 'octocat'}
        style={{
          background: disabled ? '#f6f6f9' : '#ffffff',
          border: `1px solid ${formattedError ? '#d02b20' : '#dcdce4'}`,
          borderRadius: 4,
          color: '#32324d',
          fontSize: 14,
          lineHeight: '20px',
          minHeight: 40,
          outline: 'none',
          padding: '9px 12px',
        }}
        value={value ?? ''}
      />
      {hint ? (
        <span id={`${name}-hint`} style={{ color: formattedError ? '#d02b20' : '#666687', fontSize: 12 }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
});

GithubOwnerInput.displayName = 'GithubOwnerInput';

export default GithubOwnerInput;
