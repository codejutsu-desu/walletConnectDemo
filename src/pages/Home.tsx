import { AccountId, TokenId } from "@hashgraph/sdk";
import {
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  AlertColor,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";
import axios from "axios";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

export default function Home() {
  const { walletInterface } = useWalletInterface();
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const buyToken = async () => {
    if (!walletInterface) {
      setSnackbar({
        open: true,
        message: "No wallet connected",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const userAccountId = walletInterface.getAccountId();
      console.log(userAccountId);

      const apiUrl = `https://kpos.uk/deal/bytes/?dealId=41653434140ca045fd0432e33ebc61791815b30a22c70224b97dbc142613a1b1&network=mainnet&userAccountId=${userAccountId}`;
      const response = await axios.get(apiUrl);
      console.log(response);

      // Assuming the API returns the bytes in response.data.bytes
      const transactionBytes = new Uint8Array(response.data.bytes.data);
      console.log(transactionBytes);

      // Sign and execute the transaction
      const txId = await walletInterface.processTransactionBytes(
        transactionBytes
      );
      console.log("Transaction ID:", txId);

      setSnackbar({
        open: true,
        message: "Token purchase successful",
        severity: "success",
      });
    } catch (error) {
      console.error("Error buying token:", error);
      setSnackbar({
        open: true,
        message: "Error buying token",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferHBAR = async () => {
    if (!walletInterface) {
      setSnackbar({
        open: true,
        message: "No wallet connected",
        severity: "error",
      });
      return;
    }

    if (!toAccountId || amount <= 0) {
      setSnackbar({
        open: true,
        message: "Invalid input values",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const txId = await walletInterface.transferHBAR(
        AccountId.fromString(toAccountId),
        amount
      );
      console.log("Transfer Transaction ID:", txId);

      setSnackbar({
        open: true,
        message: "HBAR transfer successful",
        severity: "success",
      });
    } catch (error) {
      console.error("Error transferring HBAR:", error);
      setSnackbar({
        open: true,
        message: "Error transferring HBAR",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack alignItems="center" spacing={4}>
      <Typography variant="h4" color="white">
        Simple dApp on Hedera
      </Typography>
      {walletInterface && (
        <>
          <Stack direction="row" gap={2} alignItems="center">
            <Typography>Transfer</Typography>
            <TextField
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              sx={{
                maxWidth: "100px",
              }}
            />
            <Typography>HBAR to</Typography>
            <TextField
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              label="Account ID or EVM Address"
            />
            <Button
              variant="contained"
              onClick={handleTransferHBAR}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Stack>
          <Stack direction="row" gap={2} alignItems="center">
            <Typography>Buy Token</Typography>
            <Button variant="contained" onClick={buyToken} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </Button>
          </Stack>
        </>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
