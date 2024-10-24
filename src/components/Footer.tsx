import { Box } from "@mui/material";
import BuiltOnHedera from "../assets/built-on-hedera.svg";

export default function Footer() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box className="footer">
        <img
          src={BuiltOnHedera}
          alt=" Built on Hedera"
          className="builtOnHederaSVG"
        />
      </Box>
    </Box>
  );
}
