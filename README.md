# Demand Forecast AI - E-commerce Prediction System

**Author:** Lucas Andre S

A professional AI-powered demand forecasting platform for e-commerce businesses. Predict future product demand using machine learning, analyze trends, seasonality, and optimize inventory management with real-time analytics.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-22-green)

## 🚀 Features

### Machine Learning & Analytics
- **Demand Prediction Engine**: Advanced ML algorithms for accurate sales forecasting
- **Trend Analysis**: Identify increasing, decreasing, or stable trends with confidence scores
- **Seasonality Detection**: Automatically detect seasonal patterns and peak periods
- **Confidence Scoring**: Each prediction includes confidence levels (50-90%)

### Product Management
- **Complete CRUD Operations**: Create, read, update, and delete products
- **Inventory Tracking**: Monitor current stock levels in real-time
- **Category Organization**: Organize products by categories for better insights
- **SKU Management**: Track products with unique SKU identifiers

### Data Import & Processing
- **CSV Upload**: Import historical sales data from CSV files
- **JSON Support**: Flexible JSON format for bulk data import
- **Automatic Processing**: ML engine processes data automatically after upload
- **Data Validation**: Built-in validation ensures data quality

### Interactive Dashboard
- **Real-time KPIs**: Total products, revenue, predictions, and active alerts
- **Visual Charts**: Area charts, line charts, and bar charts for data visualization
- **Recent Sales**: Track last 7 days of sales performance
- **Alert Notifications**: Immediate notifications for critical events

### Smart Alerts System
- **High Demand Alerts**: Notified when demand spikes are predicted
- **Low Demand Warnings**: Get alerts for declining demand trends
- **Stock Alerts**: Automatic warnings when stock may run out
- **Trend Change Notifications**: Stay informed about significant trend shifts

## 🎨 Design

- **Modern Dark Theme**: Professional deep blue and electric purple color scheme
- **Glassmorphism Effects**: Elegant translucent cards with backdrop blur
- **Responsive Layout**: Fully responsive design for desktop, tablet, and mobile
- **Smooth Animations**: Subtle animations and transitions for better UX
- **Custom Scrollbars**: Styled scrollbars matching the theme

## 🛠️ Tech Stack

### Frontend
- **React 19**: Latest React with hooks and modern patterns
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Recharts**: Interactive charts and data visualization
- **tRPC**: End-to-end typesafe APIs
- **Wouter**: Lightweight routing

### Backend
- **Node.js 22**: Latest LTS version
- **Express 4**: Web application framework
- **tRPC 11**: Type-safe API layer
- **Drizzle ORM**: TypeScript ORM for MySQL
- **MySQL/TiDB**: Relational database

### Machine Learning
- **Custom ML Engine**: Statistical time series analysis
- **Linear Regression**: Trend analysis and prediction
- **Moving Averages**: Data smoothing and noise reduction
- **Seasonality Detection**: Pattern recognition algorithms

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/lucasandre16112000-png/demand-forecast-ai.git
cd demand-forecast-ai

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

## 🚀 Usage

### 1. Add Products
Navigate to **Produtos** and click **Novo Produto** to add your products with:
- Name, SKU, Category
- Price and current stock
- Description

### 2. Upload Historical Data
Go to **Upload de Dados** and upload your sales history:

**CSV Format:**
```csv
date,quantity,revenue
2024-01-01,10,1500.00
2024-01-02,15,2250.00
```

**JSON Format:**
```json
[
  {
    "date": "2024-01-01",
    "quantity": 10,
    "revenue": 1500.00
  }
]
```

### 3. Generate Forecasts
Visit **Previsões**, select a product, and click **Gerar Previsões**:
- Choose forecast period (1-90 days)
- View trend analysis
- Check seasonality patterns
- See confidence scores

### 4. Monitor Alerts
Check **Alertas** for important notifications:
- High/low demand predictions
- Stock level warnings
- Trend change alerts

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Check TypeScript types
pnpm check
```

## 📊 API Documentation

### Products
- `products.list` - Get all products
- `products.get` - Get product by ID
- `products.create` - Create new product
- `products.update` - Update product
- `products.delete` - Delete product

### Sales
- `sales.list` - Get all sales history
- `sales.byProduct` - Get sales by product ID
- `sales.create` - Add single sale
- `sales.bulkCreate` - Import multiple sales

### Forecasts
- `forecasts.list` - Get all forecasts
- `forecasts.byProduct` - Get forecasts by product
- `forecasts.generate` - Generate new forecasts
- `forecasts.analyze` - Get trend and seasonality analysis

### Alerts
- `alerts.list` - Get all alerts
- `alerts.markAsRead` - Mark alert as read
- `alerts.delete` - Delete alert
- `alerts.generate` - Generate alerts for product

### Dashboard
- `dashboard.overview` - Get dashboard metrics and charts

## 🔐 Security

- **Authentication**: Manus OAuth integration
- **Authorization**: Role-based access control (admin/user)
- **Session Management**: Secure HTTP-only cookies
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Drizzle ORM parameterized queries

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Optimistic Updates**: Instant UI feedback
- **Caching**: React Query caching strategy
- **Code Splitting**: Reduced initial bundle size
- **Database Indexing**: Optimized queries

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**Lucas Andre S**
- GitHub: [@lucasandre16112000-png](https://github.com/lucasandre16112000-png)
- Portfolio: [Your Portfolio URL]

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world e-commerce challenges
- Designed for scalability and performance

---

**Made with ❤️ by Lucas Andre S**
