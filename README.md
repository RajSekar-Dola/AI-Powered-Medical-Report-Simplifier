# 🏥 AI Medical Report Simplifier

A powerful web application that transforms complex medical reports into easy-to-understand explanations using OCR technology and AI-powered summarization.

![Medical Report Simplifier](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## 🌟 Features

- **📄 Text Input Processing** - Paste medical text directly for instant analysis
- **🖼️ OCR Image Processing** - Upload medical report images and extract text using Tesseract.js
- **🤖 Intelligent Simplification** - Convert complex medical jargon into patient-friendly explanations
- **🔒 Secure & Private** - Built-in security with Helmet.js and rate limiting
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **⚡ Real-time Processing** - Fast text extraction and summarization
- **🎯 User-Friendly Interface** - Clean, intuitive design with tabbed navigation

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RajSekar-Dola/AI-Powered-Medical-Report-Simplifier.git
   cd medical-document-processor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **Tesseract.js** - OCR text extraction
- **Built-in AI** - Intelligent text summarization
- **Multer** - File upload handling
- **Joi** - Input validation
- **Helmet.js** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting protection

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with modern features
- **Vanilla JavaScript** - Client-side interactions
- **Font Awesome** - Icons
- **Responsive Design** - Mobile-friendly interface

## 📁 Project Structure

```
medical-document-processor/
├── public/
│   ├── index.html          # Main HTML file
│   ├── script.js           # Client-side JavaScript
│   └── styles.css          # Application styles
├── src/
│   ├── controllers/
│   │   └── medicalController.js    # Main controller logic
│   ├── data/
│   │   └── medicalTestsDatabase.js # Medical terminology database
│   ├── middleware/
│   │   └── errorHandler.js         # Error handling middleware
│   ├── routes/
│   │   └── medicalRoutes.js        # API routes
│   ├── services/
│   │   ├── normalizationService.js # Text normalization
│   │   ├── ocrService.js           # OCR processing
│   │   └── summaryService.js       # AI summarization
│   └── utils/
│       ├── typoCorrection.js       # Text correction utilities
│       └── validation.js           # Input validation
├── eng.traineddata         # Tesseract language data
├── package.json            # Dependencies and scripts
├── server.js              # Express server setup
└── README.md              # This file
```

## 🔧 API Endpoints

### POST `/api/medical/process-text`
Process medical text directly.

**Request Body:**
```json
{
  "text": "Your medical text here"
}
```

**Response:**
```json
{
  "originalText": "...",
  "simplifiedText": "...",
  "keyTerms": [...],
  "processingTime": "1.2s"
}
```

### POST `/api/medical/process-image`
Process medical report images using OCR.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "extractedText": "...",
  "simplifiedText": "...",
  "keyTerms": [...],
  "processingTime": "3.5s"
}
```

## 🌐 Deployment

### Using ngrok (Development)
1. Install ngrok: `npm install -g ngrok`
2. Start your server: `npm start`
3. In another terminal: `ngrok http 3000`
4. Share the provided ngrok URL

### Production Deployment
Consider these platforms for production deployment:
- **Heroku** - Easy deployment with git
- **Vercel** - Optimized for Node.js applications
- **Railway** - Simple deployment pipeline
- **DigitalOcean** - VPS hosting
- **AWS/GCP/Azure** - Enterprise cloud solutions

## ⚙️ Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Security Features
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS Protection** - Configurable cross-origin settings
- **Content Security Policy** - XSS protection
- **File Upload Limits** - 10MB maximum file size


## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **Tesseract.js** team for OCR capabilities
- **Express.js** community for the robust web framework
- Medical professionals who provided terminology insights

---

**Made with ❤️ for better healthcare communication**
