# Use the official Node.js image as the base image
FROM mcr.microsoft.com/playwright:focal

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies, including Playwright
RUN npm install

# Copy the rest of your application files
COPY . .

# Install Playwright dependencies (browsers)
RUN npx playwright install

# Define the command to run your Playwright tests or app
CMD ["npm", "run", "test"]
