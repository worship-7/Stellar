import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend,
} from "recharts";

const REFERENCE_RADIUS = 2.26;

// ─── Probability Bar Chart ────────────────────────────────────────────────────
export function ProbabilityBarChart({ probability, habitabilityClass }) {
  const isHabitable = habitabilityClass === "Habitable";
  const color = isHabitable ? "#00ff80" : "#ff4a6e";
  const pct = Math.round(probability * 100);

  const data = [
    { name: "Habitable", value: pct, fill: isHabitable ? "#00ff80" : "#1a3a2a" },
    { name: "Non-Habitable", value: 100 - pct, fill: !isHabitable ? "#ff4a6e" : "#3a1a24" },
  ];

  return (
    <div style={styles.chartCard}>
      <h4 style={styles.chartTitle}>Habitability Probability</h4>
      <p style={styles.chartDesc}>Predicted class confidence breakdown</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#4a8fb5", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#2a6080", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: "#041420", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontFamily: "Rajdhani", fontSize: "12px", color: "#c8e6f5" }}
            formatter={(val) => [`${val}%`, "Probability"]}
            cursor={{ fill: "rgba(0,229,255,0.03)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Prediction Comparison Chart ──────────────────────────────────────────────
export function ComparisonChart({ predictedRadius }) {
  const data = [
    { name: "Predicted", radius: parseFloat(predictedRadius.toFixed(3)) },
    { name: "Dataset Avg", radius: REFERENCE_RADIUS },
  ];

  return (
    <div style={styles.chartCard}>
      <h4 style={styles.chartTitle}>Radius Comparison</h4>
      <p style={styles.chartDesc}>Predicted vs. dataset reference ({REFERENCE_RADIUS} R⊕)</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#4a8fb5", fontSize: 10, fontFamily: "Rajdhani" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#2a6080", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}R⊕`} />
          <Tooltip
            contentStyle={{ background: "#041420", border: "1px solid rgba(0,229,255,0.2)", borderRadius: "8px", fontFamily: "Rajdhani", fontSize: "12px", color: "#c8e6f5" }}
            formatter={(val) => [`${val} R⊕`, "Radius"]}
            cursor={{ fill: "rgba(0,229,255,0.03)" }}
          />
          <Bar dataKey="radius" radius={[6, 6, 0, 0]}>
            <Cell fill="#4ab8ff" />
            <Cell fill="#ff9d4a" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Confidence Progress Bar ───────────────────────────────────────────────────
export function ConfidenceBar({ probability, habitabilityClass }) {
  const isHabitable = habitabilityClass === "Habitable";
  const pct = Math.round(probability * 100);
  const color = isHabitable ? "#00ff80" : "#ff4a6e";
  const bgColor = isHabitable ? "rgba(0,255,128,0.08)" : "rgba(255,74,110,0.08)";

  return (
    <div style={styles.chartCard}>
      <h4 style={styles.chartTitle}>Confidence Meter</h4>
      <p style={styles.chartDesc}>Overall model confidence in prediction</p>

      <div style={styles.confMeterWrap}>
        <div style={{ ...styles.confLabelRow }}>
          <span style={{ ...styles.confLabel, color }}>
            {isHabitable ? "HABITABLE" : "NON-HABITABLE"}
          </span>
          <span style={{ ...styles.confPct, color }}>{pct}%</span>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${isHabitable ? "#00cc66, #00ff80" : "#cc2244, #ff4a6e"})`,
              boxShadow: `0 0 12px ${color}55`,
            }}
          />
          {/* Tick marks */}
          {[25, 50, 75].map(tick => (
            <div key={tick} style={{ ...styles.tick, left: `${tick}%` }} />
          ))}
        </div>

        <div style={styles.tickLabels}>
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>

        {/* Descriptor */}
        <div style={{ ...styles.confChip, background: bgColor, border: `1px solid ${color}44`, color }}>
          {pct >= 80 ? "Very High Confidence" : pct >= 60 ? "High Confidence" : pct >= 40 ? "Moderate Confidence" : "Low Confidence"}
        </div>
      </div>
    </div>
  );
}

const styles = {
  chartCard: {
    background: "rgba(0,15,35,0.5)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "1.25rem",
    marginBottom: "1rem",
  },
  chartTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#c8e6f5",
    letterSpacing: "0.08em",
    marginBottom: "3px",
    textTransform: "uppercase",
  },
  chartDesc: {
    fontSize: "0.72rem",
    color: "#3a6a85",
    marginBottom: "1rem",
  },
  confMeterWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  confLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confLabel: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  confPct: {
    fontFamily: "'Orbitron', monospace",
    fontSize: "1.4rem",
    fontWeight: 900,
  },
  progressTrack: {
    position: "relative",
    height: "12px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "6px",
    overflow: "visible",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  tick: {
    position: "absolute",
    top: "-4px",
    width: "1px",
    height: "20px",
    background: "rgba(255,255,255,0.08)",
    transform: "translateX(-50%)",
  },
  tickLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.65rem",
    color: "#2a5070",
    marginTop: "4px",
  },
  confChip: {
    display: "inline-block",
    borderRadius: "20px",
    padding: "5px 14px",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    alignSelf: "flex-start",
    marginTop: "4px",
  },
};
