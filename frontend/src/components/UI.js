export const pageWrapper = {
  backgroundColor: "#060D1A",
  minHeight: "100vh",
};

export const card = {
  backgroundColor: "#0D1F3C",
  border: "1px solid rgba(255,255,255,0.07)",
};

export const cardGlow = {
  backgroundColor: "#0D1F3C",
  border: "1px solid rgba(0,229,204,0.3)",
  boxShadow: "0 0 24px rgba(0,229,204,0.08)",
};

export const input = {
  backgroundColor: "#0A1628",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white",
};

export const btnPrimary = {
  background: "linear-gradient(135deg, #00E5CC 0%, #00BFA5 100%)",
  color: "#080F1E",
  fontWeight: 600,
  boxShadow: "0 2px 12px rgba(0,229,204,0.25)",
};

export const btnOutline = {
  border: "1px solid rgba(0,229,204,0.35)",
  color: "#00E5CC",
  backgroundColor: "transparent",
};

export const btnDanger = {
  border: "1px solid rgba(248,113,113,0.3)",
  color: "#F87171",
  backgroundColor: "rgba(248,113,113,0.05)",
};

export const tableHead = {
  backgroundColor: "#080F1E",
};

export const badge = (color) => ({
  backgroundColor:
    color === "green" ? "rgba(0,229,204,0.12)"
    : color === "red" ? "rgba(239,68,68,0.12)"
    : "rgba(251,191,36,0.12)",
  color:
    color === "green" ? "#00E5CC"
    : color === "red" ? "#F87171"
    : "#FCD34D",
  borderRadius: "999px",
  padding: "2px 10px",
  fontSize: "11px",
  fontWeight: 600,
});

// Page header component helper styles
export const pageHeader = {
  marginBottom: "28px",
};

// Stat card accent bar
export const statAccent = (color = "#00E5CC") => ({
  width: "3px",
  borderRadius: "2px",
  backgroundColor: color,
  alignSelf: "stretch",
});