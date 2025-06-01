"use client";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import SearchService, { SearchSuggestion } from "@/services/search";
import {
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SolutionOutlined,
  UserOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { SearchProps } from "antd/es/input";
import Search from "antd/es/input/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeaderNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [searchValue, setSearchValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get current cart item count
  const cartItemCount = getCartItemCount();

  // Handle search input change with suggestions
  const handleSearchInputChange = async (value: string) => {
    setSearchValue(value);

    if (value.trim().length >= 2) {
      try {
        const suggestions = await SearchService.getSuggestions(value);
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    if (value.trim()) {
      // Save search history
      SearchService.saveSearchHistory(value.trim());
      // Navigate to search page with query parameter
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    } else {
      router.push("/search");
    }
    setShowSuggestions(false);
  };

  // Handle suggestion click - navigate directly to detail page
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    if (suggestion.type === "food") {
      router.push(`/detailfood/${suggestion.id}`);
    } else if (suggestion.type === "stall") {
      router.push(`/stall/${suggestion.id}`);
    }
  };

  const navigation = () => {
    router.push("/dashboard");
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log("HeaderNav - Logout button clicked");
    try {
      // Đợi hàm logout hoàn thành
      await logout();
      console.log("HeaderNav - Logout completed");
    } catch (error) {
      console.error("HeaderNav - Error during logout:", error);
    }
  };
  return (
    <div className="w-full h-fix bg-white flex flex-row fixed  py-3 gap-4 justify-items-center	justify-center z-50	">
      <div onClick={navigation} className="flex-none w-fit h-full ml-10 cursor-pointer ">
        <svg xmlns="http://www.w3.org/2000/svg" width="131" height="50" viewBox="0 0 131 27">
          <g fill="#3AC5C9" fillRule="evenodd">
            <path d="M45 0v27h18v-5.21H50.054v-5.685h8.837v-5.21h-8.837V5.21H63V0zM90 0v5.21h6.948v16.58H90V27h19v-5.21h-6.95V5.21H109V0zM11.86 11.132H5.046V5.21h6.64c1.895 0 2.824 1.162 2.824 2.961 0 1.8-.752 2.96-2.648 2.96m-.177 10.659H5.045V15.869h6.816c1.896 0 2.648 1.161 2.648 2.96 0 1.8-.929 2.96-2.825 2.96M19 8.645v-.947C19 3.434 15.77 0 11.76 0H0v27H11.76C15.769 27 19 23.566 19 19.303v-.947A6.287 6.287 0 0 0 16.74 13.5 6.285 6.285 0 0 0 19 8.644M119.319 0l6.25 16.536c.078.206.375.148.375-.072V0H131v27h-6.32l-6.247-16.526c-.079-.208-.379-.15-.379.073V27H113V0h6.319zM80.506 10.465l-1.702 6.255c-.647 2.379-3.96 2.378-4.606 0l-1.706-6.272c-.059-.216-.372-.173-.372.052V27H67V0h6.282l3.033 11.008c.053.192.32.192.372 0L79.72 0H86v27h-5.118V10.517c0-.228-.317-.271-.376-.052M28.572 16.715l2.742-11.59c.048-.2.326-.2.373 0l2.742 11.59h-5.857zm8.064-12.546a5.257 5.257 0 0 0-1.864-3C33.808.39 32.718 0 31.502 0c-1.244 0-2.342.39-3.293 1.169-.95.779-1.565 1.779-1.844 3L21 27h5.136l1.218-5.143h8.293L36.865 27H42L36.636 4.17z" />
          </g>
        </svg>
      </div>{" "}
      <div className="grow  flex flex-row items-center gap-9 relative">
        {/* <Select className="ml-10 w-28 	" ></Select> */}
        <div className="relative w-1/3 search-container">
          <Search
            className="w-full"
            placeholder="Tìm kiếm món ăn, quán ăn..."
            enterButton="Tìm kiếm"
            size="large"
            value={searchValue}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onSearch={onSearch}
          />

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {" "}
                  {suggestion.image_url && (
                    <Image
                      src={suggestion.image_url}
                      alt={suggestion.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{suggestion.name}</div>
                    {suggestion.category && <div className="text-xs text-gray-500">{suggestion.category}</div>}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {suggestion.type === "food" ? "Món ăn" : "Quán ăn"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>{" "}
      <div className="flex-none w-1/4  flex flex-row items-center  py-2">
        <Button
          href="/dashboard"
          className="font-normal leading-5 btn-home"
          style={{ fontSize: "18px", height: "100%", color: "rgb(128, 128, 137)" }}
          type="text"
          icon={<HomeOutlined />}
        >
          Trang Chủ
        </Button>

        {/* Store Dashboard Button for Store Owners */}
        {isAuthenticated && user?.role === "store" && (
          <Button
            href="/store-dashboard"
            className="font-normal leading-5 btn-home"
            style={{ fontSize: "18px", height: "100%", color: "#3AC5C9" }}
            type="text"
            icon={<ShopOutlined />}
          >
            Cửa hàng
          </Button>
        )}

        {isAuthenticated ? (
          <>
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    label: `Xin chào, ${user?.first_name || user?.username || "Người dùng"}`,
                    disabled: true,
                  },
                  {
                    key: "2",
                    label: "Thông tin tài khoản",
                    icon: <UserOutlined />,
                    onClick: () => router.push("/profile"),
                  },
                  {
                    key: "3",
                    label: "Lịch sử đơn hàng",
                    icon: <UnorderedListOutlined />,
                    onClick: () => router.push("/profile/orders"),
                  },
                  {
                    key: "4",
                    label: "Yêu thích",
                    icon: <HeartOutlined />,
                    onClick: () => router.push("/favorites"),
                  },                  ...(user?.role === "store"
                    ? [
                        {
                          key: "5",
                          label: "Dashboard Cửa hàng",
                          icon: <ShopOutlined />,
                          onClick: () => router.push("/store-dashboard"),
                        },
                        {
                          key: "5.1",
                          label: "Quản lý món ăn",
                          icon: <AppstoreOutlined />,
                          onClick: () => router.push("/store-management/foods"),
                        },
                      ]
                    : []),
                  {
                    key: "6",
                    label: "Đăng xuất",
                    icon: <LogoutOutlined />,
                    danger: true,
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Button
                className="font-normal leading-5 btn-home"
                style={{ fontSize: "18px", height: "100%", color: "rgb(128, 128, 137)" }}
                type="text"
                icon={<SolutionOutlined />}
              >
                {user?.first_name || user?.username || "Tài Khoản"}
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button
            href="/login"
            className="font-normal leading-5 btn-home"
            style={{ fontSize: "18px", height: "100%", color: "rgb(128, 128, 137)" }}
            type="text"
            icon={<SolutionOutlined />}
          >
            Đăng Nhập
          </Button>
        )}
        <Button
          href="/cart"
          type="text"
          style={{ fontSize: "20px", width: "40px", height: "100%", color: "#3AC5C9" }}
          icon={<ShoppingCartOutlined />}
        ></Button>
        {cartItemCount > 0 && (
          <span
            className="text-xs bg-red-600 relative rounded w-full text-white bottom-3 right-4 text-center"
            style={{ width: "15px", borderRadius: "50px" }}
          >
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </span>
        )}
      </div>
    </div>
  );
}
