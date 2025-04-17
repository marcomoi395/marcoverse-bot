FROM node:23

# Cài đặt yt-dlp
RUN apt update && apt install -y yt-dlp

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép và cài đặt phụ thuộc
COPY package*.json ./
RUN npm ci

# Sao chép mã nguồn
COPY . .

# Mở cổng
EXPOSE 3001

# Lệnh chạy server
CMD ["node", "server.js"]
