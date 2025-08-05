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
        maxWidth: isMediumScreen ? "400px" : "100%",
        width: isMediumScreen ? "400px" : "100%",
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
          pt: 0,
        }}
      >
        {/* 
          If more than one order, show slider (SwipeableViews) with navigation.
          If only one order, show static order card.
        */}
        {liveOrders.length > 1 ? (
          <>
            <SwipeableViews
              index={activeStep}
              onChangeIndex={handleStepChange}
              enableMouseEvents
              resistance
              style={{ width: "100%" }}
            >
              {liveOrders.map((order, idx) => (
                <Box key={order.orderid || idx}>
                  <Box
                    sx={{
                      background: "linear-gradient(90deg, #FF583A 0%, #FF583A 100%)",
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderRadius: 0,
                      boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
                      px: { xs: 2, sm: 3, md: 1.5 },
                      py: { xs: 0.5, sm: 1, md: 0.5 },
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      minHeight: { xs: 80, md: 60 },
                    }}
                  >
                    {/* Orders count tab */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transform: "translateY(-10%)",
                        background: "#fff",
                        color: "#FF583A",
                        fontWeight: 700,
                        fontSize: 10,
                        px: 2,
                        py: 0.5,
                        borderBottomRightRadius:"5px",
                        boxShadow: "0 2px 8px rgba(255,88,58,0.10)",
                        zIndex: 2,
                        border: "1px solid #FF583A",
                        borderBottom: "none",
                        minWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      {`Orders ${idx + 1}/${liveOrders.length}`}
                    </Box>

                    {/* Left: Outlet name and status */}
                    <Box
                      sx={{
                        flex: 2,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minWidth: 0,
                        ml: { xs: 0, sm: 2, md: 1 },
                        pl: { xs: 0, sm: 7, md: 4 },
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: { xs: 16, sm: 18, md: 16 },
                          lineHeight: 1.2,
                          mb: 0.2,
                          mt:1.2,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          maxWidth: { xs: 120, sm: 180, md: 140 },
                        }}
                        title={order.outletname}
                      >
                        {order.outletname}
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
                        {order.displaystatustext || "Order Placed"}
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
                          fontSize: { xs: 12, md: 11 },
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
                          navigate(`/order/${order.orderid}`)
                        }
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontWeight: 700,
                          border: "2px solid #fff",
                          color: "#FF583A",
                          background: "#fff",
                          px: { xs: 2.5, md: 2 },
                          py: { xs: 0.5, md: 0.3 },
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
                </Box>
              ))}
            </SwipeableViews>
            {/* Navigation controls for slider */}
            <Box
              sx={{
                background: { xs: "#fff", md: "transparent" },
                px: { xs: 2, sm: 3, md: 0.5 },
                py: { xs: 1.5, md: 0.3 },
                display: "flex",
                alignItems: "center",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderRadius: 0,
                border: { xs: "1px solid #FF583A", md: "none" },
                borderTop: "none",
                boxShadow: { xs: "0 2px 8px rgba(255,88,58,0.10)", md: "none" },
                position: "relative",
                minHeight: { xs: "auto", md: 32 },
              }}
            >
              {/* Back button */}
              <IconButton
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  border: { xs: "1px solid #FF583A", md: "none" },
                  color: "#FF583A",
                  background: { xs: "#fff", md: "rgba(255,88,58,0.1)" },
                  mr: { xs: 1, md: 0.5 },
                  width: { xs: 40, md: 28 },
                  height: { xs: 40, md: 28 },
                  "&:hover": {
                    background: { xs: "#FFF3F0", md: "rgba(255,88,58,0.2)" },
                  },
                  visibility: liveOrders.length > 1 ? "visible" : "hidden",
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: { xs: 24, md: 16 } }} />
              </IconButton>

              {/* Next button */}
              <IconButton
                size="small"
                onClick={handleNext}
                disabled={activeStep === liveOrders.length - 1}
                sx={{
                  border: { xs: "1px solid #FF583A", md: "none" },
                  color: "#FF583A",
                  background: { xs: "#fff", md: "rgba(255,88,58,0.1)" },
                  ml: { xs: 1, md: 0.5 },
                  width: { xs: 40, md: 28 },
                  height: { xs: 40, md: 28 },
                  "&:hover": {
                    background: { xs: "#FFF3F0", md: "rgba(255,88,58,0.2)" },
                  },
                  visibility: liveOrders.length > 1 ? "visible" : "hidden",
                }}
              >
                <ChevronRightIcon sx={{ fontSize: { xs: 24, md: 16 } }} />
              </IconButton>
            </Box>
          </>
        ) : (
          // Only one order, show static card (no slider)
          <>
            <Box
              sx={{
                background: "linear-gradient(90deg, #FF583A 0%, #FF583A 100%)",
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderRadius: 0,
                boxShadow: "0px 2px 8px rgba(0,0,0,0.04)",
                px: { xs: 2, sm: 3, md: 1.5 },
                py: { xs: 0.5, sm: 1, md: 0.5 },
                display: "flex",
                alignItems: "center",
                position: "relative",
                minHeight: { xs: 80, md: 60 },
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
                {`Orders 1/1`}
              </Box>

              {/* Left: Outlet name and status */}
              <Box
                sx={{
                  flex: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  minWidth: 0,
                  ml: { xs: 0, sm: 2, md: 1 },
                  pl: { xs: 0, sm: 7, md: 4 },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: { xs: 16, sm: 18, md: 16 },
                    lineHeight: 1.2,
                    mb: 0.2,
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: { xs: 120, sm: 180, md: 140 },
                  }}
                  title={liveOrders[0].outletname}
                >
                  {liveOrders[0].outletname}
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
                  {liveOrders[0].displaystatustext || "Order Placed"}
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
                    fontSize: { xs: 12, md: 11 },
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
                    navigate(`/order/${liveOrders[0].orderid}`)
                  }
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    border: "2px solid #fff",
                    color: "#FF583A",
                    background: "#fff",
                    px: { xs: 2.5, md: 2 },
                    py: { xs: 0.5, md: 0.3 },
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
          </>
        )}
      </Box>
    </Paper>
  );
};

export default LiveOrdersSlider;