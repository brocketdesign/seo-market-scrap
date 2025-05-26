# SEO Market Scraper System

A fully functional e-commerce scraper system for Amazon and Rakuten platforms with a modern admin interface.

## Features

- **Robust Scraping Service**: Configure stealth browser options, proxies, and user agents
- **Modern Admin Dashboard**: Intuitive interface with sidebar navigation
- **Dedicated Pages**:
  - Scraper page for manual product scraping
  - Cron job management for scheduling automated tasks
  - Product management with filtering, search and pagination
  - Settings page for system configuration
- **Database Integration**: Store scraped products efficiently
- **Scheduler**: Run cron jobs at scheduled times
- **Data Retention**: Configure how long to keep scraped data

## System Architecture

### Backend

- Node.js/Express.js REST API
- MongoDB database
- Puppeteer for headless browser scraping
- Background services for scheduling and cleanup tasks

### Frontend

- Next.js with React 
- TypeScript for type safety
- Modern UI with responsive design
- Authentication with NextAuth.js

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- MongoDB (local or remote connection)
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/seo-market-scrap.git
   cd seo-market-scrap
   ```

2. Run the startup script:
   ```
   chmod +x startup.sh
   ./startup.sh
   ```

3. Access the admin interface:
   - URL: http://localhost:3000/admin
   - Default login (if using the provided scripts):
     - Username: admin@example.com
     - Password: password123

### Manual Setup

If you prefer manual setup over the startup script:

1. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Configure environment variables:
   - Create `.env` file in `backend` directory
   - Create `.env.local` file in `frontend` directory
   - See example configurations in the respective directories

4. Start the servers:
   ```
   # From backend directory
   npm run dev
   
   # From frontend directory (in another terminal)
   npm run dev
   ```

## Usage

### Scraping Products

1. Navigate to Scraper page
2. Enter a keyword or URL to scrape
3. Select the source (Amazon, Rakuten, or both)
4. Click "Start Scraping" and wait for results

### Scheduling Jobs

1. Go to Cron Jobs page
2. Click "Create New Job"
3. Enter job details including:
   - Name
   - Keyword or URL
   - Source
   - Schedule (cron expression)
4. Save the job to schedule it

### Managing Products

1. Visit Products page to see all scraped items
2. Use filters to narrow down results
3. Export or delete products as needed
4. View detailed information for each product

### System Configuration

1. Access Settings page
2. Configure scraper, dashboard, notification, and system settings
3. Save changes to apply new configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with [Next.js](https://nextjs.org/)
- Scraping powered by [Puppeteer](https://pptr.dev/)
- Database managed with [MongoDB](https://www.mongodb.com/)
- UI components from [Tailwind CSS](https://tailwindcss.com/)
