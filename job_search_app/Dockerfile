# Sử dụng Node.js chính thức
FROM node:18

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Biên dịch dự án (nếu cần)
RUN npm run build

# Expose cổng API
EXPOSE 8000

# Chạy ứng dụng
CMD ["npm", "run", "start"]
