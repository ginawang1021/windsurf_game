"""
Browser configuration utility for Selenium tests.
Provides different browser setups for various testing needs.
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os


class BrowserConfig:
    
    @staticmethod
    def create_standard_driver():
        """Creates a standard Chrome WebDriver instance"""
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service)
    
    @staticmethod
    def create_visible_driver():
        """
        Creates a Chrome WebDriver with options for better visibility during testing.
        This configuration is ideal for debugging and watching tests execute.
        """
        chrome_options = Options()
        
        # Specify Chrome binary location on macOS
        chrome_options.binary_location = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        
        # Keep browser window open and visible
        chrome_options.add_experimental_option("useAutomationExtension", False)
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        
        # Set window size for better visibility
        chrome_options.add_argument("--window-size=1200,800")
        chrome_options.add_argument("--start-maximized")
        
        # Disable some features for cleaner testing
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        
        # Simple approach like Java: let webdriver-manager handle everything
        print("Setting up ChromeDriver...")
        ChromeDriverManager().install()
        return webdriver.Chrome(options=chrome_options)
    
    @staticmethod
    def create_headless_driver():
        """
        Creates a Chrome WebDriver in headless mode (no visible browser window).
        Good for CI/CD environments or when you don't need to see the browser.
        """
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        return webdriver.Chrome(service=service, options=chrome_options)
