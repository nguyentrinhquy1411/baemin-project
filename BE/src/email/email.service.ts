import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    stallName: string;
  }[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentMethod: string;
  notes?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }
  private createTransporter() {
    // Cấu hình cho Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'), // App password for Gmail
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification failed:', error);
      } else {
        this.logger.log('Email transporter is ready to send emails');
      }
    });
  }

  async sendOrderConfirmationEmail(
    orderData: OrderEmailData,
  ): Promise<boolean> {
    try {
      const htmlContent = this.generateOrderEmailHtml(orderData);

      const mailOptions = {
        from: `"Baemin Vietnam" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: orderData.customerEmail,
        subject: `Xác nhận đơn hàng #${orderData.orderId} - Baemin Vietnam`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Order confirmation email sent successfully to ${orderData.customerEmail}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  private generateOrderEmailHtml(orderData: OrderEmailData): string {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Xác nhận đơn hàng</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background-color: #f8f9fa; font-weight: bold; }
          .total-section { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .delivery-info { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍜 Baemin Vietnam</h1>
            <h2>Xác nhận đơn hàng</h2>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${orderData.customerName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại Baemin Vietnam! Đơn hàng của bạn đã được xác nhận.</p>
            
            <div class="order-info">
              <h3>📋 Thông tin đơn hàng</h3>
              <p><strong>Mã đơn hàng:</strong> #${orderData.orderId}</p>
              <p><strong>Ngày đặt:</strong> ${orderData.orderDate}</p>
              <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod}</p>
              ${orderData.notes ? `<p><strong>Ghi chú:</strong> ${orderData.notes}</p>` : ''}
            </div>

            <h3>🛍️ Chi tiết đơn hàng</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th>Cửa hàng</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.stallName}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="total-section">
              <h3>💰 Tổng thanh toán</h3>
              <p><strong>Tổng tiền món ăn:</strong> ${formatCurrency(orderData.totalAmount)}</p>
              <p><strong>Phí giao hàng:</strong> ${formatCurrency(orderData.shippingFee)}</p>
              <hr style="margin: 10px 0;">
              <p style="font-size: 18px;"><strong>Tổng cộng: ${formatCurrency(orderData.finalAmount)}</strong></p>
            </div>

            <div class="delivery-info">
              <h3>🚚 Thông tin giao hàng</h3>
              <p><strong>Người nhận:</strong> ${orderData.customerName}</p>
              <p><strong>Địa chỉ:</strong> ${orderData.deliveryAddress}</p>
              <p><strong>Số điện thoại:</strong> ${orderData.deliveryPhone}</p>
            </div>

            <p>Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất. Bạn sẽ nhận được thông báo khi có cập nhật về trạng thái đơn hàng.</p>
            
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua:</p>
            <ul>
              <li>Hotline: 1900 1900</li>
              <li>Email: support@baemin.vn</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>© 2025 Baemin Vietnam. All rights reserved.</p>
            <p>Email này được gửi tự động, vui lòng không trả lời email này.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
