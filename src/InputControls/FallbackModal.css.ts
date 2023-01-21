import { findSP } from "decky-frontend-lib"

export const FallbackModalContainer = {
  maxHeight: Math.floor(findSP().window.innerHeight * 0.45),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "40px",
  marginBottom: "40px",
  overflow: "hidden"
}

export const FallbackModalContent = {
  backgroundColor: "#1b1c25",
  borderRadius: "8px",
  height: "fit-content",
  width: "70%",
  padding: "20px"
}
