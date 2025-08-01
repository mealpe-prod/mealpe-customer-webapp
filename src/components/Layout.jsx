import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import NavbarLogo from "../assets/NavbarLogo.png";
import HomeSvg from "./Svgs/HomeSvg";
import FavoriteSvg from "./Svgs/FavoriteSvg";
import CartSvg from "./Svgs/CartSvg";
import ProfileSvg from "./Svgs/ProfileSvg";
import NavLogoSvg from "./Svgs/NavLogoSvg";
import { useState, useEffect, useRef } from "react";
import DummyImage from "../assets/mealpe.png";
import BrandLogo from "../assets/brandLogo.png";
import OrderSvg from "./Svgs/OrderSvg";
import { selectCartItemsCount } from "../redux/slices/cartSlice";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [svgSize, setSvgSize] = useState({ width: 22, height: 22 });
  const [logoSize, setLogoSize] = useState({ width: 90, height: 91 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const mainRef = useRef(null);

  // Function to trigger vibration on mobile devices
  const handleVibration = () => {
    // Check if the Vibration API is supported
    if (navigator.vibrate) {
      // Vibrate for 50ms
      navigator.vibrate(50);
    }
  };

  // Update SVG sizes based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024);

      if (width < 375) {
        // Smaller screens - keep icons relatively large for better visibility
        setSvgSize({ width: 20, height: 20 });
        setLogoSize({ width: 80, height: 81 });
      } else if (width >= 375 && width < 640) {
        // Medium screens - slightly larger icons
        setSvgSize({ width: 20, height: 20 });
        setLogoSize({ width: 80, height: 81 });
      } else if (width >= 640 && width < 1024) {
        // Tablet screens
        setSvgSize({ width: 24, height: 24 });
        setLogoSize({ width: 90, height: 91 });
      } else {
        // Desktop screens
        setSvgSize({ width: 28, height: 28 });
        setLogoSize({ width: 140, height: 141 });
      }
    };

    // Initial size setup
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure main content container scrolls to top when location changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("userToken");
    localStorage.removeItem("campusData");
    localStorage.removeItem("cityData");
    navigate("/login");
  };

  // Only show navigation when user is logged in and not on OTP verification page
  const showNav = !!user && location.pathname !== "/otp-verification";

  // Desktop sidebar navigation
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
      <div className="flex items-center justify-center px-4">
        <img src={BrandLogo} alt="MedMeals Logo" className="h-9 w-auto" />
      </div>
      <div className="mt-8 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-4 space-y-4">
          <Link
            to="/home"
            className={`flex items-center px-2 py-3 text-sm font-medium rounded-[12px] active:scale-95 transition-transform duration-200 ${
              location.pathname === "/home"
                ? "bg-[#FFF1EE] text-[#FF583A]"
                : "hover:bg-[#FFF1EE]"
            }`}
          >
            <HomeSvg
              color={location.pathname === "/home" ? "#FF583A" : "#000000"}
              isActive={location.pathname === "/home"}
              width={svgSize.width - 8}
              height={svgSize.height - 8}
            />
            <span
              className={`${
                location.pathname === "/home"
                  ? "text-[#FF583A]"
                  : "text-[#000000]"
              } ml-3`}
            >
              Home
            </span>
          </Link>

          <Link
            to="/favorites"
            className={`flex items-center px-2 py-3 text-sm font-medium rounded-[12px] active:scale-95 transition-transform duration-200 ${
              location.pathname === "/favorites"
                ? "bg-[#FFF1EE] text-[#FF583A]"
                : "hover:bg-[#FFF1EE]"
            }`}
          >
            <FavoriteSvg
              color={location.pathname === "/favorites" ? "#FF583A" : "#000000"}
              isActive={location.pathname === "/favorites"}
              width={svgSize.width - 8}
              height={svgSize.height - 8}
            />
            <span
              className={`${
                location.pathname === "/favorites"
                  ? "text-[#FF583A]"
                  : "text-[#000000]"
              } ml-3`}
            >
              Favorites
            </span>
          </Link>

          <Link
            to="/orders"
            className={`flex items-center px-1 py-3 text-sm font-medium rounded-[12px] active:scale-95 transition-transform duration-200 ${
              location.pathname === "/orders"
                ? "bg-[#FFF1EE] text-[#FF583A]"
                : "hover:bg-[#FFF1EE]"
            }`}
          >
            <OrderSvg
              color={location.pathname === "/orders" ? "#FF583A" : "#000000"}
              isActive={location.pathname === "/orders"}
              width={svgSize.width - 4}
              height={svgSize.height - 4}
            />
            <span
              className={`${
                location.pathname === "/orders"
                  ? "text-[#FF583A]"
                  : "text-[#000000]"
              } ml-3`}
            >
              Orders
            </span>
          </Link>

          <Link
            to="/wallet"
            className={`flex items-center py-2 text-sm font-medium rounded-[12px] active:scale-95 transition-transform duration-200 ${
              location.pathname === "/wallet"
                ? "bg-[#FFF1EE] text-[#FF583A]"
                : "hover:bg-[#FFF1EE]"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#898989] mr-1.5 lg:w-9 lg:h-9">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 lg:h-6 lg:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke={location.pathname === "/wallet" ? "#FF583A" : "#000000"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span
              className={`text-md font-medium ${
                location.pathname === "/wallet"
                  ? "text-[#FF583A]"
                  : "text-[#000000]"
              }`}
            >
              My Wallet
            </span>
          </Link>

          <Link
            to="/cart"
            className={`flex items-center px-2 py-3 text-sm font-medium rounded-[12px] active:scale-95 transition-transform duration-200 ${
              location.pathname === "/cart"
                ? "bg-[#FFF1EE] text-[#FF583A]"
                : "hover:bg-[#FFF1EE]"
            }`}
          >
            <div className="relative">
              <CartSvg
                color={location.pathname === "/cart" ? "#FF583A" : "#000000"}
                isActive={location.pathname === "/cart"}
                width={svgSize.width - 8}
                height={svgSize.height - 8}
              />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF583A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </div>
            <span
              className={`${
                location.pathname === "/cart"
                  ? "text-[#FF583A]"
                  : "text-[#000000]"
              } ml-3`}
            >
              Cart
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="h-screen bg-white flex flex-col overflow-auto"
        ref={mainRef}
      >
        {showNav && isDesktop && location.pathname !== "/allow-location" && <DesktopSidebar />}

        <main
          className={`flex-grow flex flex-col ${
            showNav && isDesktop ? "lg:ml-64" : ""
          } ${showNav && !isDesktop ? "pb-16" : "pb-4"}`}
        >
          <div className="w-full max-w-[500px] mx-auto sm:px-6 lg:px-8 lg:max-w-full xl:max-w-full">
            {children}
          </div>
        </main>

        {showNav && !isDesktop && location.pathname !== "/cart" && location.pathname !== "/payment-success" && location.pathname !== "/payment-failed" && location.pathname !== "/allow-location" && location.pathname !== "/orders/review" && !document.body.classList.contains('hide-footer-nav') && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
            <nav className="w-full max-w-[500px] bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
              <div className="px-3 py-2">
                <div className="flex justify-between items-center">
                  <Link
                    to="/home"
                    className="flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-transform duration-200"
                    onClick={handleVibration}
                  >
                    <div className="h-7 flex items-center justify-center">
                      <HomeSvg
                        color={
                          location.pathname === "/home" ? "#FF583A" : "#898989"
                        }
                        isActive={location.pathname === "/home"}
                        width={svgSize.width}
                        height={svgSize.height}
                      />
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        location.pathname === "/home"
                          ? "text-[#FF583A]"
                          : "text-[#898989]"
                      }`}
                    >
                      Home
                    </span>
                  </Link>

                  <Link
                    to="/favorites"
                    className="flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-transform duration-200"
                    onClick={handleVibration}
                  >
                    <div className="h-7 flex items-center justify-center">
                      <FavoriteSvg
                        color={
                          location.pathname === "/favorites"
                            ? "#FF583A"
                            : "#898989"
                        }
                        isActive={location.pathname === "/favorites"}
                        width={svgSize.width}
                        height={svgSize.height}
                      />
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        location.pathname === "/favorites"
                          ? "text-[#FF583A]"
                          : "text-[#898989]"
                      }`}
                    >
                      Favorites
                    </span>
                  </Link>

                  <div className="flex-1 flex justify-center relative cursor-pointer z-30">
                    <div
                      onClick={() => {
                        navigate("/orders");
                        handleVibration();
                      }}
                      className="absolute -top-[4.5rem] w-[8rem] h-[8rem] rounded-full flex items-center justify-center z-50"
                      style={{ pointerEvents: "auto" }}
                    >
                      <NavLogoSvg
                        width={logoSize.width}
                        height={logoSize.height}
                      />
                      {/* <img src={NavbarLogo} width={logoSize.width}
                        height={logoSize.height}/> */}
                    </div>
                  </div>

                  <Link
                    to="/wallet"
                    className="flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-transform duration-200"
                    onClick={handleVibration}
                  >
                    <div className="h-7 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={
                          location.pathname === "/wallet"
                            ? "#FF583A"
                            : "#898989"
                        }
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.6}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        location.pathname === "/wallet"
                          ? "text-[#FF583A]"
                          : "text-[#898989]"
                      }`}
                    >
                      Wallet
                    </span>
                  </Link>

                  <Link
                    to="/cart"
                    className="flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-transform duration-200"
                    onClick={handleVibration}
                  >
                    <div className="h-7 flex items-center justify-center relative">
                      <CartSvg
                        color={
                          location.pathname === "/cart" ? "#FF583A" : "#898989"
                        }
                        isActive={location.pathname === "/cart"}
                        width={svgSize.width}
                        height={svgSize.height}
                      />
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#FF583A] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemsCount > 99 ? "99+" : cartItemsCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        location.pathname === "/cart"
                          ? "text-[#FF583A]"
                          : "text-[#898989]"
                      }`}
                    >
                      Cart
                    </span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default Layout;
