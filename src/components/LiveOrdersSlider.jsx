import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  Chip,
  Paper,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
  Tooltip,
  Grid,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MobileStepper from "@mui/material/MobileStepper";
import SwipeableViews from "react-swipeable-views";
import mealpelogo from "../assets/mealpe.png";

const LiveOrdersSlider = ({ liveOrders, refreshOrders, refreshingOrders }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
  const bottomPosition = isSmallScreen ? 5 : 0;
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = liveOrders.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const formatDate = (dateStr) => {
    const orderDate = new Date(dateStr);
    const today = new Date();

    if (orderDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Format for tomorrow or specific date
    return orderDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (liveOrders.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: bottomPosition,
        left: isMediumScreen ? "50%" : 0,
        right: isMediumScreen ? "auto" : 0,
        transform: isMediumScreen ? "translateX(-50%)" : "none",
        maxWidth: isMediumScreen ? "600px" : "100%",
        width: isMediumScreen ? "600px" : "100%",
        zIndex: 20,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderRadius: 0,
        overflow: "visible",
        background: "transparent",
        boxShadow: "none",
        mb: 0,
        borderTop: "none",
        p: 0,
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: 0,
          pt: 0, // keep as is, since this is already 0
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #FF583A 0%, #FF583A 100%)",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderRadius: 0,
            boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
            px: { xs: 2, sm: 3 },
            py: { xs: 0.5, sm: 1 }, // reduced padding from top (was { xs: 1.5, sm: 2 })
            display: "flex",
            alignItems: "center",
            position: "relative",
            minHeight: 80,
          }}
        >
          {/* Orders count tab */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translateY(-60%)",
              background: "#fff",
              color: "#FF583A",
              fontWeight: 700,
              fontSize: 10,
              px: 2,
              py: 0.5,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              boxShadow: "0 2px 8px rgba(255,88,58,0.10)",
              zIndex: 2,
              border: "1px solid #FF583A",
              borderBottom: "none",
              minWidth: 80,
              textAlign: "center",
            }}
          >
            {`Orders ${activeStep + 1}/${liveOrders.length}`}
          </Box>

    
          {/* Left: Outlet name and status */}
          <Box
            sx={{
              flex: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
              ml: { xs: 0, sm: 2 },
              pl: { xs: 0, sm: 7 },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: { xs: 16, sm: 18 },
                lineHeight: 1.2,
                mb: 0.2,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: { xs: 120, sm: 180 },
              }}
              title={liveOrders[activeStep].outletname}
            >
              {liveOrders[activeStep].outletname}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#fff",
                fontWeight: 400,
                fontSize: { xs: 13, sm: 14 },
                opacity: 0.95,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              Stage&nbsp;–&nbsp;
              {liveOrders[activeStep].displaystatustext || "Order Placed"}
            </Typography>
          </Box>

          {/* Right: Refresh and Manage Order */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 0,
              ml: "auto",
              minWidth: 0,
            }}
          >
            <Button
              variant="text"
              size="small"
              onClick={refreshOrders}
              disabled={refreshingOrders}
              startIcon={
                <RefreshIcon
                  sx={{
                    color: "#fff",
                    fontSize: 20,
                    animation: refreshingOrders
                      ? "spin 1s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              }
              sx={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 12,
                textTransform: "none",
                minWidth: 0,
                px: 0.5,
                mb: 0.5,
                "&:hover": {
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                navigate(`/order/${liveOrders[activeStep].orderid}`)
              }
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                border: "2px solid #fff",
                color: "#FF583A",
                background: "#fff",
                px: 2.5,
                py: 0.5,
                mb: 1.6,
                fontSize: 12,
                minWidth: 0,
                height: "auto",
                lineHeight: 1.5,
                whiteSpace: "nowrap",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#FF583A",
                  borderColor: "#FF583A",
                  boxShadow: "0 2px 8px rgba(255,88,58,0.08)",
                },
              }}
            >
              Manage Order
            </Button>
          </Box>
        </Box>

        {/* Order navigation and details */}
        <Box
          sx={{
            background: "#fff",
            px: { xs: 2, sm: 3 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderRadius: 0,
            border: "1px solid #FF583A",
            borderTop: "none",
            boxShadow: "0 2px 8px rgba(255,88,58,0.10)",
            position: "relative",
          }}
        >
          {/* Back button */}
          <IconButton
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              border: "1px solid #FF583A",
              color: "#FF583A",
              background: "#fff",
              mr: 1,
              "&:hover": {
                background: "#FFF3F0",
              },
              visibility: maxSteps > 1 ? "visible" : "hidden",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>


          {/* Next button */}
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
            sx={{
              border: "1px solid #FF583A",
              color: "#FF583A",
              background: "#fff",
              ml: 1,
              "&:hover": {
                background: "#FFF3F0",
              },
              visibility: maxSteps > 1 ? "visible" : "hidden",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default LiveOrdersSlider;
