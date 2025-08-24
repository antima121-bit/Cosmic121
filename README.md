# 🚀 Mythos Engine 
**Transform simple mythological scene descriptions into stunning comic book panels using AI**

The Mythos Engine is a production-ready application that combines advanced AI with Indian mythology to create authentic, culturally-sensitive comic panels. Built with Next.js, TypeScript, and OpenAI's latest models.

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Script Generation**: GPT-4 creates authentic mythological narratives
- **DALL-E 3 Image Generation**: High-quality comic book style artwork
- **Character Recognition**: Automatic detection and styling of mythological figures
- **Cultural Authenticity**: Built-in validation for respectful representation

### 🛡️ Production Features
- **Content Safety**: OpenAI moderation API integration
- **Rate Limiting**: Configurable API usage limits
- **Quality Validation**: Multi-dimensional content quality assessment
- **Error Handling**: Comprehensive error handling and recovery
- **Performance**: Optimized for production workloads

### 🎨 Advanced Capabilities
- **Style Optimization**: Dynamic style selection based on scene type
- **Cultural Context**: Automatic enhancement of cultural elements
- **Mythological Accuracy**: Validation against traditional sources
- **Visual Coherence**: AI-powered visual consistency checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- pnpm (recommended) or npm

### 1. Clone and Install
```bash
git clone <repository-url>
cd mythos-engine
pnpm install
```

### 2. Environment Setup
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Customize as needed
OPENAI_MODEL=gpt-4-turbo-preview
CONTENT_SAFETY_ENABLED=true
QUALITY_VALIDATION_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=10
```

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
pnpm build
pnpm start
```


### Advanced Configuration

The application automatically detects your environment and applies appropriate settings:

- **Development**: Debug logging, relaxed validation, mock fallbacks
- **Production**: Error logging only, strict validation, full AI integration

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component library

### Backend
- **API Routes**: Serverless API endpoints
- **AI Integration**: OpenAI GPT-4 + DALL-E 3
- **Rate Limiting**: In-memory rate limiting
- **Content Safety**: OpenAI moderation API

### Core Systems
- **Character Recognition**: Automatic mythological figure detection
- **Style Optimization**: Dynamic prompt enhancement
- **Quality Validation**: Multi-dimensional content assessment
- **Cultural Safety**: Respectful representation validation

## 📚 Usage

### Basic Usage

1. **Enter Scene Description**: Describe a mythological moment (5-15 words)
2. **Select Style**: Choose from Vibrant, Earth, or Divine color palettes
3. **Generate**: AI creates script and image automatically
4. **Review**: Check quality scores and suggestions
5. **Download**: Save your comic panel

### Example Scenes

```
"Krishna lifts the Govardhan Hill to protect villagers"
"Hanuman leaps across the ocean carrying the mountain"
"Shiva opens his third eye, cosmic destruction begins"
"Durga battles the buffalo demon Mahishasura"
"Ganesha writes the Mahabharata as Vyasa dictates"
```

### Advanced Features

- **Character Auto-Detection**: Automatically recognizes and styles mythological figures
- **Cultural Enhancement**: Adds authentic cultural context and details
- **Quality Scoring**: Provides detailed quality metrics and improvement suggestions
- **Style Optimization**: Automatically enhances prompts for better results

## 🔒 Security & Safety

### Content Filtering
- **OpenAI Moderation**: Real-time content safety checks
- **Cultural Sensitivity**: Automatic detection of inappropriate content
- **Mythological Accuracy**: Validation against traditional sources

### Rate Limiting
- **Per-IP Limits**: Configurable request limits per user
- **Endpoint Protection**: Separate limits for script and image generation
- **Abuse Prevention**: Automatic blocking of excessive requests

### Data Privacy
- **No Storage**: Generated content is not permanently stored
- **Local Gallery**: User panels saved only in browser localStorage
- **API Security**: Secure OpenAI API integration

## 📊 Quality Assurance

### Validation Layers

1. **Content Safety**: OpenAI moderation API
2. **Mythological Accuracy**: Character and concept validation
3. **Cultural Authenticity**: Respectful representation checks
4. **Visual Coherence**: Logical consistency validation
5. **Storytelling Quality**: Narrative structure assessment

### Quality Metrics

- **Overall Score**: 0-100 quality rating
- **Category Scores**: Individual scores for each validation area
- **Issue Detection**: Specific problems and suggestions
- **Improvement Tips**: Actionable advice for better results

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub/GitLab repo
2. **Environment Variables**: Set all required environment variables
3. **Deploy**: Automatic deployment on push to main branch

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start

# Or use PM2 for process management
pm2 start npm --name "mythos-engine" -- start
```

## 📈 Monitoring & Analytics

### Built-in Metrics
- **Generation Success Rate**: Track successful vs failed generations
- **Quality Scores**: Monitor content quality over time
- **Rate Limit Usage**: Track API usage patterns
- **Error Rates**: Monitor system health

### External Monitoring
- **Logs**: Structured logging for production debugging
- **Health Checks**: API endpoint health monitoring
- **Performance**: Response time and throughput metrics

## 🔧 Troubleshooting

### Common Issues

#### OpenAI API Errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Verify API quota
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

#### Rate Limiting
- Check your current usage in the API response
- Wait for the reset time shown in error messages
- Consider upgrading your OpenAI plan

#### Quality Issues
- Review the quality validation suggestions
- Adjust your scene description for better results
- Use the character recognition system for authentic details

### Debug Mode

Enable debug logging in development:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

### Development Setup
```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Code Standards
- **TypeScript**: Full type safety required
- **ESLint**: Follow project linting rules
- **Prettier**: Consistent code formatting
- **Tests**: Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the AI models and APIs
- **Indian Mythology**: For the rich cultural heritage and stories
- **Amar Chitra Katha**: For inspiring the comic book aesthetic
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/antima121-bit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/antima121-bitdiscussions)
- **Documentation**: [Wiki](https://github.com/antima121-bit/wiki)

---

**Made with ❤️ for Indian mythology and AI innovation**

