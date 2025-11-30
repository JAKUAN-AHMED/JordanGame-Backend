# Jordan-Backend

A robust, scalable Node.js/TypeScript backend application with comprehensive features including authentication, file management, payment processing, and internationalization support.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [AWS Integration](#aws-integration)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control, Google and Facebook OAuth, OTP verification
- 🗂️ **File Management**: Advanced file upload with S3 integration, including image compression, video-to-HLS conversion, and audio processing
- 💳 **Payment Processing**: Stripe integration for subscription management and payments
- 🌍 **Internationalization**: i18n support for multiple languages
- 📊 **Dashboard & Analytics**: Comprehensive dashboard with content management and reporting
- 🔔 **Notifications**: Real-time notifications using Socket.IO
- 🛡️ **Security**: Helmet, CORS, rate limiting, XSS protection
- 📚 **API Documentation**: Auto-generated Swagger documentation
- 📈 **Logging**: Winston-based logging with daily rotation
- 🧹 **Cron Jobs**: Automated background jobs using node-cron
- 🗃️ **Database**: MongoDB with Mongoose ODM
- 🔍 **Search & Filter**: Advanced query builder for database operations

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Typed superset of JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB Object Document Mapper
- **Socket.IO** - Real-time bidirectional event-based communication

### Authentication & Security
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for stateless authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **XSS Clean** - Cross-site scripting prevention

### File Management
- **Multer** - File upload middleware
- **Sharp** - Image processing
- **FFmpeg** - Audio/video processing
- **AWS S3** - Cloud storage
- **@aws-sdk/client-s3** - AWS SDK for S3 operations

### Development & Code Quality
- **ESLint** - JavaScript/TypeScript linter
- **Prettier** - Code formatter
- **TypeScript** - Static type checking

### Additional Libraries
- **Stripe** - Payment processing
- **Nodemailer** - Email sending
- **i18next** - Internationalization framework
- **Winston** - Logging library
- **Swagger** - API documentation
- **Zod** - Schema validation
- **Validator** - String validation
- **Cors** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **UUID** - Unique identifier generation
- **Face-api.js** - Face recognition API
- **Date-fns** - Date utility functions

## Project Structure

```
jordan-backend/
├── dist/                    # Compiled TypeScript files
├── node_modules/            # Dependencies
├── src/
│   ├── app.ts              # Express application setup
│   ├── server.ts           # Server initialization
│   ├── aws/                # AWS configuration
│   │   └── awsConfig.ts
│   ├── builder/            # Query builder utilities
│   │   └── QueryBuilder.ts
│   ├── config/             # Configuration files
│   │   ├── index.ts
│   │   └── passport.ts
│   ├── data/               # Seed data (demo data)
│   │   ├── collectionsData.ts
│   │   ├── contentData.ts
│   │   └── ...
│   ├── errors/             # Custom error handlers
│   │   ├── AppError.ts
│   │   └── ...
│   ├── helpers/            # Helper functions
│   │   ├── S3Service.ts    # S3 file operations
│   │   ├── emailService.ts
│   │   └── ...
│   ├── i18n/               # Internationalization
│   │   └── i18n.ts
│   ├── jobs/               # Cron jobs
│   │   └── storyCleanup.ts
│   ├── middlewares/        # Express middlewares
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   └── ...
│   ├── modules/            # Feature modules
│   │   ├── action/
│   │   ├── auth/
│   │   ├── collections/
│   │   ├── contact/
│   │   ├── ContentManagement/
│   │   ├── dashboard/
│   │   ├── gameDashboard/
│   │   ├── notification/
│   │   ├── otp/
│   │   ├── package/
│   │   ├── settings/
│   │   ├── token/
│   │   └── Transactions/
│   ├── routes/             # API route definitions
│   │   └── index.ts
│   ├── scripts/            # Utility scripts
│   │   └── generate.js
│   ├── shared/             # Shared utilities
│   │   └── logger.ts
│   └── utils/              # Utility functions
│       └── seeder.ts       # Database seeder
├── uploads/                # File uploads directory
├── winston/                # Log files directory
├── demoData.json          # Demo data file
├── .env.example           # Environment variables example
├── .eslintrc             # ESLint configuration
├── .gitignore            # Git ignore rules
├── .prettierrc           # Prettier configuration
├── package.json
├── README.md
├── tsconfig.json         # TypeScript configuration
└── LICENSE
```

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Jordan-Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Update environment variables** as described in the [Environment Variables](#environment-variables) section

5. **Compile TypeScript:**
```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=8083
SOCKET=8082

# Database
MONGODB_URL=mongodb://localhost:27017/jordan-backend

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRATION_TIME=5d
JWT_REFRESH_EXPIRATION_TIME=365d

# Authentication
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=2
TOKEN_SECRET=your_token_secret
VERIFY_EMAIL_TOKEN_EXPIRATION_TIME=10m
RESET_PASSWORD_TOKEN_EXPIRATION_TIME=5m

# OTP Configuration
VERIFY_EMAIL_OTP_EXPIRATION_TIME=10
RESET_PASSWORD_OTP_EXPIRATION_TIME=5
MAX_OTP_ATTEMPTS=5
ATTEMPT_WINDOW_MINUTES=10

# Encryption
BCRYPT_SALT_ROUNDS=12

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Client
CLIENT_URL=http://localhost:3000
BACKEND_IP=localhost
SERVER_NAME=localhost

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8083/api/v1/auth/google/callback
FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:8083/api/v1/auth/facebook/callback

# Stripe
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Development

### Available Scripts

- `npm run dev` - Start the development server with auto-reload
- `npm run build` - Compile TypeScript files
- `npm run start` - Start the production server (requires build first)
- `npm run automate` - Run seed data, build, and start development server
- `npm run seed` - Seed the database with demo data
- `npm run generate` - Run the generate script
- `npm run lint:check` - Check code for linting issues
- `npm run lint:fix` - Fix linting issues
- `npm run prettier:check` - Check code formatting
- `npm run prettier:fix` - Format code

### Development Workflow

1. **Start development server:**
```bash
npm run dev
```

2. **Access API documentation:**
- Open `http://localhost:8083/api-docs` in your browser

3. **Test API endpoints:**
- The `/test` endpoint returns a welcome message
- The `/test/:lang` endpoint returns a translated welcome message (e.g., `/test/fr` for French)

## API Documentation

The API documentation is automatically generated using Swagger and available at:
```
http://localhost:8083/api-docs
```

### Core API Endpoints

- `GET /api/v1/test` - Health check and welcome message
- `GET /api/v1/test/:lang` - Welcome message with language support
- `POST /api/v1/auth/` - Authentication endpoints
- `POST /api/v1/user/` - User management
- `POST /api/v1/settings/` - Application settings
- `POST /api/v1/contact/` - Contact management
- `POST /api/v1/notification/` - Notification endpoints
- `POST /api/v1/content/` - Content management
- `POST /api/v1/package/` - Package management
- `POST /api/v1/action/` - Action endpoints
- `POST /api/v1/dashboard/` - Dashboard endpoints
- `POST /api/v1/gaming-dashboard/` - Gaming dashboard
- `POST /api/v1/collections/` - Collections management
- `POST /api/v1/transaction/` - Transaction endpoints

## AWS Integration

### S3 File Management

The application provides comprehensive S3 integration for file management:

- **Image Upload**: Automatic compression and optimization using Sharp
- **Video Upload**: Conversion to HLS format for streaming using FFmpeg
- **Audio Upload**: Compression and optimization using FFmpeg
- **Document Upload**: Support for PDF, DOC, DOCX, and TXT files
- **File Validation**: Type and size validation before upload
- **Secure URLs**: Generates secure, time-limited URLs for S3 objects
- **File Deletion**: Secure deletion of files from S3
- **Batch Operations**: Upload and delete multiple files

### AWS Configuration

The application uses the AWS SDK to interact with S3:

```typescript
// src/aws/awsConfig.ts
export const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: awsConfig.credentials,
});
```

## Deployment

### AWS Deployment Guide

This section describes how to deploy the Jordan-Backend application to AWS using EC2 and S3.

#### Prerequisites

- AWS Account
- Domain name (optional)
- SSL certificate (optional)

#### Deploying to AWS EC2

1. **Launch an EC2 Instance**
   - Choose an Amazon Linux 2 AMI
   - Select an instance type (t2.micro for testing, t2.small or larger for production)
   - Configure security groups to allow:
     - SSH (port 22) from your IP
     - HTTP (port 80) from anywhere (0.0.0.0/0)
     - HTTPS (port 443) from anywhere (0.0.0.0/0) if using SSL
     - Custom TCP (port 8083) from anywhere (0.0.0.0/0) for API access

2. **Connect to Your Instance**
```bash
ssh -i your-key-pair.pem ec2-user@your-ec2-public-ip
```

3. **Update System Packages**
```bash
sudo yum update -y
```

4. **Install Node.js and npm**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node
```

5. **Install Git**
```bash
sudo yum install git -y
```

6. **Clone Your Repository**
```bash
git clone YOUR_REPOSITORY_URL
cd Jordan-Backend
```

7. **Install Dependencies**
```bash
npm install
```

8. **Install PM2 for Process Management**
```bash
npm install -g pm2
```

9. **Create Environment File**
```bash
nano .env
```
Add your environment variables as described in the [Configuration](#configuration) section.

10. **Build the Application**
```bash
npm run build
```

11. **Start the Application with PM2**
```bash
pm2 start dist/server.js --name "jordan-backend"
pm2 startup
pm2 save
```

12. **Set up a Reverse Proxy with Nginx (Optional but Recommended)**
```bash
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
sudo systemctl enable nginx
sudo nano /etc/nginx/conf.d/jordan-backend.conf
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com; # Replace with your domain or remove if using IP

    location / {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

#### Setting up AWS S3

1. **Create an S3 Bucket**
   - Go to AWS S3 Console
   - Click "Create bucket"
   - Provide bucket name and select region
   - Uncheck "Block all public access" if required for your use case

2. **Configure Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

3. **Create an IAM User**
   - Go to AWS IAM Console
   - Create a new user with programmatic access
   - Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

4. **Update Environment Variables**
   - Use the access keys from the IAM user in your `.env` file

#### SSL Certificate (Optional)

1. **Request a Certificate in AWS Certificate Manager**
2. **Update Nginx Configuration for HTTPS:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Environment-Specific Deployment

For production deployment, make sure to:

1. Set `NODE_ENV=production` in your environment variables
2. Use a production-grade database
3. Implement proper security measures
4. Set up monitoring and logging
5. Use a reverse proxy (like Nginx)
6. Configure SSL certificates
7. Set up automated backups

## Contributing

We welcome contributions to the Jordan-Backend project! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Guidelines

- Follow TypeScript best practices
- Write clear, concise commit messages
- Maintain consistent code style (enforced by ESLint and Prettier)
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions about the application:

1. Check the [API Documentation](#api-documentation)
2. Review the [Configuration](#configuration) section
3. Create an issue in the repository
4. Contact the project author: [Jakuna Ahmed](mailto:jakuanultimate777@gmail.com)

---

Made with ❤️ by [Jakuna Ahmed](https://github.com/JAKUAN-AHMED)