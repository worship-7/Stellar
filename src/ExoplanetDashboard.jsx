import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ─── Constants ─────────────────────────────────────────────────────────────────
const REFERENCE_RADIUS = 2.26;

const FIELD_META = {
  koi_period:       { label: "KOI Period",         unit: "days",   group: "orbital",  tooltip: "Orbital period of the planet candidate in days. Time for one full orbit around the host star." },
  koi_duration:     { label: "KOI Duration",        unit: "hrs",    group: "orbital",  tooltip: "Duration of the transit event in hours. How long the planet takes to cross the stellar disk." },
  koi_depth:        { label: "KOI Depth",           unit: "ppm",    group: "orbital",  tooltip: "Depth of the transit in parts-per-million. Fractional decrease in stellar flux during transit." },
  koi_impact:       { label: "Impact Param",        unit: "",       group: "orbital",  tooltip: "Sky-projected distance between planet center and stellar center at conjunction, normalized by stellar radius." },
  koi_model_snr:    { label: "Model SNR",           unit: "",       group: "orbital",  tooltip: "Signal-to-noise ratio of the transit model fit. Higher values indicate more confident detections." },
  koi_num_transits: { label: "Num Transits",        unit: "",       group: "orbital",  tooltip: "Number of observed transit events in the Kepler light curve used for this analysis." },
  koi_ror:          { label: "Radius Ratio",        unit: "Rp/Rs",  group: "orbital",  tooltip: "Planet-to-star radius ratio (Rp/Rs). Related to the square root of the transit depth." },
  st_teff:          { label: "Stellar T_eff",       unit: "K",      group: "stellar",  tooltip: "Effective temperature of the host star in Kelvin. Determines the stellar spectral type (e.g., G, K, M)." },
  st_logg:          { label: "Stellar log(g)",      unit: "cgs",    group: "stellar",  tooltip: "Stellar surface gravity (log base 10 in CGS). An indicator of the stellar evolutionary stage." },
  st_met:           { label: "Metallicity",         unit: "dex",    group: "stellar",  tooltip: "Stellar metallicity [Fe/H] relative to solar, expressed as log ratio of iron to hydrogen abundance." },
  st_mass:          { label: "Stellar Mass",        unit: "M☉",     group: "stellar",  tooltip: "Mass of the host star in units of solar masses (M☉)." },
  st_radius:        { label: "Stellar Radius",      unit: "R☉",     group: "stellar",  tooltip: "Radius of the host star in units of solar radii (R☉)." },
  st_dens:          { label: "Stellar Density",     unit: "g/cm³",  group: "stellar",  tooltip: "Mean density of the host star in grams per cubic centimeter." },
  teff_err1:        { label: "T_eff Err (+)",       unit: "K",      group: "errors",   tooltip: "Upper (positive) uncertainty on the stellar effective temperature in Kelvin." },
  teff_err2:        { label: "T_eff Err (−)",       unit: "K",      group: "errors",   tooltip: "Lower (negative) uncertainty on the stellar effective temperature in Kelvin." },
  logg_err1:        { label: "log(g) Err (+)",      unit: "",       group: "errors",   tooltip: "Upper uncertainty on the stellar surface gravity log(g)." },
  logg_err2:        { label: "log(g) Err (−)",      unit: "",       group: "errors",   tooltip: "Lower (negative) uncertainty on the stellar surface gravity log(g)." },
  feh_err1:         { label: "[Fe/H] Err (+)",      unit: "dex",    group: "errors",   tooltip: "Upper uncertainty on the stellar metallicity [Fe/H] in dex." },
  feh_err2:         { label: "[Fe/H] Err (−)",      unit: "dex",    group: "errors",   tooltip: "Lower (negative) uncertainty on the stellar metallicity [Fe/H] in dex." },
  mass_err1:        { label: "Mass Err (+)",        unit: "M☉",     group: "errors",   tooltip: "Upper uncertainty on stellar mass in solar masses." },
  mass_err2:        { label: "Mass Err (−)",        unit: "M☉",     group: "errors",   tooltip: "Lower (negative) uncertainty on stellar mass in solar masses." },
  radius_err1:      { label: "Radius Err (+)",      unit: "R☉",     group: "errors",   tooltip: "Upper uncertainty on stellar radius in solar radii." },
  radius_err2:      { label: "Radius Err (−)",      unit: "R☉",     group: "errors",   tooltip: "Lower (negative) uncertainty on stellar radius in solar radii." },
};

const GROUPS = [
  { key: "orbital", title: "Orbital Parameters",          color: "#4ab8ff", fields: ["koi_period","koi_duration","koi_depth","koi_impact","koi_model_snr","koi_num_transits","koi_ror"] },
  { key: "stellar", title: "Stellar Properties",          color: "#ffb74a", fields: ["st_teff","st_logg","st_met","st_mass","st_radius","st_dens"] },
  { key: "errors",  title: "Measurement Uncertainties",   color: "#b48bff", fields: ["teff_err1","teff_err2","logg_err1","logg_err2","feh_err1","feh_err2","mass_err1","mass_err2","radius_err1","radius_err2"] },
];

const INITIAL_VALUES = Object.fromEntries(Object.keys(FIELD_META).map(k => [k, ""]));

// ─── Tooltip Component ─────────────────────────────────────────────────────────
function FieldTooltip({ fieldKey }) {
  const [visible, setVisible] = useState(false);
  const meta = FIELD_META[fieldKey];
  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span style={s.infoIcon} aria-label={`Info for ${meta.label}`}>?</span>
      {visible && (
        <div style={s.tooltip} role="tooltip">
          <strong style={{ color: "#00e5ff", fontSize: "0.75rem" }}>{meta.label}</strong>
          {meta.unit ? <span style={{ color: "#ffb74a", fontSize: "0.68rem" }}> [{meta.unit}]</span> : null}
          <br />
          <span style={{ color: "#8ab8d0", fontSize: "0.71rem", lineHeight: 1.5 }}>{meta.tooltip}</span>
        </div>
      )}
    </span>
  );
}

// ─── Field Input ───────────────────────────────────────────────────────────────
function FieldInput({ fieldKey, value, onChange, error }) {
  const meta = FIELD_META[fieldKey];
  return (
    <div style={s.fieldWrap}>
      <div style={s.labelRow}>
        <label style={s.label} htmlFor={fieldKey}>{meta.label}</label>
        <FieldTooltip fieldKey={fieldKey} />
      </div>
      <div style={{ position: "relative" }}>
        <input
          id={fieldKey}
          name={fieldKey}
          type="number"
          step="any"
          value={value}
          onChange={e => onChange(fieldKey, e.target.value)}
          style={{ ...s.input, ...(error ? s.inputErr : {}) }}
          placeholder="0.000"
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldKey}-err` : undefined}
        />
        {meta.unit && <span style={s.unitTag}>{meta.unit}</span>}
      </div>
      {error && <p id={`${fieldKey}-err`} style={s.errMsg} role="alert">{error}</p>}
    </div>
  );
}

// ─── Charts ────────────────────────────────────────────────────────────────────
function ProbabilityBarChart({ probability, habitabilityClass }) {
  const isH = habitabilityClass === "Habitable";
  const pct = Math.round(probability * 100);
  const data = [
    { name: "Habitable",     value: pct,       fill: isH ? "#00e576" : "#1a3028" },
    { name: "Non-Habitable", value: 100 - pct, fill: !isH ? "#ff4a6e" : "#3a1828" },
  ];
  return (
    <div style={s.chartCard}>
      <p style={s.chartTitle}>Habitability Probability</p>
      <p style={s.chartDesc}>Predicted class confidence breakdown</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barSize={34}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#3a7090", fontSize: 10, fontFamily: "Rajdhani, sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0,100]} tick={{ fill: "#2a5068", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: "#041420", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "#c8e6f5" }} formatter={v => [`${v}%`, "Probability"]} cursor={{ fill: "rgba(0,229,255,0.02)" }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonChart({ predictedRadius }) {
  const data = [
    { name: "Predicted",    radius: parseFloat(predictedRadius.toFixed(3)) },
    { name: "Dataset Avg",  radius: REFERENCE_RADIUS },
  ];
  return (
    <div style={s.chartCard}>
      <p style={s.chartTitle}>Radius Comparison</p>
      <p style={s.chartDesc}>Predicted vs. dataset reference (2.26 R⊕)</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barSize={34}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#3a7090", fontSize: 10, fontFamily: "Rajdhani, sans-serif" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#2a5068", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R⊕`} />
          <Tooltip contentStyle={{ background: "#041420", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "#c8e6f5" }} formatter={v => [`${v} R⊕`, "Radius"]} cursor={{ fill: "rgba(0,229,255,0.02)" }} />
          <Bar dataKey="radius" radius={[5, 5, 0, 0]}>
            <Cell fill="#4ab8ff" />
            <Cell fill="#ffb74a" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConfidenceBar({ probability, habitabilityClass }) {
  const isH = habitabilityClass === "Habitable";
  const pct = Math.round(probability * 100);
  const color = isH ? "#00e576" : "#ff4a6e";
  const label = pct >= 80 ? "Very High Confidence" : pct >= 60 ? "High Confidence" : pct >= 40 ? "Moderate Confidence" : "Low Confidence";
  return (
    <div style={s.chartCard}>
      <p style={s.chartTitle}>Confidence Meter</p>
      <p style={s.chartDesc}>Overall model confidence in prediction</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.68rem", color, letterSpacing: "0.1em", fontWeight: 700 }}>
          {habitabilityClass.toUpperCase()}
        </span>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.5rem", color, fontWeight: 900 }}>{pct}%</span>
      </div>
      <div style={{ position: "relative", height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: "6px",
          background: `linear-gradient(90deg, ${isH ? "#00cc66,#00e576" : "#cc2244,#ff4a6e"})`,
          boxShadow: `0 0 10px ${color}44`,
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#2a5068", marginTop: "5px" }}>
        {["0%", "25%", "50%", "75%", "100%"].map(t => <span key={t}>{t}</span>)}
      </div>
      <div style={{ marginTop: "10px", display: "inline-block", background: `${color}12`, border: `1px solid ${color}33`, borderRadius: "20px", padding: "4px 13px", fontSize: "0.7rem", color, fontWeight: 700, letterSpacing: "0.05em" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={s.emptyWrap}>
      <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: "1px solid rgba(74,184,255,0.12)" }} />
        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "1px dashed rgba(74,184,255,0.06)" }} />
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #1a4060, #0a1a2e)", border: "1px solid rgba(74,184,255,0.18)", animation: "pulseCore 3s ease-in-out infinite" }} />
      </div>
      <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.95rem", fontWeight: 700, color: "#1a4a60", letterSpacing: "0.08em" }}>
        Awaiting Analysis
      </h3>
      <p style={{ fontSize: "0.8rem", color: "#1a3a50", lineHeight: 1.7, maxWidth: 280, textAlign: "center" }}>
        Fill in all stellar and orbital parameters, then run the prediction model.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {["23 Input Features", "AI Classification", "Confidence Score"].map(h => (
          <div key={h} style={{ background: "rgba(0,100,200,0.07)", border: "1px solid rgba(0,100,200,0.12)", borderRadius: 20, padding: "4px 12px", fontSize: "0.68rem", color: "#1a4a60" }}>{h}</div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={s.emptyWrap}>
      <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 80, height: 80, border: "2px solid transparent", borderTopColor: "#4ab8ff", borderRightColor: "rgba(74,184,255,0.25)", borderRadius: "50%", animation: "spinAnim 0.9s linear infinite" }} />
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #1a6090, #0a2030)", boxShadow: "0 0 18px rgba(74,184,255,0.3)", animation: "pulseCore 1.5s ease-in-out infinite" }} />
      </div>
      <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.9rem", fontWeight: 700, color: "#4ab8ff", letterSpacing: "0.08em" }}>Analyzing Parameters</h3>
      <p style={{ fontSize: "0.78rem", color: "#2a5a70" }}>Running AI prediction model...</p>
      <div style={{ display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ab8ff", animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function PredictionResult({ result, loading }) {
  if (loading) return <LoadingState />;
  if (!result) return <EmptyState />;

  const { predicted_planet_radius, habitability_class, habitability_probability } = result;
  const isH = habitability_class === "Habitable";
  const habColor = isH ? "#00e576" : "#ff4a6e";
  const pct = Math.round(habitability_probability * 100);

  const cards = [
    { icon: "⬤", label: "Predicted Planet Radius", value: `${predicted_planet_radius.toFixed(4)}`, unit: "R⊕", color: "#4ab8ff" },
    { icon: "◈", label: "Habitability Class", value: habitability_class, color: habColor },
    { icon: "◉", label: "Habitability Probability", value: `${(habitability_probability * 100).toFixed(1)}%`, color: "#b48bff" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "fadeUp 0.5s ease both" }}>
      {/* Banner */}
      <div style={{ background: isH ? "rgba(0,229,118,0.06)" : "rgba(255,74,110,0.06)", border: `1px solid ${habColor}28`, borderRadius: 14, padding: "1.1rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: "2rem" }}>{isH ? "🌍" : "☄️"}</span>
          <div>
            <p style={{ fontSize: "0.65rem", color: "#2a6080", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Classification Result</p>
            <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.15rem", fontWeight: 900, color: habColor, letterSpacing: "0.04em" }}>{habitability_class}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.65rem", color: "#2a6080", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>Confidence</p>
          <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.9rem", fontWeight: 900, color: habColor }}>{pct}%</p>
        </div>
      </div>

      {/* Cards */}
      {cards.map(c => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(0,12,30,0.5)", border: `1px solid ${c.color}18`, borderRadius: 12, padding: "0.9rem 1.1rem", boxShadow: `0 0 24px ${c.color}0a` }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: `${c.color}10`, border: `1px solid ${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: c.color, flexShrink: 0 }}>{c.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.65rem", color: "#2a6080", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 3 }}>{c.label}</p>
            <p style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.95rem", fontWeight: 700, color: c.color, letterSpacing: "0.02em" }}>
              {c.value}{c.unit && <span style={{ fontSize: "0.65rem", opacity: 0.6, fontWeight: 400 }}> {c.unit}</span>}
            </p>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0.25rem 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        <span style={{ fontSize: "0.62rem", color: "#1a4a60", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Visualizations</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
      </div>

      <ConfidenceBar probability={habitability_probability} habitabilityClass={habitability_class} />
      <ProbabilityBarChart probability={habitability_probability} habitabilityClass={habitability_class} />
      <ComparisonChart predictedRadius={predicted_planet_radius} />

      <p style={{ fontSize: "0.66rem", color: "#1a3a50", textAlign: "center", lineHeight: 1.6, borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.9rem" }}>
        ✦ Predictions generated by AI model trained on NASA Kepler KOI dataset. Reference dataset average radius: 2.26 R⊕
      </p>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function ExoplanetDashboard() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const errs = {};
    Object.entries(values).forEach(([k, v]) => {
      //if (v === "" || v === null || v === undefined) errs[k] = "Required";
      if (isNaN(Number(v))) errs[k] = "Must be numeric";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {};
      Object.entries(values).forEach(([k, v]) => { payload[k] = parseFloat(v); });
      const res = await fetch("https://steller-backend.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setApiError(e.message || "Failed to connect to prediction API.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setResult(null);
    setErrors({});
    setApiError(null);
  };

  return (
    <div style={s.root}>
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            background: "#fff",
            borderRadius: "50%",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `twinkle ${Math.random() * 3 + 2}s ${Math.random() * 4}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Planet logo */}
            <div style={{ position: "relative", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 40, height: 40, border: "1.5px solid rgba(0,229,255,0.35)", borderTopColor: "#00e5ff", borderRadius: "50%", animation: "spinAnim 6s linear infinite" }} />
              <div style={{ width: 17, height: 17, background: "radial-gradient(circle at 35% 35%, #1a8fb5, #0a3d5c)", borderRadius: "50%", boxShadow: "0 0 10px rgba(0,229,255,0.3)" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: "1.4rem", fontWeight: 900, letterSpacing: "0.1em", color: "#e8f4ff" }}>
                EXOPLANET<span style={{ color: "#00e5ff", textShadow: "0 0 18px rgba(0,229,255,0.5)" }}> AI</span>
              </h1>
              <p style={{ fontSize: "0.68rem", color: "#2a6080", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Habitability Prediction · NASA KOI Dataset
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,255,128,0.06)", border: "1px solid rgba(0,255,128,0.18)", borderRadius: 20, padding: "6px 14px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff80", boxShadow: "0 0 7px #00ff80", animation: "pulseCore 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.72rem", color: "#00ff80", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>Model Online</span>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main style={s.main}>
        <div style={s.panels}>
          {/* LEFT */}
          <section style={s.panelLeft}>
            <div style={s.panelHead}>
              <span style={{ ...s.panelTag, background: "rgba(0,130,255,0.1)", color: "#4ab8ff", borderColor: "rgba(0,130,255,0.2)" }}>INPUT</span>
              <h2 style={s.panelTitle}>Stellar & Orbital Parameters</h2>
              <p style={s.panelDesc}>Enter all 23 KOI feature values. Hover the <strong style={{ color: "#4ab8ff" }}>?</strong> icon for field descriptions.</p>
            </div>

            {/* Groups */}
            {GROUPS.map(group => (
              <div key={group.key} style={{ ...s.groupBox, marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.9rem" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: group.color, boxShadow: `0 0 7px ${group.color}88` }} />
                  <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "0.67rem", fontWeight: 700, color: group.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{group.title}</h3>
                </div>
                <div style={s.grid}>
                  {group.fields.map(key => (
                    <FieldInput
                      key={key}
                      fieldKey={key}
                      value={values[key]}
                      onChange={(k, v) => {
                        setValues(p => ({ ...p, [k]: v }));
                        if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
                      }}
                      error={errors[key]}
                    />
                  ))}
                </div>
              </div>
            ))}

            {apiError && (
              <div style={{ background: "rgba(255,50,50,0.08)", border: "1px solid rgba(255,50,50,0.25)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "#ff8080", display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
                <span>⚠</span> {apiError}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button style={s.resetBtn} onClick={handleReset}>↺ Reset</button>
              <button style={{ ...s.predictBtn, ...(loading ? { opacity: 0.7, cursor: "not-allowed" } : {}) }} onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ display: "inline-block", width: 15, height: 15, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spinAnim 0.8s linear infinite" }} />
                    Analyzing...
                  </span>
                ) : "▶ Run Prediction"}
              </button>
            </div>
          </section>

          {/* RIGHT */}
          <section style={s.panelRight}>
            <div style={s.panelHead}>
              <span style={{ ...s.panelTag, background: "rgba(0,229,255,0.08)", color: "#00e5ff", borderColor: "rgba(0,229,255,0.18)" }}>OUTPUT</span>
              <h2 style={s.panelTitle}>Prediction Results</h2>
              <p style={s.panelDesc}>AI-generated habitability analysis based on stellar and orbital data.</p>
            </div>
            <PredictionResult result={result} loading={loading} />
          </section>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020b18; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #020b18; }
        ::-webkit-scrollbar-thumb { background: #0d3a5c; border-radius: 3px; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        input:focus { outline: none !important; border-color: rgba(0,229,255,0.55) !important; box-shadow: 0 0 0 3px rgba(0,229,255,0.1), 0 0 14px rgba(0,229,255,0.07) !important; }
        input:hover:not(:focus) { border-color: rgba(74,184,255,0.32) !important; }
        button:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
        button { transition: all 0.18s ease; }
        @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @keyframes spinAnim { to { transform: rotate(360deg); } }
        @keyframes pulseCore { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0.75); opacity: 0.4; } 40% { transform: scale(1.2); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = {
  root: { minHeight: "100vh", background: "linear-gradient(140deg, #020b18 0%, #041626 55%, #020b18 100%)", fontFamily: "'Rajdhani', sans-serif", color: "#c8e6f5", position: "relative" },
  header: { position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(0,180,255,0.1)", background: "rgba(2,11,24,0.85)", backdropFilter: "blur(20px)", padding: "0 2rem" },
  headerInner: { maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0" },
  main: { position: "relative", zIndex: 1, maxWidth: 1600, margin: "0 auto", padding: "1.75rem 2rem" },
  panels: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem", alignItems: "start" },
  panelLeft: { background: "rgba(4,18,38,0.72)", border: "1px solid rgba(0,130,255,0.13)", borderRadius: 20, padding: "1.75rem", backdropFilter: "blur(30px)", boxShadow: "0 8px 50px rgba(0,80,200,0.08), inset 0 1px 0 rgba(255,255,255,0.03)", animation: "fadeUp 0.55s ease both" },
  panelRight: { background: "rgba(4,18,38,0.72)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 20, padding: "1.75rem", backdropFilter: "blur(30px)", boxShadow: "0 8px 50px rgba(0,180,255,0.07), inset 0 1px 0 rgba(255,255,255,0.03)", animation: "fadeUp 0.55s ease 0.08s both" },
  panelHead: { marginBottom: "1.4rem" },
  panelTag: { display: "inline-block", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 20, marginBottom: 8, border: "1px solid", textTransform: "uppercase" },
  panelTitle: { fontFamily: "'Orbitron', monospace", fontSize: "0.98rem", fontWeight: 700, color: "#e8f4ff", letterSpacing: "0.04em", marginBottom: 5 },
  panelDesc: { fontSize: "0.78rem", color: "#2a6080", lineHeight: 1.55 },
  groupBox: { background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.045)", borderRadius: 12, padding: "1.1rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  fieldWrap: { display: "flex", flexDirection: "column", gap: 3 },
  labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: "0.65rem", color: "#2a7090", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "calc(100% - 20px)" },
  infoIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%", border: "1px solid rgba(74,184,255,0.38)", color: "#4ab8ff", fontSize: "0.58rem", fontWeight: 700, cursor: "help", userSelect: "none", flexShrink: 0 },
  tooltip: { position: "absolute", bottom: "calc(100% + 8px)", right: 0, width: 215, background: "rgba(3,18,38,0.98)", border: "1px solid rgba(0,229,255,0.22)", borderRadius: 10, padding: "10px 12px", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 18px rgba(0,229,255,0.07)", pointerEvents: "none", lineHeight: 1.5 },
  input: { width: "100%", background: "rgba(0,15,40,0.6)", border: "1px solid rgba(0,90,180,0.2)", borderRadius: 8, padding: "7px 9px", color: "#d0ecff", fontSize: "0.8rem", fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, transition: "border-color 0.18s, box-shadow 0.18s", WebkitAppearance: "none" },
  inputErr: { borderColor: "rgba(255,70,70,0.45)", boxShadow: "0 0 0 2px rgba(255,70,70,0.09)" },
  unitTag: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: "0.58rem", color: "#1a4060", pointerEvents: "none", letterSpacing: "0.02em" },
  errMsg: { fontSize: "0.62rem", color: "#ff7070", fontWeight: 600 },
  resetBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#4a8fb5", borderRadius: 10, padding: "11px 22px", fontSize: "0.82rem", fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em" },
  predictBtn: { flex: 1, background: "linear-gradient(135deg, #0055bb, #0088ee)", border: "1px solid rgba(0,170,255,0.35)", color: "#fff", borderRadius: 10, padding: "11px 22px", fontSize: "0.85rem", fontFamily: "'Orbitron', monospace", fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em", boxShadow: "0 4px 18px rgba(0,110,230,0.28)" },
  emptyWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1.4rem", minHeight: 480, textAlign: "center" },
  chartCard: { background: "rgba(0,12,30,0.55)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 13, padding: "1.1rem", marginBottom: 0 },
  chartTitle: { fontFamily: "'Orbitron', monospace", fontSize: "0.68rem", fontWeight: 700, color: "#b0d8f0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 },
  chartDesc: { fontSize: "0.7rem", color: "#1e5070", marginBottom: "0.9rem" },
};
