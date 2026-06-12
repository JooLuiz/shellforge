import { useEffect, useId, useState } from "react";
import type { FlowValidationSeverity } from "../../utils/flowValidationUtils";
import { getFieldBlockClassName } from "../../utils/flowValidationUtils";
import { validateBrowserProfileKey } from "../../utils/browserProfileValidation";

interface BrowserProfileComboboxProps {
  validationSeverity?: FlowValidationSeverity;
  value: string;
  updateBrowserProfile: (nextProfile: string) => void;
}

export function BrowserProfileCombobox({
  validationSeverity,
  value,
  updateBrowserProfile,
}: BrowserProfileComboboxProps): JSX.Element {
  const datalistId = useId();
  const [draftProfile, setDraftProfile] = useState(value);
  const [profileOptions, setProfileOptions] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDraftProfile(value);
  }, [value]);

  useEffect(() => {
    let isCancelled = false;

    void window.api.browserProfiles.list().then((nextProfileOptions) => {
      if (!isCancelled) {
        setProfileOptions(nextProfileOptions);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const commitProfile = (nextProfile: string): void => {
    const validationMessage = validateBrowserProfileKey(nextProfile);
    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    setValidationError(null);
    updateBrowserProfile(nextProfile.trim());
  };

  return (
    <div
      className={getFieldBlockClassName(
        "browser-profile-combobox",
        validationSeverity,
      )}
    >
      <label className="browser-profile-combobox-label" htmlFor={`${datalistId}-input`}>
        Browser profile
      </label>
      <input
        id={`${datalistId}-input`}
        className="browser-profile-combobox-input"
        list={datalistId}
        value={draftProfile}
        placeholder="None"
        onChange={(event) => {
          setDraftProfile(event.target.value);
          if (validationError) {
            setValidationError(null);
          }
        }}
        onBlur={() => commitProfile(draftProfile)}
        aria-label="Browser profile"
        aria-invalid={validationError !== null}
      />
      <datalist id={datalistId}>
        {profileOptions.map((profileOption) => (
          <option key={profileOption} value={profileOption} />
        ))}
      </datalist>
      {validationError ? (
        <span className="browser-profile-combobox-error">{validationError}</span>
      ) : null}
    </div>
  );
}
