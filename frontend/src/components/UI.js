export const pageWrapper = {
    backgroundColor: "#060D1A",
    minHeight: "100vh"
  };
  
  export const card = {
    backgroundColor: "#0D1F3C",
    border: "1px solid rgba(0,229,204,0.15)",
  };
  
  export const cardHover = {
    backgroundColor: "#0D1F3C",
    border: "1px solid rgba(0,229,204,0.4)",
    boxShadow: "0 0 20px rgba(0,229,204,0.1)"
  };
  
  export const input = {
    backgroundColor: "#0A1628",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white"
  };
  
  export const btnPrimary = {
    backgroundColor: "#00E5CC",
    color: "#0A1628"
  };
  
  export const btnOutline = {
    border: "1px solid rgba(0,229,204,0.4)",
    color: "#00E5CC"
  };
  
  export const tableHead = {
    backgroundColor: "#0A1628",
  };
  
  export const badge = (color) => ({
    backgroundColor: color === "green" ? "rgba(0,229,204,0.1)" : 
                     color === "red" ? "rgba(239,68,68,0.1)" : 
                     "rgba(251,191,36,0.1)",
    color: color === "green" ? "#00E5CC" : 
           color === "red" ? "#F87171" : 
           "#FCD34D"
  });