# E-commerce Backend API

Express.js backend for e-commerce platform with PostgreSQL database and payment gateway integration.

## 🚀 Features

- **RESTful API** for purchase transactions
- **PostgreSQL** database integration with Neon
- **Payment Gateway** integration
- **Security middleware** (Helmet, CORS, Rate Limiting)
- **Environment-based configuration**
- **Ready for Render deployment**

## 📋 API Endpoints

### POST /api/compra
Create a new purchase transaction.

**Request Body:**
`json
{
  "Cedula": "string",
  "Precio_total": "number",
  "Bank": "string" (optional)
}
`

**Response:**
`json
{
  "success": true,
  "message": "Purchase transaction created successfully",
  "data": {
    "transactionId": "uuid",
    "cedula": "string",
    "amount": "number",
    "status": "string",
    "timestamp": "ISO-8601"
  }
}
`

## 🛠️ Setup & Installation

1. **Clone and install dependencies:**
   `ash
   npm install
   `

2. **Environment setup:**
   `ash
   cp .env.example .env
   # Edit .env with your configuration
   `

3. **Run development server:**
   `ash
   npm run dev
   `

4. **Run production server:**
   `ash
   npm start
   `

## 🚀 Deployment on Render

1. Connect your GitHub repository to Render
2. Use the provided ender.yaml configuration
3. Set environment variables in Render dashboard
4. Deploy!

## 📊 Database Schema

`sql
CREATE TABLE transactions (
    TransactionId VARCHAR(255) PRIMARY KEY,
    Cedula VARCHAR(255),
    Estado_trans VARCHAR(50),
    Precio_total DECIMAL(10, 2)
);
`

## 🔧 Environment Variables

See .env.example for all required environment variables.

## 🛡️ Security

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection

## 📞 Support

Built with ❤️ for National University of Colombia
