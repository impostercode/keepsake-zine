import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:180000,workers:1,use:{baseURL:'http://127.0.0.1:4197',launchOptions:{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--no-sandbox']}},webServer:{command:'npm run dev -- --port 4197',url:'http://127.0.0.1:4197',reuseExistingServer:false}});
