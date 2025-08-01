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
  const bottomPosition = isSmallScreen ? 80 : 0;
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
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        pb: 0.5,
        backgroundColor: "transparent",
        // backdropFilter: "blur(8px)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
        mb: isSmallScreen ? 0 : 0,
        borderTop: "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box
        sx={{
          maxWidth: "max-content",
          mx: "auto",
          width: "100%",
          px: { xs: 1, sm: 2 },
          pt: 0.5,
        }}
      >
        {/* Show active step of total step above, with space at bottom */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
          <Typography
            variant="body2"
            color="#fff"
            sx={{
              fontSize: { xs: 11, sm: 12 },
              fontWeight: 500,
              px: 1,
              py: 0.2,
              borderRadius: 1,
              backgroundColor: "#fff",
              color: "#000000",
              display: "inline-block",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {`${activeStep + 1} of ${liveOrders.length}`}
          </Typography>
        </Box>
        {/* Slider */}
        <Box sx={{ position: "relative" }}>
          <SwipeableViews
            axis="x"
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
            style={{ paddingBottom: "4px" }}
          >
            {liveOrders.map((order, index) => (
              <Box
                key={order.orderid}
                sx={{ px: 1, mb: isSmallScreen ? 0 : 0 }}
              >
                {Math.abs(activeStep - index) <= 2 ? (
                  <Paper
                    elevation={2}
                    sx={{
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "#FF583A",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 3,
                        borderColor: "#fff",
                      },
                      maxWidth: { xs: "100%", sm: 450 },
                      mx: "auto",
                      backgroundColor: "#FF583A",
                      position: "relative",
                    }}
                  >
                    {/* Compact layout with all info in one row */}
                    <Grid container alignItems="center" spacing={1}>
                      {/* Logo */}
                      <Grid item>
                        <Avatar
                          src={order.logo || mealpelogo}
                          alt={order.outletname}
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            border: "1px solid",
                            borderColor: "#fff",
                            backgroundColor: "#fff",
                          }}
                          imgProps={{
                            onError: (e) => {
                              e.target.src = mealpelogo;
                            },
                          }}
                        />
                      </Grid>

                      {/* Restaurant Info and Status */}
                      <Grid item xs>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            noWrap
                            sx={{
                              fontSize: { xs: 14, sm: 16 },
                              lineHeight: 1.2,
                              color: "#fff",
                            }}
                          >
                            {order.outletname}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 0.5,
                            }}
                          >
                            <Chip
                              label={order.displaystatustext || "Order Placed"}
                              color="warning"
                              variant="outlined"
                              size="small"
                              sx={{
                                fontSize: { xs: 10, sm: 11 },
                                height: { xs: 20, sm: 24 },
                                borderColor: "#FF583A",
                                backgroundColor: "#fff",
                                borderRadius: 6,
                                fontWeight: 500,
                                mr: 1,
                                color: "#FF583A",
                                // subtle shadow for professional look
                                boxShadow: "0 1px 4px rgba(255,88,58,0.08)",
                                letterSpacing: 0.2,
                                "& .MuiChip-label": {
                                  color: "#FF583A",
                                  fontWeight: 500,
                                },
                              }}
                            />

                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <AccessTimeIcon
                                sx={{
                                  fontSize: { xs: 14, sm: 15 },
                                  color: "#fff",
                                }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight="medium"
                                sx={{
                                  fontSize: { xs: 11, sm: 12 },
                                  lineHeight: 1.1,
                                  color: "#fff",
                                }}
                              >
                                {formatDate(order.scheduledate)}{" "}
                                {order.scheduletime.substring(0, 5)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Grid>

                      {/* View Order Button */}
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/order/${order.orderid}`)}
                          sx={{
                            borderRadius: 50,
                            textTransform: "none",
                            fontWeight: "bold",
                            border: "1px solid #fff",
                            color: "#FF583A",
                            px: { xs: 1.5, sm: 2 },
                            py: 0.5,
                            fontSize: { xs: 12, sm: 13 },
                            minWidth: "auto",
                            height: "auto",
                            lineHeight: 1.5,
                            whiteSpace: "nowrap",
                            backgroundColor: "#fff",
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "#fff",
                              color: "#FF583A",
                              borderColor: "#FF583A",
                              boxShadow: "0 2px 8px rgba(255,88,58,0.08)",
                            },
                          }}
                        >
                          View Order
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                ) : (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={80}
                    sx={{ borderRadius: 3, backgroundColor: "#fff" }}
                  />
                )}
              </Box>
            ))}
          </SwipeableViews>
        </Box>

        {/* Navigation */}
        {/* <MobileStepper
          steps={maxSteps}
          position="static"
          activeStep={activeStep}
          sx={{
            background: "transparent",
            mt: 0.25,
            mb: isSmallScreen ? 1 : 0,
            "& .MuiMobileStepper-dot": {
              width: 6,
              height: 6,
              mx: 0.4,
            },
            "& .MuiMobileStepper-dotActive": {
              backgroundColor: "#FF583A",
            },
          }}
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === maxSteps - 1}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                width: { xs: 20, sm: 24 },
                height: { xs: 20, sm: 24 },
                backgroundColor: "white",
              }}
            >
              <ChevronRightIcon
                fontSize={isSmallScreen ? "small" : "medium"}
                sx={{ fontSize: isSmallScreen ? "16px" : "18px" }}
              />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                width: { xs: 20, sm: 24 },
                height: { xs: 20, sm: 24 },
                backgroundColor: "white",
              }}
            >
              <ChevronLeftIcon
                fontSize={isSmallScreen ? "small" : "medium"}
                sx={{ fontSize: isSmallScreen ? "16px" : "18px" }}
              />
            </IconButton>
          }
        /> */}
      </Box>
    </Paper>
  );
};

export default LiveOrdersSlider;
