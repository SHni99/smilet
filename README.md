# smilet

A smart quiz application powered by AI that generates personalized quiz questions on any topic.

## Features

- AI-powered question generation using Google Gemini
- Three difficulty levels (Easy, Medium, Hard)
- Optimized prompts for technical topics like software testing
- Deep dive mode for reviewing missed questions
- Beautiful, responsive UI with animations

## Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up your API key:**

   - Copy `.env.example` to `.env`
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key to `.env`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

1. Enter any topic you want to learn about
2. Select your preferred difficulty level
3. Let the AI generate personalized questions
4. Review your results and use the "Deep Dive" feature for missed questions

## Enhanced Question Generation

For technical topics like "Software Testing" on Hard difficulty, the app generates:

- Calculation questions for non-functional testing metrics
- Performance testing scenarios with numerical problems
- Test coverage percentage calculations
- Advanced testing strategy questions

## Tech Stack

- React + TypeScript
- Tailwind CSS + NextUI
- Google Gemini AI
- RSBuild
- React Router
