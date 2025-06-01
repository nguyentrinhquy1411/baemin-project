"use client";

import Link from "next/link";
import { Card, Row, Col } from "antd";
import { 
  ShopOutlined, 
  AppstoreOutlined, 
  OrderedListOutlined,
  BarChartOutlined,
  SettingOutlined 
} from "@ant-design/icons";

export default function StoreManagementPage() {
  const menuItems = [
    {
      title: "Quản lý món ăn",
      description: "Thêm, sửa, xóa các món ăn trong cửa hàng",
      icon: <AppstoreOutlined className="text-4xl text-orange-500" />,
      href: "/store-management/foods",
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "Quản lý cửa hàng",
      description: "Thông tin và cài đặt cửa hàng",
      icon: <ShopOutlined className="text-4xl text-blue-500" />,
      href: "/store-management/stalls",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Quản lý đơn hàng",
      description: "Theo dõi và xử lý đơn hàng",
      icon: <OrderedListOutlined className="text-4xl text-green-500" />,
      href: "/store-management/orders",
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Thống kê báo cáo",
      description: "Xem báo cáo doanh thu và thống kê",
      icon: <BarChartOutlined className="text-4xl text-purple-500" />,
      href: "/store-management/analytics",
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "Cài đặt",
      description: "Cài đặt tài khoản và thông báo",
      icon: <SettingOutlined className="text-4xl text-gray-500" />,
      href: "/store-management/settings",
      color: "bg-gray-50 border-gray-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Quản lý cửa hàng
          </h1>
          <p className="text-lg text-gray-600">
            Quản lý toàn bộ hoạt động kinh doanh của bạn tại một nơi
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {menuItems.map((item, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Link href={item.href}>
                <Card
                  hoverable
                  className={`h-full transition-all duration-300 hover:shadow-lg ${item.color}`}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div className="text-center">
                    <div className="mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tổng quan nhanh
          </h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-orange-500">-</div>
                <div className="text-gray-600">Tổng món ăn</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-blue-500">-</div>
                <div className="text-gray-600">Đơn hàng hôm nay</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-green-500">-</div>
                <div className="text-gray-600">Doanh thu tháng</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-purple-500">-</div>
                <div className="text-gray-600">Đánh giá TB</div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
