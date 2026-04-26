import { useState } from "react";

const FIELD_META = {
  koi_period:       { label: "KOI Period",         unit: "days",   tooltip: "Orbital period of the planet candidate in days. Time for one full orbit around the host star." },
  koi_duration:     { label: "KOI Duration",        unit: "hrs",    tooltip: "Duration of the transit event in hours. How long the planet takes to cross the stellar disk." },
  koi_depth:        { label: "KOI Depth",           unit: "ppm",    tooltip: "Depth of the transit in parts-per-million. Fractional decrease in stellar flux during transit." },
  koi_impact:       { label: "Impact Parameter",    unit: "",       tooltip: "Sky-projected distance between planet and stellar center at conjunction, normalized by stellar radius." },
  koi_model_snr:    { label: "Model SNR",           unit: "",       tooltip: "Signal-to-noise ratio of the transit model fit. Higher values indicate more confident detections." },
  koi_num_transits: { label: "Num Transits",        unit: "",       tooltip: "Number of observed transit events in the Kepler light curve used for this analysis." },
  koi_ror:          { label: "Radius Ratio",        unit: "Rp/Rs",  tooltip: "Planet-to-star radius ratio. Square root of the transit depth (Rp/Rs)." },
  st_teff:          { label: "Stellar T_eff",       unit: "K",      tooltip: "Effective temperature of the host star in Kelvin. Determines stellar spectral type." },
  st_logg:          { label: "Stellar log(g)",      unit: "cgs",    tooltip: "Stellar surface gravity (log base 10 in CGS units). Indicator of stellar evolutionary stage." },
  st_met:           { label: "Metallicity [Fe/H]",  unit: "dex",    tooltip: "Stellar metallicity relative to solar, expressed as log ratio of iron to hydrogen abundance." },
  st_mass:          { label: "Stellar Mass",        unit: "M☉",     tooltip: "Mass of the host star in units of solar masses." },
  st_radius:        { label: "Stellar Radius",      unit: "R☉",     tooltip: "Radius of the host star in units of solar radii." },
  st_dens:          { label: "Stellar Density",     unit: "g/cm³",  tooltip: "Mean density of the host star in grams per cubic centimeter." },
  teff_err1:        { label: "T_eff Err (+)",       unit: "K",      tooltip: "Upper uncertainty on the stellar effective temperature in Kelvin." },
  teff_err2:        { label: "T_eff Err (−)",       unit: "K",      tooltip: "Lower uncertainty on the stellar effective temperature (typically negative) in Kelvin." },
  logg_err1:        { label: "log(g) Err (+)",      unit: "",       tooltip: "Upper uncertainty on the stellar surface gravity log(g)." },
  logg_err2:        { label: "log(g) Err (−)",      unit: "",       tooltip: "Lower uncertainty on the stellar surface gravity log(g) (typically negative)." },
  feh_err1:         { label: "[Fe/H] Err (+)",      unit: "dex",    tooltip: "Upper uncertainty on the stellar metallicity [Fe/H] in dex." },
  feh_err2:         { label: "[Fe/H] Err (−)",      unit: "dex",    tooltip: "Lower uncertainty on the stellar metallicity [Fe/H] (typically negative) in dex." },
  mass_err1:        { label: "Mass Err (+)",        unit: "M☉",     tooltip: "Upper uncertainty on stellar mass in solar masses." },
  mass_err2:        { label: "Mass Err (−)",        unit: "M☉",     tooltip: "Lower uncertainty on stellar mass in solar masses (typically negative)." },
  radius_err1:      { label: "Radius Err (+)",      unit: "R☉",     tooltip: "Upper uncertainty on stellar radius in solar radii." },
  radius_err2:      { label: "Radius Err (−)",      unit: "R☉",     tooltip: "Lower uncertainty on stellar radius in solar radii (typically negative)." },
};

const GROUPS = [
  {
    title: "Orbital Parameters",
    color: "#4ab8ff",
    fields: ["koi_period", "koi_duration", "koi_depth", "koi_impact", "koi_model_snr", "koi_num_transits", "koi_ror"],
  },
  {
    title: "Stellar Properties",
    color: "#ff9d4a",
    fields: ["st_teff", "st_logg", "st_met", "st_mass", "st_radius", "st_dens"],
  },
  {
    title: "Measurement Uncertainties",
    color: "#a78bff",
    fields: ["teff_err1", "teff_err2", "logg_err1", "logg_err2", "feh_err1", "feh_err2", "mass_err1", "mass_err2", "radius_err1", "radius_err2"],
  },
];

function FieldInput({ fieldKey, value, onChange, error }) {
  const meta = FIELD_META[fieldKey];
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div style={styles.fieldWrap}>
      <div style={styles.labelRow}>
        <label style={styles.label} htmlFor={fieldKey}>{meta.label}</label>
        <div
          style={styles.tooltipWrap}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          <span style={styles.infoIcon}>?</span>
          {tooltipVisible && (
            <div style={styles.tooltip} role="tooltip">
              <strong style={{ color: "#00e5ff" }}>{meta.label}</strong>
              {meta.unit && <span style={styles.tooltipUnit}> [{meta.unit}]</span>}
              <br />{meta.tooltip}
            </div>
          )}
        </div>
      </div>
      <div style={styles.inputWrap}>
        <input
          id={fieldKey}
          name={fieldKey}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
          placeholder="0.000"
          aria-describedby={error ? `${fieldKey}-err` : undefined}
          aria-invalid={!!error}
        />
        {meta.unit && <span style={styles.unitBadge}>{meta.unit}</span>}
      </div>
      {error && (
        <p id={`${fieldKey}-err`} style={styles.errorMsg} role="alert">{error}</p>
      )}
    </div>
  );
}

export default function PredictionForm({ values, setValues, errors, setErrors }) {
  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div style={styles.formRoot}>
      {GROUPS.map((group) => (
        <div key={group.title} style={styles.group}>
          <div style={styles.groupHeader}>
            <div style={{ ...styles.groupDot, background: group.color, boxShadow: `0 0 8px ${group.color}88` }} />
            <h3 style={{ ...styles.groupTitle, color: group.color }}>{group.title}</h3>
          </div>
          <div style={styles.grid}>
            {group.fields.map((key) => (
              <FieldInput
                key={key}
                fieldKey={key}
                value={values[key]}
                onChange={handleChange}
                error={errors[key]}
              />
            ))}
          </div>
        </div>
      ))}
      <style>{inputCSS}</style>
    </div>
  );
}

const inputCSS = `
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  input:focus { outline: none; border-color: rgba(0,229,255,0.6) !important; box-shadow: 0 0 0 3px rgba(0,229,255,0.12), 0 0 16px rgba(0,229,255,0.08) !important; }
  input:hover { border-color: rgba(74,184,255,0.35) !important; }
`;

const styles = {
  formRoot: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  group: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  groupDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  groupTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    position: "relative",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "0.7rem",
    color: "#5a9bbf",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "calc(100% - 20px)",
  },
  tooltipWrap: {
    position: "relative",
    flexShrink: 0,
  },
  infoIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "1px solid rgba(74,184,255,0.4)",
    color: "#4ab8ff",
    fontSize: "0.6rem",
    fontWeight: 700,
    cursor: "help",
    lineHeight: 1,
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    right: 0,
    width: "220px",
    background: "rgba(4,20,40,0.98)",
    border: "1px solid rgba(0,229,255,0.25)",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "0.72rem",
    color: "#9bc8e8",
    lineHeight: 1.5,
    zIndex: 100,
    boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(0,229,255,0.08)",
    pointerEvents: "none",
  },
  tooltipUnit: {
    color: "#ff9d4a",
    fontSize: "0.68rem",
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    width: "100%",
    background: "rgba(0,20,50,0.6)",
    border: "1px solid rgba(0,100,200,0.2)",
    borderRadius: "8px",
    padding: "8px 10px",
    color: "#d0ecff",
    fontSize: "0.82rem",
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 500,
    transition: "border-color 0.2s, box-shadow 0.2s",
    WebkitAppearance: "none",
  },
  inputError: {
    borderColor: "rgba(255,80,80,0.5) !important",
    boxShadow: "0 0 0 2px rgba(255,80,80,0.1)",
  },
  unitBadge: {
    position: "absolute",
    right: "6px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "0.6rem",
    color: "#2a6080",
    pointerEvents: "none",
    letterSpacing: "0.03em",
  },
  errorMsg: {
    fontSize: "0.65rem",
    color: "#ff6b6b",
    marginTop: "1px",
    fontWeight: 500,
  },
};
