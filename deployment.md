# HelpUs Investment Platform - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/helpus-investment.git
cd helpus-investment

# Install dependencies
npm run install:all

# Setup environment files
cp .env.example .env
# Edit .env with your configuration

# Setup database
mysql -u root -p < database/setup.sql

# Start development servers
npm run dev