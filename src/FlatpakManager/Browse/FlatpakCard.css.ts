const CardBase = {
  display: "flex",
  justifyContent: "space-between",
  borderRadius: "7px",
  minHeight: "3em",
  maxHeight: "3em",
  margin: "2px",
  padding: "5px 10px"
}

export const Card = {
  focus: {
    ...CardBase,
    backgroundColor: "#4b6e90" //"#1f2933"
  },
  blur: {
    ...CardBase,
    backgroundColor: "#121c25"
  }
}